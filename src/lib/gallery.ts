// src/lib/gallery.ts
// Client gallery system - uses Cloudinary ONLY (no external database)
// Metadata stored as context on a special _meta asset in each gallery folder

import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const CLIENTS_ROOT = process.env.CLOUDINARY_CLIENTS_ROOT || "clients";

// Configure cloudinary
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export { cloudinary };

export type GalleryMeta = {
  name: string;
  clientName?: string;
  password?: string; // Hashed password
  createdAt: string;
  active: boolean;
};

export type GalleryImage = {
  src: string;
  thumbSrc: string;
  width: number;
  height: number;
  public_id: string;
};

export type ClientGallery = GalleryMeta & {
  slug: string;
  folder: string;
};

// Generate random slug for gallery URL
export function generateSlug(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate unique slug with collision detection
export async function generateUniqueSlug(maxAttempts = 5): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const slug = generateSlug();
    const existing = await getGalleryMeta(slug);
    if (!existing) {
      return slug;
    }
  }
  // If still colliding, use longer slug
  return generateSlug(12);
}

// --- Client gallery password hashing ------------------------------------
//
// Three stored formats exist. Only the newest is ever written; the other two
// are verify-only so that passwords already handed to clients keep working.
//
//   h_<base36>                           legacy, non-cryptographic
//   p_<hashHex>                          PBKDF2, one process-wide salt
//   p2_<iterations>_<saltHex>_<hashHex>  PBKDF2, per-password random salt
//
// The process-wide salt of the `p_` era used to be read straight from
// ADMIN_SECRET, which tied the admin bearer token to every stored hash:
// rotating the token silently invalidated every client password. That salt
// now lives in its own variable, GALLERY_PASSWORD_SALT, with ADMIN_SECRET
// still accepted as a second candidate so deployments predating the split
// keep verifying.
//
// Deployment notes:
//   - Set GALLERY_PASSWORD_SALT to the ADMIN_SECRET value that was in effect
//     when the `p_` hashes were created, and ADMIN_SECRET becomes free to
//     rotate on its own schedule.
//   - `p2_` hashes carry their own salt and ignore both variables. Once every
//     gallery has been re-saved (see needsPasswordUpgrade), GALLERY_PASSWORD_SALT
//     can be removed entirely.
//   - There is deliberately no hardcoded default salt. A missing variable used
//     to fall back to a constant published in this repo, which quietly reduced
//     every hash to an unsalted one; it now throws instead.

const PBKDF2_ITERATIONS = 600_000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = "sha256";

// Fixed parameters of the `p_` format - never change these, they are what the
// already-stored hashes were derived with.
const LEGACY_GLOBAL_ITERATIONS = 10000;

// Upper bound on the iteration count read out of a stored `p2_` hash, so a
// corrupted or tampered metadata value cannot pin a request on the CPU.
const MAX_STORED_ITERATIONS = 5_000_000;

// Candidate salts for the `p_` format, in priority order. Both are tried
// rather than only the first: during the migration GALLERY_PASSWORD_SALT is
// filled in by hand, and a value that does not exactly match the ADMIN_SECRET
// the hashes were built with would otherwise lock every client out. A second
// 10k-iteration derivation costs ~1ms and lets the untouched ADMIN_SECRET
// still let them in - at which point the hash is upgraded and the ambiguity
// disappears on its own.
function legacyGlobalSalts(): string[] {
  const candidates = [
    process.env.GALLERY_PASSWORD_SALT,
    process.env.ADMIN_SECRET,
  ].filter((s): s is string => !!s);

  if (candidates.length === 0) {
    throw new Error(
      "Cannot verify a legacy `p_` gallery password: neither GALLERY_PASSWORD_SALT " +
        "nor ADMIN_SECRET is set. Set GALLERY_PASSWORD_SALT to the ADMIN_SECRET value " +
        "that was in use when the gallery password was created."
    );
  }
  return [...new Set(candidates)];
}

function derive(password: string, salt: string, iterations: number): string {
  return crypto
    .pbkdf2Sync(password, salt, iterations, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString("hex");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length === 0 || bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Secure password hashing using PBKDF2 with a fresh random salt per password
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = derive(password, salt, PBKDF2_ITERATIONS);
  return `p2_${PBKDF2_ITERATIONS}_${salt}_${hash}`;
}

export function verifyPassword(input: string, stored: string): boolean {
  // Current format - salt and cost travel with the hash.
  if (stored.startsWith("p2_")) {
    const [iterStr, salt, hash] = stored.slice(3).split("_");
    if (!iterStr || !salt || !hash) return false;
    const iterations = Number(iterStr);
    if (
      !Number.isInteger(iterations) ||
      iterations < 1 ||
      iterations > MAX_STORED_ITERATIONS
    ) {
      return false;
    }
    return timingSafeEqualHex(derive(input, salt, iterations), hash);
  }

  // Legacy format - PBKDF2 against a process-wide salt.
  if (stored.startsWith("p_")) {
    const expected = stored.slice(2);
    return legacyGlobalSalts().some((salt) =>
      timingSafeEqualHex(derive(input, salt, LEGACY_GLOBAL_ITERATIONS), expected)
    );
  }

  // Legacy format - non-cryptographic hash that predates PBKDF2.
  if (stored.startsWith("h_")) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return stored === "h_" + Math.abs(hash).toString(36);
  }

  return false;
}

// True when a stored hash is in one of the verify-only legacy formats and
// should be rewritten the next time the plaintext password is available.
export function needsPasswordUpgrade(stored: string): boolean {
  return !stored.startsWith("p2_");
}

// Build optimized Cloudinary URLs
export function buildThumbUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_fill,w_600,g_auto/${publicId}`;
}

export function buildFullUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_80,c_limit,w_2000/${publicId}`;
}

// Get gallery metadata from Cloudinary folder - using Admin API for immediate results
export async function getGalleryMeta(slug: string): Promise<ClientGallery | null> {
  try {
    const folderPath = `${CLIENTS_ROOT}/${slug}`;
    const metaPublicId = `${folderPath}/_meta`;

    // Use Admin API to get the _meta resource directly (no indexing delay)
    try {
      const metaResource = await cloudinary.api.resource(metaPublicId, {
        resource_type: "image",
        context: true,
      });

      const context = metaResource.context?.custom || {};

      return {
        slug,
        folder: folderPath,
        name: context.name || slug,
        clientName: context.clientName || undefined,
        password: context.password || undefined,
        createdAt: context.createdAt || metaResource.created_at,
        active: context.active !== "false",
      };
    } catch (metaError: any) {
      // _meta file doesn't exist, check if folder has any images
      if (metaError?.error?.http_code === 404) {
        try {
          const folderImages = await cloudinary.api.resources({
            type: "upload",
            prefix: folderPath,
            max_results: 1,
            resource_type: "image",
          });

          if (folderImages.resources.length === 0) {
            return null;
          }

          // Folder exists but no meta - return basic info
          return {
            slug,
            folder: folderPath,
            name: slug,
            createdAt: new Date().toISOString(),
            active: true,
          };
        } catch {
          return null;
        }
      }
      throw metaError;
    }
  } catch (error) {
    console.error("Error getting gallery meta:", error);
    return null;
  }
}

// List all galleries (for admin)
export async function listAllGalleries(): Promise<ClientGallery[]> {
  try {
    // Get all subfolders in clients folder
    const result = await cloudinary.api.sub_folders(CLIENTS_ROOT);
    const galleries: ClientGallery[] = [];

    for (const folder of result.folders) {
      const slug = folder.name;
      const meta = await getGalleryMeta(slug);
      if (meta) {
        galleries.push(meta);
      }
    }

    // Sort by creation date
    galleries.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return galleries;
  } catch (error) {
    console.error("Error listing galleries:", error);
    return [];
  }
}

// Create or update gallery metadata
export async function saveGalleryMeta(
  slug: string,
  meta: Omit<GalleryMeta, "createdAt"> & { createdAt?: string }
): Promise<boolean> {
  try {
    const folderPath = `${CLIENTS_ROOT}/${slug}`;
    const metaPublicId = `${folderPath}/_meta`;

    // Create a 1x1 transparent pixel as metadata carrier
    const pixelBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    // Upload the meta file with context
    await cloudinary.uploader.upload(pixelBase64, {
      public_id: metaPublicId,
      overwrite: true,
      context: {
        name: meta.name,
        clientName: meta.clientName || "",
        password: meta.password || "",
        createdAt: meta.createdAt || new Date().toISOString(),
        active: meta.active ? "true" : "false",
      },
    });

    return true;
  } catch (error) {
    console.error("Error saving gallery meta:", error);
    return false;
  }
}

// Delete gallery
export async function deleteGallery(slug: string, deleteImages = false): Promise<boolean> {
  try {
    const folderPath = `${CLIENTS_ROOT}/${slug}`;

    if (deleteImages) {
      // Delete all resources in folder
      await cloudinary.api.delete_resources_by_prefix(folderPath);
      // Delete the folder
      try {
        await cloudinary.api.delete_folder(folderPath);
      } catch {
        // Folder may not exist
      }
    } else {
      // Just mark as inactive
      const meta = await getGalleryMeta(slug);
      if (meta) {
        await saveGalleryMeta(slug, { ...meta, active: false });
      }
    }

    return true;
  } catch (error) {
    console.error("Error deleting gallery:", error);
    return false;
  }
}

// List images in a gallery - using Admin API for immediate results (no indexing delay)
// Supports up to 1000 images via pagination (2 requests of 500 each)
export async function listGalleryImages(slug: string): Promise<GalleryImage[]> {
  try {
    const folderPath = `${CLIENTS_ROOT}/${slug}`;
    const allResources: any[] = [];

    // First request
    const res = await cloudinary.api.resources({
      type: "upload",
      prefix: folderPath,
      max_results: 500,
      resource_type: "image",
    });

    allResources.push(...res.resources);

    // If there's more, fetch second batch
    if (res.next_cursor) {
      const res2 = await cloudinary.api.resources({
        type: "upload",
        prefix: folderPath,
        max_results: 500,
        resource_type: "image",
        next_cursor: res.next_cursor,
      });
      allResources.push(...res2.resources);
    }

    return allResources
      .filter((r: any) => !r.public_id.endsWith("/_meta"))
      // Sort by upload time (newest first) - created_at is ISO string
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateA - dateB; // oldest first (chronological order)
      })
      .map((r: any) => ({
        src: buildFullUrl(r.public_id),
        thumbSrc: buildThumbUrl(r.public_id),
        width: r.width as number,
        height: r.height as number,
        public_id: r.public_id as string,
      }));
  } catch (error) {
    console.error("Error listing gallery images:", error);
    return [];
  }
}

// Generate upload signature for client-side uploads
export function generateUploadSignature(slug: string): {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
} {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `${CLIENTS_ROOT}/${slug}`;

  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: CLOUD_NAME,
    folder,
  };
}

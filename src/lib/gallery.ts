// src/lib/gallery.ts
// Client gallery system - uses Cloudinary ONLY (no external database)
// Metadata stored as context on a special _meta asset in each gallery folder

import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const CLIENTS_ROOT = process.env.CLOUDINARY_CLIENTS_ROOT || "clients";
const PASSWORD_SALT = process.env.ADMIN_SECRET || "studio-contrast-salt";

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

// Secure password hashing using PBKDF2
export function hashPassword(password: string): string {
  const hash = crypto
    .pbkdf2Sync(password, PASSWORD_SALT, 10000, 32, "sha256")
    .toString("hex");
  return "p_" + hash;
}

export function verifyPassword(input: string, stored: string): boolean {
  // Support both old (h_) and new (p_) hash formats for backward compatibility
  if (stored.startsWith("h_")) {
    // Old weak hash - still verify but it works
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return stored === "h_" + Math.abs(hash).toString(36);
  }
  // New secure hash
  return hashPassword(input) === stored;
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

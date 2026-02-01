// src/lib/gallery.ts
// Client gallery system - uses Cloudinary ONLY (no external database)
// Metadata stored as context on a special _meta asset in each gallery folder

import { v2 as cloudinary } from "cloudinary";

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

// Simple hash for password (basic protection)
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "h_" + Math.abs(hash).toString(36);
}

export function verifyPassword(input: string, stored: string): boolean {
  return hashPassword(input) === stored;
}

// Build optimized Cloudinary URLs
export function buildThumbUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_fill,w_600,g_auto/${publicId}`;
}

export function buildFullUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_80,c_limit,w_2000/${publicId}`;
}

// Get gallery metadata from Cloudinary folder
export async function getGalleryMeta(slug: string): Promise<ClientGallery | null> {
  try {
    const folderPath = `${CLIENTS_ROOT}/${slug}`;

    // Search for the _meta file in this folder
    const metaSearch = await cloudinary.search
      .expression(`folder=${folderPath} AND public_id:${folderPath}/_meta`)
      .with_field("context")
      .max_results(1)
      .execute();

    if (metaSearch.resources.length === 0) {
      // No meta file, check if folder exists with images
      const folderSearch = await cloudinary.search
        .expression(`folder=${folderPath} AND resource_type:image`)
        .max_results(1)
        .execute();

      if (folderSearch.resources.length === 0) {
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
    }

    const metaResource = metaSearch.resources[0];
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

// List images in a gallery
export async function listGalleryImages(slug: string): Promise<GalleryImage[]> {
  try {
    const folderPath = `${CLIENTS_ROOT}/${slug}`;

    const res = await cloudinary.search
      .expression(`folder=${folderPath} AND resource_type:image AND -public_id:*/_meta`)
      .sort_by("filename", "asc")
      .max_results(500)
      .execute();

    return (res.resources as any[])
      .filter((r) => !r.public_id.endsWith("/_meta"))
      .map((r) => ({
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

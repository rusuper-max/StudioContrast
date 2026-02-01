// src/app/api/gallery/create/route.ts
// Create a new client gallery (admin only) - Cloudinary only, no Redis

import { NextRequest, NextResponse } from "next/server";
import {
  generateSlug,
  hashPassword,
  saveGalleryMeta,
  generateUploadSignature,
} from "@/lib/gallery";

function isAdmin(req: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;
  return req.headers.get("x-admin-secret") === adminSecret;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, clientName, password } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate unique slug
    const slug = generateSlug();

    // Save metadata to Cloudinary
    const saved = await saveGalleryMeta(slug, {
      name,
      clientName,
      password: password ? hashPassword(password) : undefined,
      active: true,
    });

    if (!saved) {
      return NextResponse.json({ error: "Failed to create gallery" }, { status: 500 });
    }

    // Generate upload signature for client-side uploads
    const uploadConfig = generateUploadSignature(slug);

    return NextResponse.json({
      success: true,
      slug,
      url: `/g/${slug}`,
      upload: uploadConfig,
    });
  } catch (error) {
    console.error("Error creating gallery:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

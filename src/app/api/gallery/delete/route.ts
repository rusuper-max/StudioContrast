// src/app/api/gallery/delete/route.ts
// Delete or deactivate a gallery (admin only) - Cloudinary only

import { NextRequest, NextResponse } from "next/server";
import { deleteGallery, getGalleryMeta } from "@/lib/gallery";

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
    const { slug, permanent } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const gallery = await getGalleryMeta(slug);
    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    const success = await deleteGallery(slug, permanent);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete gallery" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

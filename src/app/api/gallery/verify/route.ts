// src/app/api/gallery/verify/route.ts
// Verify gallery password - Cloudinary only

import { NextRequest, NextResponse } from "next/server";
import { getGalleryMeta, verifyPassword } from "@/lib/gallery";

export async function POST(req: NextRequest) {
  try {
    const { slug, password } = await req.json();

    if (!slug || !password) {
      return NextResponse.json({ error: "Missing slug or password" }, { status: 400 });
    }

    const gallery = await getGalleryMeta(slug);

    if (!gallery || !gallery.active || !gallery.password) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    if (verifyPassword(password, gallery.password)) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

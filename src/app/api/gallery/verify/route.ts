// src/app/api/gallery/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getGalleryMeta,
  verifyPassword,
  needsPasswordUpgrade,
  hashPassword,
  saveGalleryMeta,
} from "@/lib/gallery";

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
      // The client just proved they know the plaintext, so this is the one
      // moment a legacy hash can be re-derived into the current format. Best
      // effort only - a failed rewrite must not turn a valid login into an error.
      if (needsPasswordUpgrade(gallery.password)) {
        try {
          await saveGalleryMeta(gallery.slug, {
            name: gallery.name,
            clientName: gallery.clientName,
            password: hashPassword(password),
            active: gallery.active,
            createdAt: gallery.createdAt,
          });
        } catch (err) {
          console.error("Error upgrading gallery password hash:", err);
        }
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

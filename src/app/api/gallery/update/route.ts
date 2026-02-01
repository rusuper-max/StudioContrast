// src/app/api/gallery/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGalleryMeta, saveGalleryMeta, hashPassword } from "@/lib/gallery";

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
    const { slug, name, clientName, password, active } = body;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const existing = await getGalleryMeta(slug);
    if (!existing) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    // Update only provided fields
    const updated = {
      name: name !== undefined ? name : existing.name,
      clientName: clientName !== undefined ? clientName : existing.clientName,
      password: password ? hashPassword(password) : existing.password,
      active: active !== undefined ? active : existing.active,
      createdAt: existing.createdAt,
    };

    const saved = await saveGalleryMeta(slug, updated);

    if (!saved) {
      return NextResponse.json({ error: "Failed to update gallery" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating gallery:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

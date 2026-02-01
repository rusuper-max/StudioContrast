// src/app/api/gallery/upload-signature/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateUploadSignature } from "@/lib/gallery";

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
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const config = generateUploadSignature(slug);
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error generating signature:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

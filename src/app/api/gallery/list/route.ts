// src/app/api/gallery/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { listAllGalleries } from "@/lib/gallery";

function isAdmin(req: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;
  return req.headers.get("x-admin-secret") === adminSecret;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const galleries = await listAllGalleries();
    const safeGalleries = galleries.map((g) => ({
      ...g,
      password: g.password ? "***" : undefined,
    }));

    return NextResponse.json({ galleries: safeGalleries });
  } catch (error) {
    console.error("Error listing galleries:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

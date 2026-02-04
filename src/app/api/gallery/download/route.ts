// src/app/api/gallery/download/route.ts
// Streams a ZIP archive of all gallery images
import { NextRequest, NextResponse } from "next/server";
import { getGalleryMeta, listGalleryImages, verifyPassword } from "@/lib/gallery";
import archiver from "archiver";
import { PassThrough } from "stream";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const password = req.nextUrl.searchParams.get("p");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const gallery = await getGalleryMeta(slug);
  if (!gallery || !gallery.active) {
    return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
  }

  // Check password if gallery is protected
  if (gallery.password) {
    if (!password || !verifyPassword(password, gallery.password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const images = await listGalleryImages(slug);
  if (images.length === 0) {
    return NextResponse.json({ error: "No images" }, { status: 404 });
  }

  // Create a streaming zip
  const archive = archiver("zip", { zlib: { level: 1 } }); // level 1 = fast (images are already compressed)
  const passthrough = new PassThrough();

  archive.pipe(passthrough);

  // Fetch and add each image to the zip
  const fetchPromises = images.map(async (img, i) => {
    try {
      const res = await fetch(img.src);
      if (!res.ok) return;

      const buffer = await res.arrayBuffer();
      const ext = img.src.includes(".png") ? "png" : "jpg";
      const filename = `${String(i + 1).padStart(3, "0")}.${ext}`;

      archive.append(Buffer.from(buffer), { name: filename });
    } catch (err) {
      console.error(`Error fetching image ${img.public_id}:`, err);
    }
  });

  // Wait for all images to be added, then finalize
  Promise.all(fetchPromises).then(() => {
    archive.finalize();
  });

  // Convert Node stream to Web ReadableStream
  const readableStream = new ReadableStream({
    start(controller) {
      passthrough.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      passthrough.on("end", () => {
        controller.close();
      });
      passthrough.on("error", (err) => {
        controller.error(err);
      });
    },
  });

  const safeName = gallery.name.replace(/[^a-zA-Z0-9\u0400-\u04FF\u0100-\u024F ._-]/g, "").trim() || slug;

  return new Response(readableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeName}.zip"`,
      "Cache-Control": "no-cache",
    },
  });
}

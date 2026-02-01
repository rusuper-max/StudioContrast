// src/app/g/[slug]/page.tsx
// Client gallery page - password protected, scrollable gallery
// Uses Cloudinary only (no external database)

import { notFound } from "next/navigation";
import { getGalleryMeta, listGalleryImages } from "@/lib/gallery";
import ClientGalleryView from "./ClientGalleryView";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const gallery = await getGalleryMeta(slug);

  if (!gallery || !gallery.active) {
    return { title: "Galerija nije pronađena" };
  }

  return {
    title: `${gallery.name} | Studio Contrast`,
    robots: "noindex, nofollow", // Don't index client galleries
  };
}

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params;

  // Get gallery metadata from Cloudinary
  const gallery = await getGalleryMeta(slug);

  if (!gallery || !gallery.active) {
    notFound();
  }

  // Fetch images from Cloudinary
  const images = await listGalleryImages(slug);

  return (
    <ClientGalleryView
      gallery={gallery}
      images={images}
      hasPassword={!!gallery.password}
    />
  );
}

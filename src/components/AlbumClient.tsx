"use client";

import FlipbookOverlay from "@/components/FlipbookOverlay";
import { useRouter } from "next/navigation";

/* PLACEHOLDER — zameniti pravim sadržajem */
const ITEMS = [
  { src: "/photos/p1.webp", alt: "Foto album — fotografija 1, Studio Contrast" },
  { src: "/photos/p2.webp", alt: "Foto album — fotografija 2, Studio Contrast" },
  { src: "/photos/p3.webp", alt: "Foto album — fotografija 3, Studio Contrast" },
  { src: "/photos/p4.webp", alt: "Foto album — fotografija 4, Studio Contrast" },
  { src: "/photos/p5.webp", alt: "Foto album — fotografija 5, Studio Contrast" },
  { src: "/photos/p6.webp", alt: "Foto album — fotografija 6, Studio Contrast" },
];

export default function AlbumClient() {
  const router = useRouter();
  return (
    <FlipbookOverlay
      items={ITEMS}
      onClose={() => router.push("/portfolio")}
    />
  );
}

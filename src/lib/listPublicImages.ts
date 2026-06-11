// src/lib/listPublicImages.ts
import { PORTFOLIO_MANIFEST } from "@/data/portfolioManifest";
import type { CatSlug } from "@/data/portfolio";

export type PublicImage = { src: string };

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

/** izvuče public_id iz bilo kog Cloudinary URL-a */
function extractPublicIdFromUrl(url: string): string | null {
  // hvata deo posle /upload/ (skida v123/ i opcionalnu ekstenziju)
  const m = /\/upload\/(?:v\d+\/)?([^.?]+)(?:\.\w+)?/.exec(url);
  return m ? m[1] : null;
}

/** napravi delivery URL iz public_id + transform */
function buildCldUrl(publicId: string, transform?: string) {
  const t = transform ? `${transform}/` : "";
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${t}${publicId}`;
}

/** umetni transform u postojeći Cloudinary URL (fallback) */
function insertTransformIntoUrl(url: string, transform?: string) {
  if (!transform) return url;
  return url.replace("/upload/", `/upload/${transform}/`);
}

type TransformKind = "marquee" | "card" | "flipbook";
function getTransform(kind?: TransformKind) {
  if (kind === "flipbook") return "f_auto,q_auto,c_fit,w_1600,dpr_auto";
  if (kind === "marquee" || kind === "card") return "f_auto,q_auto,c_fill,ar_3:2,w_900,g_auto,dpr_auto";
  return "f_auto,q_auto,dpr_auto";
}

/** Glavna funkcija: vrati optimizovane URL-ove za kategoriju (dedupe po public_id) */
export function listPublicImagesIn(
  cat: CatSlug,
  opts?: { transform?: TransformKind }
): PublicImage[] {
  const arr: string[] = (PORTFOLIO_MANIFEST as any)[cat] ?? [];
  const transform = getTransform(opts?.transform);

  // Bez cloud name-a (npr. lokalni dev bez .env.local) ne možemo da
  // sastavimo validan delivery URL — bolje prazno nego polomljene slike.
  if (!CLOUD) return [];

  // manifest od sada čuva public_id, ali zbog kompatibilnosti
  // podržimo i stare pune URL-ove
  const publicIds = new Set<string>();
  for (const item of arr) {
    if (item.startsWith("http")) {
      const pid = extractPublicIdFromUrl(item);
      if (pid) publicIds.add(pid);
    } else {
      publicIds.add(item); // već public_id
    }
  }

  return Array.from(publicIds).map((pid) => ({
    src: CLOUD ? buildCldUrl(pid, transform) : insertTransformIntoUrl(pid, transform),
  }));
}

/** Ako treba lista kategorija iz manifesta (u standardnom redosledu) */
export function listPortfolioCats(): CatSlug[] {
  const existing = new Set(Object.keys(PORTFOLIO_MANIFEST));
  const ORDER: CatSlug[] = ["vencanje", "svadbe", "studio", "rodjendani", "krstenja", "crno-belo"];
  return ORDER.filter((c) => existing.has(c));
}
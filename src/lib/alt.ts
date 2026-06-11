// src/lib/alt.ts

/**
 * Generiše smislen ALT za slike u galerijama / marquee-u.
 * Primer: "Venčanje — fotografija 3, Studio Contrast"
 */
export function altForImage(src: string, context?: string, idx?: number) {
  const label = (context || "").trim();
  const n = typeof idx === "number" ? ` ${idx + 1}` : "";
  if (label) return `${label} — fotografija${n}, Studio Contrast`;
  // fallback iz imena fajla
  const file = src.split("/").pop() || "fotografija";
  const base = file.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");
  return `${base || "Fotografija"}${n} — Studio Contrast`.trim();
}

/**
 * Srpska množina za broj fotografija.
 * 1 fotografija · 2–4 fotografije · 5+ fotografija
 */
export function photoCountLabel(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} fotografija`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} fotografije`;
  return `${n} fotografija`;
}

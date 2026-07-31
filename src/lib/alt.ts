// src/lib/alt.ts

/**
 * Opis kadra po kategoriji — piše se prirodnim jezikom, onako kako bi se
 * fotografija opisala naglas. Ključ je vidljiva oznaka kategorije
 * (CAT_LABEL iz src/data/portfolio.ts).
 *
 * Namerno BEZ lokacije ("Užice", "Zlatibor") u svakom alt-u: sa 80+ slika
 * to bi bilo trpanje ključnih reči, a ne opis. Lokacija stoji u naslovu,
 * opisu i JSON-LD-u stranice, gde i pripada.
 */
const CONTEXT_PHRASE: Record<string, string> = {
  "Venčanje": "Fotografija sa venčanja",
  "Venčanja": "Fotografija sa venčanja",
  "Svadbe": "Fotografija sa svadbene proslave",
  "Krštenja": "Fotografija sa krštenja",
  "Rođendani": "Fotografija sa rođendanske proslave",
  "Studio": "Studijski portret",
  "Crno-belo": "Crno-bela fotografija",
};

/**
 * Generiše smislen ALT za slike u galerijama / marquee-u.
 * Primer: "Fotografija sa venčanja — kadar 3, Studio Contrast"
 */
export function altForImage(src: string, context?: string, idx?: number) {
  const label = (context || "").trim();
  const n = typeof idx === "number" ? `kadar ${idx + 1}` : "";
  const tail = n ? ` — ${n}, Studio Contrast` : " — Studio Contrast";

  const phrase = CONTEXT_PHRASE[label];
  if (phrase) return `${phrase}${tail}`;
  if (label) return `${label}${tail}`;

  // fallback iz imena fajla
  const file = src.split("/").pop() || "fotografija";
  const base = file.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim();
  return `${base || "Fotografija"}${tail}`;
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

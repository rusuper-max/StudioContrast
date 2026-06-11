import { Playfair_Display, Inter } from "next/font/google";

// Editorial serif — naslovi (h1–h3) i citati
export const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

// Sans — telo, navigacija, forme, dugmad
export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

/* ------------------------------------------------------------------
 * LEGACY ALIASI — privremeno, dok area agenti ne uklone stare importe
 * (fancy / cinzel / deco su ranije bili Great Vibes / Cinzel /
 * Cinzel Decorative; sada svi pokazuju na Playfair Display).
 * ------------------------------------------------------------------ */
export const fancy = playfair;
export const cinzel = playfair;
export const deco = playfair;

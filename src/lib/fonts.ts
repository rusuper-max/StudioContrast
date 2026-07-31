import { Fraunces, Hanken_Grotesk } from "next/font/google";

// Editorial display serif — naslovi, citati, brojevi.
// Fraunces (optical size + pravi italik) daje topao, savremen editorial ton.
export const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  axes: ["opsz"],
});

// Sans — UI sloj: navigacija, forme, dugmad, caps etikete.
// Hanken Grotesk — laki grotesk (Neue Haas klasa) umesto generičkog Intera.
export const sans = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

export const inter = sans;

/* ------------------------------------------------------------------
 * LEGACY ALIASI — stari importi (playfair / fancy / cinzel / deco)
 * sada svi pokazuju na Fraunces.
 * ------------------------------------------------------------------ */
export const playfair = fraunces;
export const fancy = fraunces;
export const cinzel = fraunces;
export const deco = fraunces;

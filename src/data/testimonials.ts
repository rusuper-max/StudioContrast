// UTISCI KLIJENATA — ISKLJUČIVO PRAVI CITATI.
// Izvor: stvarne poruke klijenata studiju (Instagram DM / story objave),
// prosleđene 31.07.2026. Imena se ne prikazuju (nisu potrebna/poznata) —
// atribucija navodi izvor i period. Bez izmišljenog sadržaja.

export type Testimonial = {
  /** Doslovan citat klijenta (uz minimalnu pravopisnu normalizaciju) */
  quote: string;
  /** Izvor citata, bez imena — npr. "Poruka mladenaca · Septembar 2024." */
  attribution: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Tako ste lepo uhvatili svaki momenat — ja ne znam ni kad ste sve stigli, kad vas niko nije primetio. Oduševljeni smo.",
    attribution: "Poruka mladenaca · Septembar 2024.",
  },
  {
    quote: "Slike su preeeedivne — znači, kakvo hvatanje emocija!",
    attribution: "Poruka klijenta · Instagram",
  },
  {
    quote:
      "Odavno nismo ni mi gledali lepše slike. Mnogo, mnogo vam hvala!",
    attribution: "Poruka klijenata · Instagram",
  },
  {
    quote: "Kakve fotke — fenomenalni!",
    attribution: "Instagram objava · Maj 2025.",
  },
];

export default testimonials;

// PLACEHOLDER SADRŽAJ — zameniti pravim utiscima klijenata.

export type Testimonial = {
  /** Citat mladenaca — emotivan, konkretan, bez kiča */
  quote: string;
  /** Imena para, npr. "Jovana i Marko" */
  names: string;
  /** Vrsta događaja, npr. "Venčanje" */
  event: string;
  /** Lokacija događaja */
  location: string;
  /** Čitljiva oznaka datuma, npr. "Jun 2025." */
  dateLabel: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Uhvatili su trenutke za koje nismo ni znali da su se desili — album gledamo svake nedelje.",
    names: "Jovana i Marko",
    event: "Venčanje",
    location: "Zlatibor",
    dateLabel: "Jun 2025.",
  },
  {
    quote:
      "Ceo dan su bili uz nas, a nismo ih ni primetili. Kada je stigao film, plakali smo od prve sekunde.",
    names: "Milica i Stefan",
    event: "Venčanje",
    location: "Užice",
    dateLabel: "Septembar 2025.",
  },
  {
    quote:
      "Tatin pogled dok me je vodio do oltara — taj kadar nam znači više od svega. Hvala što ste ga sačuvali.",
    names: "Ana i Nikola",
    event: "Venčanje",
    location: "Beograd",
    dateLabel: "Maj 2025.",
  },
  {
    quote:
      "Pre venčanja smo se plašili kamere. Posle prvih deset minuta zaboravili smo da je tu — fotografije izgledaju kao da nas je slikao neko ko nas zna ceo život.",
    names: "Teodora i Luka",
    event: "Venčanje",
    location: "Tara",
    dateLabel: "Avgust 2025.",
  },
  {
    quote:
      "Kiša je padala ceo dan, a oni su od toga napravili najlepše kadrove. Baka i deka na našem filmu — to ćemo čuvati zauvek.",
    names: "Katarina i Filip",
    event: "Venčanje",
    location: "Mokra Gora",
    dateLabel: "Oktobar 2024.",
  },
  {
    quote:
      "Sve smo dogovorili iz inostranstva, bez ijednog susreta uživo. Kada smo se upoznali na dan venčanja, delovalo je kao da se znamo godinama.",
    names: "Sara i Vladimir",
    event: "Venčanje",
    location: "Drvengrad, Mećavnik",
    dateLabel: "Jul 2025.",
  },
];

export default testimonials;

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O nama | Studio Contrast",
  description:
    "Studio Contrast — Janko i Marija. Dokumentarna fotografija sa editorial estetikom: iskreni trenuci, čisti tonovi, elegantan kontrast.",
  alternates: { canonical: "/onama" },
};

/** Putanje do portreta — stavi svoje fajlove u /public/about/ (npr. 1500×2000) */
type TeamPerson = {
  index: string;
  name: string;
  role: string;
  photo: string;
  /** Uvodna rečenica — display statement sa jednim kurzivnim naglaskom */
  statement: React.ReactNode;
  bio: string[];
  highlights?: string[];
};

const TEAM: TeamPerson[] = [
  {
    index: "01",
    name: "Janko",
    role: "Videograf i fotograf",
    photo: "/about/janko.jpg",
    /* PLACEHOLDER — zameniti pravim sadržajem (druga rečenica dopunjena) */
    statement: (
      <>
        Strast prema slici i pokretu vodi me da svaku priču ispričam{" "}
        <em className="serif-italic">iskreno</em> i sa dušom.
      </>
    ),
    bio: [
      "Kombinujem dokumentarni i umetnički pristup — kadar koji deluje kao film, a trenutak koji je stvarno vaš.",
      "Najviše volim spontanu emociju i prirodno svetlo.",
    ],
    highlights: [
      "Video snimanje i režija",
      "Kreativni video editing",
      "Umetnički osećaj za kadar i pokret",
      "Spoj dokumentarnog i filmskog pristupa",
    ],
  },
  {
    index: "02",
    name: "Marija",
    role: "Fotografkinja",
    photo: "/about/marija.jpg",
    /* PLACEHOLDER — zameniti pravim sadržajem (bio prebačen u prvo lice) */
    statement: (
      <>
        Kroz objektiv tražim više od slike —{" "}
        <em className="serif-italic">emociju</em>, priču i karakter.
      </>
    ),
    bio: [
      "Pažnja prema detalju je ono što svaku fotografiju čini vašom.",
      "Inspiraciju nalazim u prirodnom svetlu i iskrenim trenucima. Verujem da prava lepota leži u autentičnosti — u onome što se ne ponavlja.",
    ],
    highlights: [
      "Umetnički portreti i detalji",
      "Obrada i selekcija fotografija",
      "Prirodno svetlo i autentične boje",
      "Diskretan, emotivan pristup snimanju",
    ],
  },
] as const;

const STATS = [
  { n: "10+", label: "godina iskustva" },
  { n: "300+", label: "snimljenih događaja" },
  { n: "25+", label: "gradova" },
  { n: "Užice", label: "Carinska 4 — studio" },
];

/** Koraci procesa — "Kako izgleda dan sa nama" */
const PROCESS_STEPS: { no: string; title: string; text: string }[] = [
  {
    no: "01",
    title: "Upoznavanje i dogovor",
    text: "Čujemo se uživo ili onlajn. Pričamo o vama, planu dana i onome što vam je važno — bez žurbe i bez obaveza.",
  },
  {
    no: "02",
    title: "Dan venčanja",
    text: "Tu smo od priprema do poslednje pesme. Radimo tiho i diskretno, ne režiramo — beležimo prirodne kadrove i iskrene trenutke.",
  },
  {
    no: "03",
    title: "Isporuka",
    text: "Svaki kadar pažljivo biramo i obrađujemo. Onlajn galerija stiže u dogovorenom roku, spremna za deljenje sa najbližima.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* 1. Zaglavlje stranice — editorial split: naslov levo, uvod desno */}
        <section className="pt-16 md:pt-24">
          <Container className="!max-w-[1480px] md:!px-8">
            <Reveal>
              <div className="grid gap-8 md:grid-cols-12 md:items-end">
                <div className="md:col-span-7">
                  <span className="eyebrow">O nama</span>
                  <h1 className="display-2 mt-4 max-w-[16ch]">
                    Dvoje fotografa — jedna{" "}
                    <em className="serif-italic">estetika</em>
                  </h1>
                </div>
                <div className="md:col-span-5 md:pb-2">
                  <p className="lead max-w-sm leading-relaxed md:ml-auto">
                    Radimo tiho i prisutno. Naš stil spaja iskrenu
                    dokumentaristiku sa editorial elegancijom — priče u svetlu i
                    senci, bez napadnog poziranja.
                  </p>
                  <div className="mt-7 md:flex md:justify-end">
                    <Link href="/portfolio" className="btn-text">
                      Pogledajte naše priče
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* 2. Tim — naizmenični asimetrični blokovi, B&W portreti */}
        <section className="section">
          <Container className="!max-w-[1480px] md:!px-8">
            <div className="space-y-20 md:space-y-24">
              {TEAM.map((p, i) => (
                <PersonBlock key={p.name} person={p} reverse={i % 2 === 1} />
              ))}
            </div>
          </Container>
        </section>

        {/* 3. Brojke — mirna traka, serifne cifre */}
        <section className="border-y border-[var(--border)]">
          <Container className="!max-w-[1480px] md:!px-8">
            <Reveal>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-10 py-12 md:grid-cols-4 md:py-16">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="font-serif text-4xl leading-none md:text-5xl">
                      {s.n}
                    </dd>
                    <dd className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] md:text-[11px]">
                      {s.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </Container>
        </section>

        {/* 4. Naš proces */}
        <section className="section">
          <Container className="!max-w-[1480px] md:!px-8">
            <Reveal>
              <div className="grid gap-6 pb-10 md:grid-cols-12 md:items-end md:pb-14">
                <div className="md:col-span-7">
                  <span className="eyebrow">Naš proces</span>
                  <h2 className="display-2 mt-4 max-w-[24ch]">
                    Kako izgleda <em className="serif-italic">dan</em> sa nama
                  </h2>
                </div>
                <div className="md:col-span-5 md:pb-2">
                  <p className="lead max-w-sm leading-relaxed md:ml-auto">
                    Tri koraka — od prvog razgovora do gotove galerije. Sve
                    ostalo je vaš dan, onakav kakav jeste.
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
              {PROCESS_STEPS.map((step, i) => (
                <Reveal key={step.no} delay={i * 120}>
                  <div className="border-t border-[var(--border)] pt-6">
                    <span
                      className="text-[10px] tracking-[0.3em] text-[var(--accent-strong)]"
                      aria-hidden="true"
                    >
                      {step.no}
                    </span>
                    <h3 className="mt-5 font-serif text-[21px] leading-tight md:text-[23px]">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-[var(--muted)]">
                      {step.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

          </Container>
        </section>
      </main>

      {/* Footer donosi CTA traku "Proverite svoj datum" — jedina na stranici */}
      <Footer />
    </>
  );
}

/* ——— Pomoćne komponente ——— */

function PersonBlock({
  person,
  reverse = false,
}: {
  person: TeamPerson;
  reverse?: boolean;
}) {
  return (
    <div className="grid gap-8 md:grid-cols-12 md:gap-8">
      {/* Foto — potpis iznad kadra (kao u pričama), B&W sa bojom na hover */}
      <Reveal
        className={
          reverse
            ? "group md:col-span-5 md:col-start-8 md:row-start-1"
            : "group md:col-span-6"
        }
      >
        <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-3">
          <span className="flex items-baseline gap-4">
            <span className="text-[10px] tracking-[0.3em] text-[var(--accent-strong)]">
              {person.index}
            </span>
            <span className="font-serif text-[21px] leading-tight md:text-[23px]">
              {person.name}
              <em className="serif-italic text-[var(--muted)]">
                {" "}
                — {person.role}
              </em>
            </span>
          </span>
        </div>
        <div className="img-frame mt-4 aspect-[3/4]">
          <img
            src={person.photo}
            alt={`${person.name} — ${person.role}, Studio Contrast`}
            loading="lazy"
            className="img-zoom img-bw"
          />
        </div>
      </Reveal>

      {/* Tekst */}
      <Reveal
        delay={120}
        className={
          reverse
            ? "self-center md:col-span-5 md:col-start-1 md:row-start-1"
            : "self-center md:col-span-5 md:col-start-8"
        }
      >
        <h2 className="display-3 max-w-[24ch] !leading-[1.25]">
          {person.statement}
        </h2>
        <div className="mt-6 max-w-md space-y-4">
          {person.bio.map((p, i) => (
            <p key={i} className="lead text-[15px] leading-relaxed">
              {p}
            </p>
          ))}
        </div>

        {person.highlights && person.highlights.length > 0 && (
          <div className="mt-10 max-w-md">
            <span className="meta-caps">U fokusu</span>
            <ul className="mt-4">
              {person.highlights.map((h, i) => (
                <li
                  key={i}
                  className="border-t border-[var(--border)] py-3 text-[13px] text-[var(--muted)] last:border-b"
                >
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Reveal>
    </div>
  );
}

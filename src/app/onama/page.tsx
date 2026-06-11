import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Image from "next/image";
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
  name: string;
  role: string;
  photo: string;
  bio: string[];
  highlights?: string[];
};

const TEAM: TeamPerson[] = [
  {
    name: "Janko",
    role: "Videograf i fotograf",
    photo: "/about/janko.jpg",
    /* PLACEHOLDER — zameniti pravim sadržajem (druga rečenica dopunjena) */
    bio: [
      "Strast prema slici i pokretu vodi me da svaku priču ispričam iskreno i sa dušom.",
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
    name: "Marija",
    role: "Fotografkinja",
    photo: "/about/marija.jpg",
    /* PLACEHOLDER — zameniti pravim sadržajem (bio prebačen u prvo lice) */
    bio: [
      "Kroz objektiv tražim više od slike — emociju, priču i karakter. Pažnja prema detalju je ono što svaku fotografiju čini vašom.",
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

/** Opciono: fotke studija (ostavi [] ako ne želiš sekciju) */
const STUDIO_PHOTOS: string[] = [
  // "/about/studio-1.jpg",
  // "/about/studio-2.jpg",
  // "/about/studio-3.jpg",
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

      <main className="section">
        <Container>
          {/* Header */}
          <div className="text-center">
            <span className="kicker">O nama</span>
            <h1 className="mt-3">Dvoje fotografa — jedna estetika</h1>
            <p className="lead mx-auto mt-4 max-w-2xl">
              Radimo tiho i prisutno. Naš stil spaja{" "}
              <span className="text-[var(--fg)]">iskrenu dokumentaristiku</span> sa{" "}
              <span className="text-[var(--fg)]">editorial elegancijom</span> — priče u svetlu i
              senci, bez napadnog poziranja.
            </p>
          </div>

          {/* TIM: Janko & Marija */}
          <div className="mt-14 space-y-16 md:mt-20 md:space-y-24">
            {TEAM.map((p, i) => (
              <PersonCard key={p.name} person={p} reverse={i % 2 === 1} first={i === 0} />
            ))}
          </div>

          {/* Statistika — mirna linija teksta, šampanj brojevi u serifu */}
          <div className="mt-16 border-y border-[var(--border)] py-10 md:mt-24">
            <div className="flex flex-wrap items-baseline justify-center gap-x-12 gap-y-5 text-center">
              <Stat label="godina iskustva" value="10+" />
              <Stat label="snimljenih događaja" value="300+" />
              <Stat label="gradova" value="25+" />
            </div>
          </div>

          {/* Kako izgleda dan sa nama */}
          <section className="mt-16 md:mt-24">
            <div className="text-center">
              <span className="kicker">Naš proces</span>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">Kako izgleda dan sa nama</h2>
            </div>

            <div className="mx-auto mt-10 grid max-w-4xl gap-10 text-center sm:text-left md:mt-14 md:grid-cols-3 md:gap-12">
              {PROCESS_STEPS.map((step) => (
                <div key={step.no}>
                  <div className="font-serif text-4xl text-[var(--accent-strong)]" aria-hidden="true">
                    {step.no}
                  </div>
                  <h3 className="mt-3 font-serif text-xl">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/upit" className="btn btn-primary">
                Proverite svoj datum
              </Link>
            </div>
          </section>

          {/* Opciono: Studio sekcija (samo ako ima fotki) */}
          {STUDIO_PHOTOS.length > 0 && (
            <section className="mt-16 md:mt-24">
              <span className="kicker">Naš studio</span>
              <p className="mt-3 max-w-2xl text-[var(--muted)]">
                Minimalistički, svetao prostor koji volimo zbog čistih linija i prirodnog svetla —
                pravi za portrete, pripreme i intimne sesije.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {STUDIO_PHOTOS.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative h-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)] pb-[70%]"
                  >
                    <Image
                      src={src}
                      alt={`Studio Contrast — enterijer studija, fotografija ${idx + 1}`}
                      fill
                      loading="lazy"
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="mt-16 flex flex-col items-center justify-center gap-4 md:mt-20 md:flex-row">
            <Link href="/portfolio" className="btn btn-outline">
              Pogledajte portfolio
            </Link>
            <Link href="/upit" className="btn btn-primary">
              Proverite svoj datum
            </Link>
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}

/* ——— Pomoćne komponente ——— */

function PersonCard({
  person,
  reverse = false,
  first = false,
}: {
  person: {
    name: string;
    role: string;
    photo: string;
    bio: string[];
    highlights?: string[];
  };
  reverse?: boolean;
  first?: boolean;
}) {
  return (
    <div
      className={[
        "grid items-center gap-8 md:grid-cols-2 md:gap-12",
        reverse ? "md:[&>*:first-child]:order-2" : "",
      ].join(" ")}
    >
      {/* Foto */}
      <div className="relative h-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)] pb-[125%] md:pb-[115%]">
        <Image
          src={person.photo}
          alt={`${person.name} — ${person.role}, Studio Contrast`}
          fill
          priority={first}
          loading={first ? undefined : "lazy"}
          unoptimized
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {/* Tekst */}
      <div className="space-y-4">
        <div>
          <span className="kicker">{person.role}</span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl">{person.name}</h2>
        </div>

        {person.bio.map((p, i) => (
          <p key={i} className="leading-relaxed text-[var(--muted)]">
            {p}
          </p>
        ))}

        {person.highlights && person.highlights.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {person.highlights.map((h, i) => (
              <li
                key={i}
                className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--fg)]"
              >
                {h}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <p className="whitespace-nowrap">
      <span className="font-serif text-3xl text-[var(--accent-strong)] md:text-4xl">{value}</span>{" "}
      <span className="text-sm text-[var(--muted)]">{label}</span>
    </p>
  );
}

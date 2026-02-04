import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Image from "next/image";
import Link from "next/link";
import { fancy, deco } from "@/lib/fonts";
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
    bio: [
      "Strast prema slici i pokretu vodi me da svaku priču ispričam iskreno i sa dušom...",
      "Kombinujem dokumentarni i umetnički pristup...",
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
    bio: [
      "Marija kroz objektiv vidi više od slike — vidi emociju, priču i karakter. Njen umetnički stil i pažnja prema detalju čine svaku fotografiju jedinstvenom.",
      "Inspiraciju pronalazi u prirodnom svetlu i iskrenim trenucima, verujući da prava lepota leži u autentičnosti i emociji koju fotografija prenosi.",
    ],
    highlights: [
      "Umjetnički portreti i detalji",
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

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="section">
        <Container>
          {/* Header */}
          <div className="text-center">
            <div className={`${fancy.className} text-accent-grad select-none text-4xl leading-none md:text-5xl`}>
              O nama
            </div>
            <h1 className="mt-2 font-serif text-3xl font-semibold md:text-5xl">
              Dvoje fotografa — jedna estetika
            </h1>
            <p className="lead mx-auto mt-3 max-w-2xl text-white/85">
              Radimo tiho i prisutno. Naš stil spaja{" "}
              <span className="text-white">iskrenu dokumentaristiku</span> sa{" "}
              <span className="text-white">editorial elegancijom</span> — priče u svetlu i senci, bez napadnog poziranja.
            </p>
          </div>

          {/* TIM: Janko & Marija */}
          <div className="mt-10 space-y-10">
            {TEAM.map((p, i) => (
              <PersonCard key={p.name} person={p} reverse={i % 2 === 1} />
            ))}
          </div>

          {/* Statistika / vrednosti */}
          <div className="mt-12 grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 md:grid-cols-3">
            <Stat label="Godina iskustva" value="10+" />
            <Stat label="Snimanih događaja" value="300+" />
            <Stat label="Gradova" value="25+" />
          </div>

          {/* Opciono: Studio sekcija (samo ako ima fotki) */}
          {STUDIO_PHOTOS.length > 0 && (
            <section className="mt-12">
              <div className={`${deco.className} label-accent`}>Naš studio</div>
              <p className="mt-2 max-w-2xl text-white/80">
                Minimalistički, svetao prostor koji volimo zbog čistih linija i prirodnog svetla —
                savršen za portrete, pripreme i intimne sesije.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {STUDIO_PHOTOS.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative h-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 pb-[70%]"
                  >
                    <Image
                      src={src}
                      alt={`Studio Contrast — studio ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row">
            <Link href="/portfolio" className="btn btn-outline">
              Pogledaj portfolio
            </Link>
            <Link href="/upit" className="btn btn-primary">
              Pošalji upit
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
}: {
  person: {
    name: string;
    role: string;
    photo: string;
    bio: string[];
    highlights?: string[];
  };
  reverse?: boolean;
}) {
  return (
    <div
      className={[
        "grid items-center gap-8 md:grid-cols-2",
        reverse ? "md:[&>*:first-child]:order-2" : "",
      ].join(" ")}
    >
      {/* Foto */}
      <div className="relative h-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 pb-[125%] md:pb-[115%]">
        <Image
          src={person.photo}
          alt={`${person.name} — ${person.role}`}
          fill
          priority
          unoptimized
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {/* Tekst */}
      <div className="space-y-4">
        <div>
          <div className={`${deco.className} label-accent`}>{person.role}</div>
          <h2 className="mt-1 font-serif text-2xl font-semibold">{person.name}</h2>
        </div>

        {person.bio.map((p, i) => (
          <p key={i} className="text-white/85">
            {p}
          </p>
        ))}

        {person.highlights && person.highlights.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {person.highlights.map((h, i) => (
              <li
                key={i}
                className="
                  rounded-full border px-3 py-1 text-xs text-white/80
                  transition
                  border-white/15
                  hover:border-teal-300/70
                  hover:text-white
                  hover:shadow-[0_0_0_1px_rgba(94,234,212,.7),0_0_18px_rgba(94,234,212,.25)]
                "
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
    <div className="text-center">
      <div className={`${deco.className} text-2xl`}>{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-white/60">{label}</div>
    </div>
  );
}

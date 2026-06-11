// src/components/FeaturedStories.tsx
// Izdvojene priče — statičan grid od tri kartice (zamenjuje stari marquee karusel).
import Link from "next/link";
import Container from "./Container";
import { listPublicImagesIn } from "@/lib/listPublicImages";
import type { CatSlug } from "@/data/portfolio";

type Story = {
  names: string;
  location: string;
  cat: CatSlug;
  alt: string;
};

/* PLACEHOLDER — zameniti pravim imenima parova, lokacijama i odgovarajućim albumima */
const STORIES: Story[] = [
  {
    names: "Jelena & Marko",
    location: "Zlatibor",
    cat: "vencanje",
    alt: "Jelena i Marko na venčanju na Zlatiboru",
  },
  {
    names: "Ana & Stefan",
    location: "Užice",
    cat: "svadbe",
    alt: "Ana i Stefan na svadbenom slavlju u Užicu",
  },
  {
    names: "Mina & Luka",
    location: "Tara",
    cat: "crno-belo",
    alt: "Mina i Luka, crno-bela fotografija sa venčanja na Tari",
  },
];

export default function FeaturedStories() {
  const stories = STORIES.map((s) => {
    const images = listPublicImagesIn(s.cat, { transform: "card" });
    return { ...s, src: images[0]?.src ?? null };
  });

  return (
    <section className="section divider">
      <Container>
        <div className="text-center">
          <span className="kicker">Izdvojene priče</span>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">
            Parovi koje smo pratili
          </h2>
          <p className="lead mx-auto mt-3 max-w-xl">
            Svako venčanje je priča za sebe. Izdvojili smo tri koje nam posebno
            znače.
          </p>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 md:mt-14">
          {stories.map((s) => (
            <Link
              key={s.cat}
              href={`/portfolio/${s.cat}`}
              className="group block rounded-[12px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-strong)]"
              aria-label={`${s.names}, ${s.location} — pogledajte album`}
            >
              <div className="overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] transition group-hover:border-[var(--accent)]">
                <div className="aspect-[3/2]">
                  {s.src ? (
                    <img
                      src={s.src}
                      alt={s.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="h-full w-full bg-[var(--surface-2)]" />
                  )}
                </div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="font-serif text-xl md:text-2xl">
                  {s.names} — {s.location}
                </h3>
                <span className="mt-2 inline-block text-[11px] uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                  Pogledajte priču →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex justify-center md:mt-14">
          <Link href="/portfolio" className="btn btn-outline">
            Ceo portfolio
          </Link>
        </div>
      </Container>
    </section>
  );
}

// src/components/FeaturedStories.tsx
// Izdvojene priče — asimetrični editorial grid. Potpisi stoje IZNAD kadra
// (čitaju se redom 01→03), fotografije su crno-bele, boja se otkriva na hover.
import Link from "next/link";
import Container from "./Container";
import Reveal from "./Reveal";

type Story = {
  index: string;
  title: string;
  album: string;
  href: string;
  src: string;
  alt: string;
  aspect: string;
};

/* Naslovi su opisi kadrova (bez izmišljenih imena parova) + stvarni album.
   Kada parovi daju saglasnost, ovde mogu stajati prava imena i lokacije. */
const LEAD: Story = {
  index: "01",
  title: "Ruka u ruci",
  album: "Svadbe",
  href: "/portfolio/svadbe",
  src: "/home/story-portrait.jpg",
  alt: "Mladenci se drže za ruke u šetnji gradom",
  aspect: "aspect-[3/4]",
};

const SIDE: Story[] = [
  {
    index: "02",
    title: "Tihi trenutak",
    album: "Crno-belo",
    href: "/portfolio/crno-belo",
    src: "/home/story-cap.jpg",
    alt: "Crno-beli kadar mladoženje i mlade u tihom trenutku",
    aspect: "aspect-[3/2]",
  },
  {
    index: "03",
    title: "Zagrljaj",
    album: "Venčanja",
    href: "/portfolio/vencanje",
    src: "/home/story-hug.jpg",
    alt: "Zagrljaj mlade i kume na venčanju",
    aspect: "aspect-[3/2]",
  },
];

function StoryBlock({ s }: { s: Story }) {
  return (
    <Link href={s.href} className="group block" aria-label={`${s.title} — album ${s.album}`}>
      <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-3">
        <span className="flex items-baseline gap-4">
          <span className="text-[10px] tracking-[0.3em] text-[var(--accent-strong)]">{s.index}</span>
          <span className="font-serif text-[21px] leading-tight md:text-[23px]">
            {s.title}
            <em className="serif-italic text-[var(--muted)]"> — {s.album}</em>
          </span>
        </span>
        <span
          className="hidden shrink-0 text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] transition group-hover:text-[var(--accent-strong)] sm:block"
          aria-hidden="true"
        >
          Pogledajte →
        </span>
      </div>
      <div className={`img-frame mt-4 ${s.aspect}`}>
        <img src={s.src} alt={s.alt} loading="lazy" className="img-zoom img-bw" />
      </div>
    </Link>
  );
}

export default function FeaturedStories() {
  return (
    <section className="section">
      <Container className="!max-w-[1480px] md:!px-8">
        {/* Editorial zaglavlje: naslov levo, uvod desno */}
        <Reveal>
          <div className="grid gap-6 pb-10 md:grid-cols-12 md:items-end md:pb-14">
            <div className="md:col-span-7">
              <span className="eyebrow">Izdvojene priče</span>
              <h2 className="display-2 mt-4 max-w-[16ch]">
                Parovi koje smo <em className="serif-italic">pratili</em>
              </h2>
            </div>
            <div className="md:col-span-5 md:pb-2">
              <p className="lead max-w-sm leading-relaxed md:ml-auto">
                Svako venčanje je priča za sebe — bez nameštanja, bez žurbe.
                Izdvojili smo tri koje nam posebno znače.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Asimetrični grid */}
        <div className="grid gap-x-8 gap-y-12 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <StoryBlock s={LEAD} />
          </Reveal>

          <div className="flex flex-col gap-12 md:col-span-5 md:pt-20">
            {SIDE.map((s, i) => (
              <Reveal key={s.index} delay={i * 120}>
                <StoryBlock s={s} />
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <div className="mt-12 flex justify-center md:mt-16">
            <Link href="/portfolio" className="btn-text">
              Ceo portfolio
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

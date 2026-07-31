// src/app/portfolio/page.tsx
// Indeks priča — editorial, asimetrični raspored kao FeaturedStories:
// potpisi IZNAD kadra (01→06), crno-belo sa bojom na hover, bez kartica.
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import { CAT_LABEL, type CatSlug } from "@/data/portfolio";
import { listPublicImagesIn, listPortfolioCats } from "@/lib/listPublicImages";
import { photoCountLabel } from "@/lib/alt";

export const metadata = {
  title: "Priče | Studio Contrast",
  description:
    "Priče koje smo zabeležili — venčanja, svadbe, krštenja, rođendani i portreti iz studija. Izaberite kategoriju i pregledajte fotografije.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Card = { slug: CatSlug; label: string; cover: string; count: number; index: string };

/* Portret varijanta Cloudinary "card" isečka (3:2 → 3:4, kadriranje na lica) */
const portraitCrop = (src: string) =>
  src.replace("ar_3:2", "ar_3:4").replace("g_auto", "g_auto:faces");

/* Ručno izabrane naslovne fotografije (indeks u manifestu kategorije) —
   biramo kadar sa ljudima/emocijom umesto prvog po redu. */
const COVER_PICK: Partial<Record<CatSlug, number>> = {
  vencanje: 1,
};

function CategoryBlock({
  c,
  portrait = false,
  eager = false,
}: {
  c: Card;
  portrait?: boolean;
  eager?: boolean;
}) {
  return (
    <Link
      href={`/portfolio/${c.slug}`}
      className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-strong)]"
      aria-label={`${c.label} — ${photoCountLabel(c.count)}, otvorite galeriju`}
    >
      {/* Potpis IZNAD kadra — indeks, serif naziv, broj fotografija */}
      <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-3">
        <span className="flex items-baseline gap-4">
          <span className="text-[10px] tracking-[0.3em] text-[var(--accent-strong)]">
            {c.index}
          </span>
          <span className="serif-italic font-serif text-[22px] leading-tight md:text-[26px]">
            {c.label}
          </span>
        </span>
        <span
          className="meta-caps shrink-0 transition-colors group-hover:text-[var(--accent-strong)]"
          aria-hidden="true"
        >
          {photoCountLabel(c.count)}
        </span>
      </div>
      <div className={`img-frame mt-4 ${portrait ? "aspect-[3/4]" : "aspect-[3/2]"}`}>
        <img
          src={portrait ? portraitCrop(c.cover) : c.cover}
          alt={`${c.label} — naslovna fotografija kategorije, Studio Contrast`}
          loading={eager ? "eager" : "lazy"}
          className="img-zoom img-bw"
        />
      </div>
    </Link>
  );
}

export default function PortfolioPage() {
  const cards: Card[] = listPortfolioCats().map((slug, i) => {
    const imgs = listPublicImagesIn(slug, { transform: "card" });
    const pick = COVER_PICK[slug] ?? 0;
    return {
      slug,
      label: CAT_LABEL[slug],
      cover: imgs[pick]?.src || imgs[0]?.src || "/hero/hero.webp",
      count: imgs.length,
      index: String(i + 1).padStart(2, "0"),
    };
  });
  const total = cards.reduce((n, c) => n + c.count, 0);

  return (
    <>
      <Navbar />
      <main>
        <section className="pb-20 pt-16 md:pb-28 md:pt-24">
          <Container className="!max-w-[1480px] md:!px-8">
            {/* Editorial zaglavlje: naslov levo, uvod + meta desno */}
            <Reveal>
              <div className="grid gap-8 md:grid-cols-12 md:items-end">
                <div className="md:col-span-8">
                  <span className="eyebrow">Portfolio</span>
                  <h1 className="display-1 mt-5 max-w-[14ch]">
                    Priče koje smo <em className="serif-italic">zabeležili</em>
                  </h1>
                </div>
                <div className="md:col-span-4 md:pb-3">
                  <p className="lead max-w-sm leading-relaxed md:ml-auto">
                    Svako slavlje je priča za sebe — izaberite kategoriju i
                    pogledajte kako ih beležimo.
                  </p>
                  <p className="meta-caps mt-6 md:text-right">
                    {cards.length} kategorija · {photoCountLabel(total)}
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Blok 1 — 01 vodeći portret levo, 02 i 03 desno */}
            <div className="mt-14 grid gap-x-8 gap-y-12 md:mt-24 md:grid-cols-12">
              <Reveal className="md:col-span-7">
                <CategoryBlock c={cards[0]} portrait eager />
              </Reveal>
              <div className="flex flex-col gap-12 md:col-span-5 md:pt-24">
                <Reveal delay={120}>
                  <CategoryBlock c={cards[1]} />
                </Reveal>
                <Reveal delay={200}>
                  <CategoryBlock c={cards[2]} />
                </Reveal>
              </div>
            </div>

            {/* Blok 2 — ogledalo: 04 vodeći portret desno, 05 i 06 levo */}
            <div className="mt-12 grid gap-x-8 gap-y-12 md:mt-20 md:grid-cols-12">
              <Reveal className="md:col-start-6 md:col-span-7 md:row-start-1">
                <CategoryBlock c={cards[3]} portrait />
              </Reveal>
              <div className="flex flex-col gap-12 md:col-start-1 md:col-span-5 md:row-start-1 md:pt-24">
                <Reveal delay={120}>
                  <CategoryBlock c={cards[4]} />
                </Reveal>
                <Reveal delay={200}>
                  <CategoryBlock c={cards[5]} />
                </Reveal>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

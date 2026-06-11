import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Link from "next/link";
import Image from "next/image";
import { CAT_LABEL, CAT_ORDER } from "@/data/portfolio";
import { listPublicImagesIn } from "@/lib/listPublicImages";
import { photoCountLabel } from "@/lib/alt";

export const metadata = {
  title: "Priče | Studio Contrast",
  description:
    "Priče koje smo zabeležili — venčanja, svadbe, krštenja, rođendani i portreti iz studija. Izaberite kategoriju i pregledajte fotografije.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function PortfolioPage() {
  const cards = CAT_ORDER.map((slug) => {
    const imgs = listPublicImagesIn(slug, { transform: "card" });
    const cover = imgs[0]?.src || "/hero/hero.webp";
    return { slug, label: CAT_LABEL[slug], cover, count: imgs.length };
  });

  return (
    <>
      <Navbar />
      <main className="section">
        <Container>
          <div className="max-w-2xl">
            <span className="kicker">Portfolio</span>
            <h1 className="mt-3">Priče</h1>
            <p className="lead mt-4 text-lg">
              Svako slavlje je priča za sebe — izaberite kategoriju i pogledajte kako ih beležimo.
            </p>
          </div>

          <div className="mt-12 grid gap-x-8 gap-y-12 md:mt-16 md:grid-cols-2">
            {cards.map((c, i) => (
              <Link
                key={c.slug}
                href={`/portfolio/${c.slug}`}
                className="group block rounded-[var(--radius)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-strong)]"
              >
                <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)]">
                  <Image
                    src={c.cover}
                    alt={`${c.label} — naslovna fotografija kategorije, Studio Contrast`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={i === 0}
                    unoptimized={c.cover.startsWith("/")}
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <div>
                    <span className="kicker">{String(i + 1).padStart(2, "0")}</span>
                    <h2 className="mt-1 font-serif text-2xl transition-colors group-hover:text-[var(--accent-strong)] md:text-3xl">
                      {c.label}
                    </h2>
                  </div>
                  {c.count > 0 && (
                    <span className="shrink-0 text-sm text-[var(--muted)]">
                      {photoCountLabel(c.count)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Link from "next/link";
import Image from "next/image";
import { fancy, deco } from "@/lib/fonts";
import { CAT_LABEL, CAT_ORDER, type CatSlug } from "@/data/portfolio";
import { listPublicImagesIn } from "@/lib/listPublicImages";

export const metadata = {
  title: "Portfolio | Studio Contrast",
  description:
    "Kategorije portfolija — pregled albuma. Svaka kategorija kao foto-album sa okretanjem stranica.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATS = CAT_ORDER;

export default function PortfolioPage() {
  const cards = CATS.map((slug) => {
    const imgs = listPublicImagesIn(slug, { transform: "card" });
    const cover = imgs[0]?.src || "/hero/hero.webp";
    return { slug, label: CAT_LABEL[slug], cover };
  });

  return (
    <>
      <Navbar />
      <main className="section">
        <Container>
          <div className="text-center">
            <div className={`${fancy.className} text-accent-grad select-none text-4xl leading-none md:text-5xl`}>
              Portfolio
            </div>
            <h1 className="mt-1 font-serif text-3xl font-semibold md:text-5xl">Izaberite kategoriju</h1>
            <p className="lead mx-auto mt-3 max-w-2xl">
              Svaka kategorija se otvara kao foto-album: okrenite stranicu i uživajte u priči.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <Link key={c.slug} href={`/portfolio/${c.slug}`} className="group block">
                <div className="relative h-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 pb-[62%]">
                  <Image
                    src={c.cover}
                    alt={c.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    priority
                    unoptimized={c.cover.startsWith("/")}
                  />
                </div>
                <div className="mt-3 text-center">
                  <div className={`${deco.className} label-accent`}>{c.label}</div>
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
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import HeroVideo from "@/components/HeroVideo";
import PetalsClient from "@/components/PetalsClient";
import HomeMarqueeClient from "@/components/HomeMarqueeClient";
import ScrollRestorer from "@/components/ScrollRestorer";
import PackageCards from "@/components/PackageCards";
import QuickInquiry from "@/components/QuickInquiry";
import { listPublicImagesIn } from "@/lib/listPublicImages";
import { CAT_LABEL, type CatSlug } from "@/data/portfolio";
import { Cinzel } from "next/font/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Studio Contrast | Foto i video",
  description:
    "Fotografisanje Užice i Zlatibor: prirodni trenuci, istinite emocije i upečatljive fotografije u boji i crno-belo.",
};

const HERO_VEIL = true;
const HERO_CENTER = true;

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const CATS: CatSlug[] = ["vencanje", "studio", "crno-belo", "rodjendani"];

export default function HomePage() {
  const marqueeItems = CATS.map((slug) => {
    const list = listPublicImagesIn(slug, { transform: "marquee" }).slice(0, 12);
    return { slug, label: CAT_LABEL[slug], images: list.map((i) => i.src) };
  });

  return (
    <>
      <Navbar />
      <ScrollRestorer />

      <main>
        {/* Lokalni SEO hint – ne remeti dizajn (sr-only) */}
        <p className="sr-only">
          Studio Contrast — fotografisanje u Užicu i Zlatiboru, a radimo i širom Srbije: venčanja,
          portreti, porodične i poslovne sesije.
        </p>
        <HeroVideo veil={HERO_VEIL} center={HERO_CENTER} />
        <PetalsClient />

        {/* Paketi */}
        <section className="section divider">
          <Container>
            <div className="text-center">
              <div className="label-gold">Paketi</div>
              <h2 className="mt-2 font-serif text-3xl font-semibold md:text-4xl">
                Izaberite paket ili ga prilagodite
              </h2>
              <p className="lead mx-auto mt-2 max-w-2xl">
                Tri pažljivo skrojene opcije — kliknite na paket da otvorite konfigurator i prilagodite dodatke.
              </p>
            </div>

            <div className="mt-8">
              <PackageCards />
            </div>
          </Container>
        </section>

        {/* Izdvojeni radovi — marquee */}
        <section className="section">
          <Container>
            <div className="text-center">
              <div className="label-gold">Portfolio</div>
              <h2 className="mt-2 font-serif text-3xl font-semibold md:text-4xl">
                Izdvojeni radovi
              </h2>
              <p className="lead mx-auto mt-2 max-w-2xl">
                Traka se polako kreće, a svaka kartica smenjuje nekoliko kadrova iz kategorije. Klik vodi u album.
              </p>
            </div>

            <div className="mt-8">
              <HomeMarqueeClient items={marqueeItems} />
            </div>

            <div className="mt-8 flex justify-center">
              <Link href="/portfolio" className="btn btn-primary">Otvori Portfolio</Link>
            </div>
          </Container>
        </section>

        {/* Pošalji upit — mini forma */}
        <section className="section border-t border-white/10 bg-black/40">
          <Container>
            <div className="mb-6">
              <h3 className="text-xl font-semibold">Pošaljite nam poruku</h3>
              <p className="mt-1 text-white/80">
                Napišite datum i lokaciju proslave, a mi vam se brzo javljamo sa informacijama o dostupnosti.
              </p>
            </div>

            <QuickInquiry />

            <p className="mt-3 text-sm text-white/60">
              Želite detaljniju kalkulaciju?{" "}
              <Link href="/ponude" className="navlink navlink--accent">
                Otvorite konfigurator paketa
              </Link>
              .
            </p>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

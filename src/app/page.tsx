import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import HeroVideo from "@/components/HeroVideo";
import ScrollRestorer from "@/components/ScrollRestorer";
import FeaturedStories from "@/components/FeaturedStories";
import TestimonialsSection from "@/components/TestimonialsSection";
import PackageCards from "@/components/PackageCards";
import QuickInquiry from "@/components/QuickInquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Studio Contrast | Foto i video",
  description:
    "Fotografisanje Užice i Zlatibor: prirodni trenuci, istinite emocije i upečatljive fotografije u boji i crno-belo.",
};

export default function HomePage() {
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

        {/* 1. Hero */}
        <HeroVideo />

        {/* 2. Trust strip */}
        <section className="border-b border-[var(--border)] py-8 md:py-10">
          <Container>
            <p className="text-center text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
              10+ godina iskustva
              <span className="mx-3 text-[var(--accent)]" aria-hidden="true">·</span>
              300+ događaja
              <span className="mx-3 text-[var(--accent)]" aria-hidden="true">·</span>
              25+ gradova
            </p>
          </Container>
        </section>

        {/* 3. Izdvojene priče */}
        <FeaturedStories />

        {/* 4. Citat mladenaca */}
        <TestimonialsSection />

        {/* 5. Paketi teaser */}
        <section className="section divider">
          <Container>
            <div className="text-center">
              <span className="kicker">Paketi</span>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Izaberite paket ili ga prilagodite
              </h2>
              <p className="lead mx-auto mt-3 max-w-2xl">
                Tri pažljivo skrojene opcije. Kliknite na paket da otvorite
                konfigurator i prilagodite dodatke.
              </p>
            </div>

            <div className="mt-10 md:mt-14">
              <PackageCards />
            </div>

            <div className="mt-10 flex justify-center">
              <Link href="/ponude" className="btn btn-outline">
                Sastavite svoju ponudu
              </Link>
            </div>
          </Container>
        </section>

        {/* 6. O nama teaser */}
        <section className="section divider">
          <Container>
            <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="/about/janko.jpg"
                  alt="Janko, fotograf Studija Contrast"
                  loading="lazy"
                  className="aspect-[3/4] w-full rounded-[12px] border border-[var(--border)] object-cover"
                />
                <img
                  src="/about/marija.jpg"
                  alt="Marija, fotograf Studija Contrast"
                  loading="lazy"
                  className="mt-8 aspect-[3/4] w-full rounded-[12px] border border-[var(--border)] object-cover"
                />
              </div>
              <div className="text-center md:text-left">
                <span className="kicker">O nama</span>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Mi smo Janko i Marija
                </h2>
                <p className="lead mt-4 max-w-md md:max-w-none mx-auto">
                  Već deset godina pratimo parove kroz najvažnije dane — tiho,
                  strpljivo i bez nameštanja. Verujemo da najlepše fotografije
                  nastaju kada zaboravite da smo tu.
                </p>
                <Link href="/onama" className="link mt-6 inline-block text-sm text-[var(--accent-strong)]">
                  Upoznajte nas →
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* 7. Brzi upit */}
        <section className="section divider">
          <Container>
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <span className="kicker">Brzi upit</span>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Proverite da li je vaš datum slobodan
                </h2>
                <p className="lead mt-3">
                  Napišite datum i lokaciju proslave. Odgovaramo u roku od 24h.
                </p>
              </div>

              <div className="card mt-8 p-6 md:p-8">
                <QuickInquiry />
              </div>

              <p className="mt-4 text-center text-sm text-[var(--muted)]">
                Želite detaljniju kalkulaciju?{" "}
                <Link href="/ponude" className="link text-[var(--accent-strong)]">
                  Otvorite konfigurator paketa
                </Link>
                .
              </p>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import HeroCinematic from "@/components/HeroCinematic";
import ScrollRestorer from "@/components/ScrollRestorer";
import FeaturedStories from "@/components/FeaturedStories";
import TestimonialsSection from "@/components/TestimonialsSection";
import PackageCards from "@/components/PackageCards";
import QuickInquiry from "@/components/QuickInquiry";
import Reveal from "@/components/Reveal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Metapodaci početne (naslov, opis, canonical "/", OG) dolaze iz
// src/app/layout.tsx — root segment ne primenjuje sopstveni title template,
// pa bi duplirana definicija ovde samo išla van sinhronizacije.

const STATS = [
  { n: "10+", label: "godina iskustva" },
  { n: "300+", label: "događaja" },
  { n: "25+", label: "gradova" },
];

export default function HomePage() {
  return (
    <>
      <Navbar variant="overlay" />
      <ScrollRestorer />

      <main>
        {/* Lokalni SEO kontekst — ne remeti dizajn (sr-only).
            Sadrži samo tvrdnje koje stoje i u vidljivom sadržaju sajta. */}
        <p className="sr-only">
          Studio Contrast je foto i video studio iz Užica, Carinska 4. Fotografišemo i
          snimamo venčanja, svadbe, krštenja i rođendane u Užicu, na Zlatiboru i širom
          Srbije, a u studiju radimo portrete parova, porodica i pojedinaca. Iza nas je
          više od deset godina rada, preko 300 događaja i 25 gradova.
        </p>

        {/* 1. Hero */}
        <HeroCinematic />

        {/* 2. Manifest + brojke */}
        <section className="section">
          <Container className="!max-w-[1480px] md:!px-8">
            <div className="grid gap-12 md:grid-cols-12">
              <Reveal className="md:col-span-8">
                <span className="eyebrow">Naš pristup</span>
                <p className="display-3 mt-6 max-w-[30ch] !leading-[1.3]">
                  Ne režiramo trenutke — <em className="serif-italic">čekamo ih</em>.
                  Radimo tiho i diskretno, da fotografije budu ono što ste zaista
                  bili tog dana.
                </p>
              </Reveal>
              <Reveal delay={150} className="md:col-span-4 md:self-end">
                <dl className="flex gap-10 border-t border-[var(--border)] pt-8 md:flex-col md:gap-7 md:border-t-0 md:border-l md:pl-10 md:pt-0">
                  {STATS.map((s) => (
                    <div key={s.label}>
                      <dt className="sr-only">{s.label}</dt>
                      <dd className="font-serif text-4xl leading-none md:text-5xl">
                        {s.n}
                      </dd>
                      <dd className="mt-2 whitespace-nowrap text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] md:text-[11px]">
                        {s.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* 3. Izdvojene priče */}
        <FeaturedStories />

        {/* 4. Citat mladenaca — full bleed */}
        <TestimonialsSection />

        {/* 5. Paketi teaser */}
        <section className="section">
          <Container className="!max-w-[1480px] md:!px-8">
            <Reveal>
              <div className="grid gap-6 pb-12 md:grid-cols-12 md:items-end md:pb-16">
                <div className="md:col-span-7">
                  <span className="eyebrow">Paketi</span>
                  <h2 className="display-2 mt-4 max-w-[18ch]">
                    Izaberite paket ili ga <em className="serif-italic">prilagodite</em>
                  </h2>
                </div>
                <div className="md:col-span-5 md:pb-2">
                  <p className="lead max-w-sm text-[15px] leading-relaxed md:ml-auto">
                    Tri pažljivo skrojene opcije — a svaki detalj možete
                    prilagoditi u konfiguratoru.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <PackageCards />
            </Reveal>

            <Reveal>
              <div className="mt-12 flex justify-center">
                <Link href="/ponude" className="btn-text">
                  Sastavite svoju ponudu
                </Link>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* 6. O nama teaser */}
        <section className="section border-t border-[var(--border)]">
          <Container className="!max-w-[1480px] md:!px-8">
            <div className="grid items-center gap-14 md:grid-cols-12 md:gap-8">
              <Reveal className="relative md:col-span-6">
                <div className="group relative pr-[25%]">
                  <div className="img-frame aspect-[3/4]">
                    <img
                      src="/about/janko.jpg"
                      alt="Janko, fotograf Studija Contrast"
                      loading="lazy"
                      className="img-zoom img-bw"
                    />
                  </div>
                  <div className="img-frame absolute bottom-[12%] right-0 w-[40%] border-[8px] border-[var(--bg)]">
                    <div className="aspect-[3/4]">
                      <img
                        src="/about/marija.jpg"
                        alt="Marija, fotografkinja Studija Contrast"
                        loading="lazy"
                        className="img-zoom img-bw"
                      />
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120} className="md:col-span-5 md:col-start-8">
                <span className="eyebrow">O nama</span>
                <h2 className="display-2 mt-4">
                  Mi smo Janko <em className="serif-italic">i</em> Marija
                </h2>
                <p className="lead mt-6 max-w-md text-[15px] leading-relaxed">
                  Već deset godina pratimo parove kroz najvažnije dane — tiho,
                  strpljivo i bez nameštanja. Verujemo da najlepše fotografije
                  nastaju kada zaboravite da smo tu.
                </p>
                <Link href="/onama" className="btn-text mt-8">
                  Upoznajte nas
                </Link>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* 7. Brzi upit */}
        <section className="section border-t border-[var(--border)]">
          <Container>
            <div className="mx-auto max-w-3xl">
              <Reveal>
                <div className="text-center">
                  <span className="eyebrow">Brzi upit</span>
                  <h2 className="display-2 mt-4">
                    Da li je vaš datum <em className="serif-italic">slobodan</em>?
                  </h2>
                  <p className="lead mx-auto mt-5 max-w-md text-[15px]">
                    Napišite datum i lokaciju proslave. Odgovaramo u roku od 24h.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="mt-14">
                  <QuickInquiry />
                </div>
              </Reveal>

              <Reveal>
                <p className="mt-10 text-center text-sm text-[var(--muted)]">
                  Želite detaljniju kalkulaciju?{" "}
                  <Link href="/ponude" className="link text-[var(--accent-strong)]">
                    Otvorite konfigurator paketa
                  </Link>
                  .
                </p>
              </Reveal>
            </div>
          </Container>
        </section>
      </main>
      <Footer cta={false} />
    </>
  );
}

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import QuickInquiry from "@/components/QuickInquiry";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import { absUrl, breadcrumbJsonLd, pageMeta, STUDIO_ID } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Kontakt — foto studio u Užicu, Carinska 4",
  ogTitle: "Kontakt — foto studio u Užicu | Studio Contrast",
  description:
    "Studio Contrast, Carinska 4, Užice. Telefon, email, Instagram i mapa. Radimo pon–sub 10–18h, fotografišemo širom Srbije i odgovaramo na upit u roku od 24 časa.",
  path: "/kontakt",
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lokacija studija */
const MAP_LABEL = "Carinska 4, Užice 31000";
const MAP_LINK  = "https://www.google.com/maps/place/43%C2%B051'42.0%22N+19%C2%B051'30.8%22E/@43.861671,19.858566,767m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d43.861671!4d19.858566?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D";
/** Precizan embed po koordinatama (bez API ključa) */
const MAP_LAT = 43.861671;
const MAP_LNG = 19.858566;
const MAP_ZOOM = 18;
const MAP_EMBED = `https://www.google.com/maps?q=${MAP_LAT},${MAP_LNG}&hl=sr&z=${MAP_ZOOM}&output=embed`;

const INSTAGRAM_URL = "https://www.instagram.com/studio_contrast_031/";
const INSTAGRAM_HANDLE = "@studio_contrast_031";

/** Red u editorial listi kontakata */
function ContactRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 border-b border-[var(--border)] py-5 sm:grid-cols-[130px_1fr] sm:gap-8">
      <span className="meta-caps pt-0.5">{label}</span>
      <div className="text-[15px] leading-relaxed">{children}</div>
    </div>
  );
}

/** Mali tekstualni linkovi za WhatsApp / Viber (bez pill oblika) */
function ChatLinks({
  phone,
  person,
}: {
  phone: string; // samo cifre sa pozivnim, npr. 381659869105
  person: string;
}) {
  return (
    <span className="text-[13px] text-[var(--muted)]">
      <a
        href={`https://wa.me/${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp — ${person}`}
        className="link"
      >
        WhatsApp
      </a>
      <span aria-hidden="true" className="mx-2">·</span>
      <a
        href={`viber://chat?number=%2B${phone}`}
        aria-label={`Viber — ${person}`}
        className="link"
      >
        Viber
      </a>
    </span>
  );
}

export default function ContactPage() {
  /* ContactPage vezan na isti @id kao LocalBusiness iz layout-a — Google
     tako zna da su telefon, adresa i radno vreme jednog te istog studija. */
  const contactLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Kontakt — Studio Contrast",
    url: absUrl("/kontakt"),
    inLanguage: "sr-RS",
    mainEntity: { "@id": STUDIO_ID },
  };

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Početna", path: "/" },
    { name: "Kontakt", path: "/kontakt" },
  ]);

  return (
    <>
      <Navbar />
      <main>
        {/* 1. Zaglavlje stranice */}
        <section className="pt-16 md:pt-24">
          <Container className="!max-w-[1480px] md:!px-8">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(contactLd) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <Reveal>
              <span className="eyebrow">Kontakt</span>
              <h1 className="display-2 mt-4 max-w-[16ch]">
                Pišite, pozovite ili <em className="serif-italic">svratite</em>
              </h1>
              <p className="lead mt-6 max-w-xl">
                Studio se nalazi u Carinskoj 4 u Užicu, a fotografišemo i
                snimamo širom Srbije i regiona. Na svaki upit odgovaramo
                u roku od 24 časa.
              </p>
            </Reveal>
          </Container>
        </section>

        {/* 2. Detalji + mapa */}
        <section className="section !pt-14 md:!pt-20">
          <Container className="!max-w-[1480px] md:!px-8">
            <div className="grid gap-14 md:grid-cols-12 md:gap-8">
              {/* Kontakt detalji — tipografska lista */}
              <Reveal className="md:col-span-5">
                <div className="border-t border-[var(--border)]">
                  <ContactRow label="Email">
                    <a href="mailto:studio.contrast031@gmail.com" className="link">
                      studio.contrast031@gmail.com
                    </a>
                  </ContactRow>

                  <ContactRow label="Janko">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <a href="tel:+381659869105" className="link">
                        +381 65 986 9105
                      </a>
                      <ChatLinks phone="381659869105" person="Janko" />
                    </div>
                  </ContactRow>

                  <ContactRow label="Marija">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <a href="tel:+381628068268" className="link">
                        +381 62 806 8268
                      </a>
                      <ChatLinks phone="381628068268" person="Marija" />
                    </div>
                  </ContactRow>

                  <ContactRow label="Instagram">
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link"
                      aria-label="Instagram profil Studija Contrast — otvara se u novom tabu"
                    >
                      {INSTAGRAM_HANDLE}
                    </a>
                  </ContactRow>

                  <ContactRow label="Studio">
                    <div>{MAP_LABEL}</div>
                    <div className="mt-1 text-[13px] text-[var(--muted)]">
                      Na snimanja dolazimo na lokaciju događaja — po dogovoru.
                    </div>
                  </ContactRow>

                  {/* PLACEHOLDER — zameniti pravim sadržajem (radno vreme) */}
                  <ContactRow label="Radno vreme">
                    <div>Pon–sub: 10–18h</div>
                    <div className="mt-1 text-[13px] text-[var(--muted)]">
                      Nedeljom i van termina — po dogovoru.
                    </div>
                  </ContactRow>
                </div>
              </Reveal>

              {/* Mapa — editorial okvir sa natpisom iznad */}
              <Reveal delay={120} className="md:col-span-6 md:col-start-7">
                <div className="group">
                  <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-3">
                    <span className="meta-caps">
                      Lokacija studija{" "}
                      <span className="normal-case tracking-normal">
                        — <em className="font-serif italic">Užice</em>
                      </span>
                    </span>
                    <a
                      href={MAP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-text shrink-0 !text-[10px]"
                    >
                      Otvori u Maps
                    </a>
                  </div>
                  <div className="img-frame mt-4">
                    <div className="relative aspect-[16/10] w-full md:aspect-[4/3]">
                      <iframe
                        src={MAP_EMBED}
                        className="absolute inset-0 h-full w-full border-0 grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Mapa — ${MAP_LABEL}`}
                        allowFullScreen
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-[13px] text-[var(--muted)]">
                    {MAP_LABEL}
                  </p>
                </div>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* 3. Brzi upit */}
        <section className="section border-t border-[var(--border)]">
          <Container>
            <div className="mx-auto max-w-3xl">
              <Reveal>
                <div className="text-center">
                  <span className="eyebrow">Brzi upit</span>
                  <h2 className="display-2 mt-4">
                    Proverite svoj <em className="serif-italic">datum</em>
                  </h2>
                  <p className="lead mx-auto mt-5 max-w-md text-[15px]">
                    Napišite datum i lokaciju proslave — odgovaramo u roku od 24h.
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

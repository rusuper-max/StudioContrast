import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Link from "next/link";
import { fancy, deco } from "@/lib/fonts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt | Studio Contrast",
  description:
    "Kontaktirajte Studio Contrast — fotografisanje Užice i Zlatibor region; email, telefoni i lokacija studija.",
  alternates: { canonical: "/kontakt" },
};

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

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="section">
        <Container>
          {/* Header */}
          <div className="text-center">
            <div className={`${fancy.className} text-accent-grad select-none text-4xl leading-none md:text-5xl`}>
              Kontakt
            </div>
            <h1 className="mt-2 font-serif text-3xl font-semibold md:text-5xl">Pišite ili pozovite</h1>
            <p className="lead mx-auto mt-3 max-w-2xl text-white/85">
              Studio Contrast je u <strong>{MAP_LABEL}</strong>. Fotografisanje i snimanje
              radimo na lokacijama širom Srbije i regiona — po dogovoru.
            </p>
          </div>

          {/* Grid: mapa + info */}
          <div className="mt-10 grid gap-6 md:grid-cols-[1fr,360px]">
            {/* Mapa */}
            <div className="card overflow-hidden p-0">
              <div className={`${deco.className} label-accent px-4 pt-4`}>Lokacija studija</div>
              <div className="relative mt-3 aspect-[16/10] w-full md:aspect-[16/9]">
                <iframe
                  src={MAP_EMBED}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Mapa — ${MAP_LABEL}`}
                  allowFullScreen
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-3">
                <div className="text-sm text-white/80">
                  {MAP_LABEL}
                  <div className="text-xs text-white/60">
                    Na snimanja/fotkanja dolazimo na lokaciju događaja — po dogovoru.
                  </div>
                </div>
                <a
                  href={MAP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  Otvori u Maps
                </a>
              </div>
            </div>

            {/* Kontakt detalji */}
            <aside className="card h-fit p-4 md:p-6">
              <div className={`${deco.className} label-accent`}>Kontakt detalji</div>

              <div className="mt-4 space-y-3 text-sm text-white/85">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">✉️</span>
                  <div>
                    Email<br />
                    <a href="mailto:studio.contrast031@gmail.com" className="link">
                      studio.contrast031@gmail.com
                    </a>
                  </div>
                </div>

                {/* Telefoni + WA/Viber */}
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">📞</span>
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        Janko<br />
                        <a href="tel:+381659869105" className="link">+381 65 986 9105</a>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href="https://wa.me/381659869105"
                          className="rounded-md border border-white/15 px-2 py-1 text-xs text-white/85 hover:bg-white/5"
                          rel="noopener noreferrer"
                          target="_blank"
                          title="WhatsApp"
                        >
                          WhatsApp
                        </a>
                        <a
                          href="viber://chat?number=%2B381659869105"
                          className="rounded-md border border-white/15 px-2 py-1 text-xs text-white/85 hover:bg-white/5"
                          title="Viber"
                        >
                          Viber
                        </a>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div>
                        Marija<br />
                        <a href="tel:+381628068268" className="link">+381 62 806 8268</a>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href="https://wa.me/381628068268"
                          className="rounded-md border border-white/15 px-2 py-1 text-xs text-white/85 hover:bg-white/5"
                          rel="noopener noreferrer"
                          target="_blank"
                          title="WhatsApp"
                        >
                          WhatsApp
                        </a>
                        <a
                          href="viber://chat?number=%2B381628068268"
                          className="rounded-md border border-white/15 px-2 py-1 text-xs text-white/85 hover:bg-white/5"
                          title="Viber"
                        >
                          Viber
                        </a>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-white/60">
                      Dostupni i na Viber/WhatsApp (preko gore navedenih brojeva).
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link href="/ponude" className="btn btn-outline">Pogledaj ponude</Link>
                <Link href="/upit" className="btn btn-primary">Pošalji upit</Link>
              </div>
            </aside>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

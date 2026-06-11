import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Link from "next/link";
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

const INSTAGRAM_URL = "https://www.instagram.com/studio_contrast_031/";
const INSTAGRAM_HANDLE = "@studio_contrast_031";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="section">
        <Container>
          {/* Header */}
          <div className="text-center">
            <span className="kicker">Kontakt</span>
            <h1 className="mt-3">Pišite ili pozovite</h1>
            <p className="lead mx-auto mt-4 max-w-2xl">
              Studio Contrast je u <strong className="font-medium text-[var(--fg)]">{MAP_LABEL}</strong>.
              Fotografisanje i snimanje radimo na lokacijama širom Srbije i regiona — po dogovoru.
            </p>
          </div>

          {/* Grid: mapa + info */}
          <div className="mt-12 grid gap-6 md:grid-cols-[1fr_360px]">
            {/* Mapa */}
            <div className="card overflow-hidden p-0">
              <div className="px-4 pt-4">
                <span className="kicker">Lokacija studija</span>
              </div>
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
              <div className="flex flex-col items-start justify-between gap-3 px-4 pb-4 pt-3 sm:flex-row sm:items-center">
                <div className="text-sm">
                  {MAP_LABEL}
                  <div className="mt-0.5 text-xs text-[var(--muted)]">
                    Na snimanja dolazimo na lokaciju događaja — po dogovoru.
                  </div>
                </div>
                <a
                  href={MAP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline shrink-0"
                >
                  Otvori u Maps
                </a>
              </div>
            </div>

            {/* Kontakt detalji */}
            <aside className="card h-fit p-5 md:p-6">
              <span className="kicker">Kontakt detalji</span>

              <div className="mt-5 space-y-5 text-sm">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <IconMail />
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[var(--muted)]">Email</div>
                    <a href="mailto:studio.contrast031@gmail.com" className="link">
                      studio.contrast031@gmail.com
                    </a>
                  </div>
                </div>

                {/* Janko */}
                <div className="flex items-start gap-3">
                  <IconPhone />
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[var(--muted)]">Janko</div>
                    <a href="tel:+381659869105" className="link">+381 65 986 9105</a>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <ChatPill
                        href="https://wa.me/381659869105"
                        label="WhatsApp"
                        ariaLabel="WhatsApp — Janko"
                        color="#1B8755"
                        external
                      />
                      <ChatPill
                        href="viber://chat?number=%2B381659869105"
                        label="Viber"
                        ariaLabel="Viber — Janko"
                        color="#59267C"
                      />
                    </div>
                  </div>
                </div>

                {/* Marija */}
                <div className="flex items-start gap-3">
                  <IconPhone />
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[var(--muted)]">Marija</div>
                    <a href="tel:+381628068268" className="link">+381 62 806 8268</a>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <ChatPill
                        href="https://wa.me/381628068268"
                        label="WhatsApp"
                        ariaLabel="WhatsApp — Marija"
                        color="#1B8755"
                        external
                      />
                      <ChatPill
                        href="viber://chat?number=%2B381628068268"
                        label="Viber"
                        ariaLabel="Viber — Marija"
                        color="#59267C"
                      />
                    </div>
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-start gap-3">
                  <IconInstagram />
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[var(--muted)]">Instagram</div>
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link"
                      aria-label="Instagram profil Studija Contrast — otvara se u novom tabu"
                    >
                      {INSTAGRAM_HANDLE}
                    </a>
                  </div>
                </div>

                <div className="divider" />

                {/* Adresa */}
                <div className="flex items-start gap-3">
                  <IconPin />
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[var(--muted)]">Adresa</div>
                    <div>{MAP_LABEL}</div>
                  </div>
                </div>

                {/* Radno vreme */}
                {/* PLACEHOLDER — zameniti pravim sadržajem (radno vreme) */}
                <div className="flex items-start gap-3">
                  <IconClock />
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[var(--muted)]">Radno vreme</div>
                    <div>Pon–sub: 10–18h</div>
                    <div className="text-xs text-[var(--muted)]">Nedeljom i van termina — po dogovoru.</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <Link href="/upit" className="btn btn-primary">Proverite svoj datum</Link>
                <Link href="/ponude" className="btn btn-outline">Pogledajte ponude</Link>
              </div>
            </aside>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

/* ——— Pomoćne komponente ——— */

/** Outline pill za WhatsApp/Viber — prepoznatljiva boja u tekstu i ikonici */
function ChatPill({
  href,
  label,
  ariaLabel,
  color,
  external = false,
}: {
  href: string;
  label: string;
  ariaLabel: string;
  color: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-medium transition hover:border-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
      style={{ color }}
    >
      <svg
        aria-hidden="true"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
      {label}
    </a>
  );
}

/* Male ikonice (stroke u sekundarnoj boji) */

function iconProps() {
  return {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--accent-strong)",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    className: "mt-0.5 shrink-0",
  };
}

function IconMail() {
  return (
    <svg {...iconProps()}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg {...iconProps()}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg {...iconProps()}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg {...iconProps()}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

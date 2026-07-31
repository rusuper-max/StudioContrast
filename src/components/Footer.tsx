// src/components/Footer.tsx
// Editorial podnožje: kolone gore, veliki serif potpis kao donja tipografska
// traka. CTA traka preko fotografije je opciona (cta={false} na stranicama
// koje već imaju formu).
import Link from "next/link";
import Container from "./Container";

const FOOTER_NAV = [
  { href: "/portfolio", label: "Priče" },
  { href: "/ponude", label: "Paketi" },
  { href: "/onama", label: "O nama" },
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Footer({ cta = true }: { cta?: boolean }) {
  return (
    <footer>
      {/* Zona 1 — CTA preko fotografije (opciono) */}
      {cta && (
        <section className="relative overflow-hidden bg-[var(--ink)] text-[var(--ink-fg)]">
          <img
            src="/home/cta-stairs.jpg"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-[50%_35%] opacity-50"
            style={{ filter: "grayscale(1)" }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 85% 75% at 50% 45%, rgba(23,20,18,0.5) 0%, rgba(23,20,18,0.72) 75%, rgba(23,20,18,0.85) 100%)",
            }}
          />
          <Container className="relative">
            <div className="flex flex-col items-center gap-7 py-20 text-center md:py-28">
              <span className="eyebrow eyebrow--light">Rezervacije</span>
              <h2 className="display-2 max-w-[18ch]">
                Termini se <em className="serif-italic">brzo</em> popune
              </h2>
              <p className="max-w-md font-serif text-[16px] leading-relaxed text-[var(--ink-fg)]/75">
                Pišite nam sa datumom i mestom proslave — javljamo se brzo i rado
                čuvamo vaš termin.
              </p>
              <Link href="/upit" className="btn btn-light mt-3">
                Proverite svoj datum
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* Zona 2 — editorial podnožje */}
      <section className="border-t border-[var(--border)] bg-[var(--bg)]">
        <Container className="!max-w-[1480px] md:!px-8">
          <div className="grid gap-10 pb-14 pt-14 md:grid-cols-12 md:pt-20">
            <div className="md:col-span-5">
              <span className="meta-caps mb-4 block">Studio Contrast</span>
              <p className="max-w-xs font-serif text-[17px] leading-relaxed text-[var(--fg)]/85">
                Fotografija i film venčanja — prirodni momenti, u boji i
                crno-belo.
              </p>
              <Link
                href="/upit"
                className="btn-text mt-8 !text-[11px]"
              >
                Pišite nam
              </Link>
            </div>

            <nav
              className="flex flex-col gap-3 md:col-span-3"
              aria-label="Navigacija u podnožju"
            >
              <span className="meta-caps mb-1">Navigacija</span>
              {FOOTER_NAV.map((i) => (
                <Link key={i.href} href={i.href} className="navlink w-fit text-[14px]">
                  {i.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-3 md:col-span-2">
              <span className="meta-caps mb-1">Studio</span>
              <p className="text-[14px] text-[var(--muted)]">Carinska 4, Užice</p>
              <p className="text-[14px] text-[var(--muted)]">Radimo širom Srbije</p>
            </div>

            <div className="flex flex-col gap-3 md:col-span-2">
              <span className="meta-caps mb-1">Pratite nas</span>
              <a
                href="https://www.instagram.com/studio_contrast_031/"
                target="_blank"
                rel="noopener noreferrer"
                className="navlink inline-flex w-fit items-center gap-2 text-[14px]"
                aria-label="Instagram — otvara se u novom tabu"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a6 6 0 1 1 0 12a6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM18 6.2a1 1 0 1 1 0 2a1 1 0 0 1 0-2z"
                  />
                </svg>
                Instagram
              </a>
            </div>
          </div>
        </Container>

        {/* Veliki potpis — puna širina, donja tipografska traka */}
        <div className="overflow-hidden border-t border-[var(--border)]">
          <Container className="!max-w-[1480px] md:!px-8">
            <p className="whitespace-nowrap py-6 text-center font-serif text-[clamp(40px,9.4vw,150px)] leading-none tracking-[-0.01em] text-[var(--fg)] md:py-8">
              Studio <em className="serif-italic">Contrast</em>
            </p>
          </Container>
        </div>

        <div className="border-t border-[var(--border)]">
          <Container className="!max-w-[1480px] md:!px-8">
            <div className="flex flex-col gap-2 py-5 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] md:flex-row md:items-center md:justify-between">
              <p>© {new Date().getFullYear()} Studio Contrast</p>
              <p>Fotografija i film — Užice · Zlatibor · Srbija</p>
            </div>
          </Container>
        </div>
      </section>
    </footer>
  );
}

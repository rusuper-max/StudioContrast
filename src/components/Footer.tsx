import Link from "next/link";
import Container from "./Container";

const FOOTER_NAV = [
  { href: "/portfolio", label: "Priče" },
  { href: "/ponude", label: "Paketi" },
  { href: "/onama", label: "O nama" },
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Footer() {
  return (
    <footer className="mt-16">
      {/* Zona 1 — tamna "ink" CTA traka */}
      <section className="bg-[var(--ink)] text-[var(--ink-fg)]">
        <Container className="section">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--accent)]">
              Rezervacije
            </span>
            <h2 className="font-serif text-3xl md:text-5xl">
              Termini se brzo popune
            </h2>
            {/* PLACEHOLDER — zameniti pravim sadržajem */}
            <p className="max-w-md text-sm leading-relaxed text-[var(--ink-fg)]/70">
              Pišite nam sa datumom i mestom proslave — javljamo se brzo i
              rado čuvamo vaš termin.
            </p>
            <Link
              href="/upit"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[#C9AE74] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Proverite svoj datum
            </Link>
          </div>
        </Container>
      </section>

      {/* Zona 2 — svetla zona: logo, navigacija, kontakt podaci */}
      <section className="border-t border-[var(--border)] bg-[var(--bg)]">
        <Container className="py-12">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xs">
              <Link href="/" className="brand-logo font-serif text-xl">
                <span className="brand-part">Studio Contrast</span>
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                Prirodni momenti — foto &amp; video u boji i crno-belo.
              </p>
            </div>

            <nav
              className="flex flex-col gap-2 text-sm"
              aria-label="Navigacija u podnožju"
            >
              {FOOTER_NAV.map((i) => (
                <Link key={i.href} href={i.href} className="navlink w-fit">
                  {i.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-2 text-sm text-[var(--muted)]">
              <p>Carinska 4, Užice</p>
              <a
                href="https://www.instagram.com/studio_contrast_031/"
                target="_blank"
                rel="noopener noreferrer"
                className="navlink inline-flex w-fit items-center gap-2"
                aria-label="Instagram — otvara se u novom tabu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a6 6 0 1 1 0 12a6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM18 6.2a1 1 0 1 1 0 2a1 1 0 0 1 0-2z"
                  />
                </svg>
                Instagram
              </a>
            </div>
          </div>

          <div className="divider mt-10" />

          <p className="mt-6 text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} Studio Contrast — Dostupni širom regiona
          </p>
        </Container>
      </section>
    </footer>
  );
}

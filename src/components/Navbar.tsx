// src/components/Navbar.tsx
// Editorial navigacija: fiksna traka koja preko heroja stoji providno
// (svetli tekst), a na skrol prelazi u ivory sa hairline ivicom.
// variant="solid" (default) — uvek ivory, sa spacer-om ispod.
// variant="overlay" — providna preko full-bleed heroja.
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type PlanSlug = "basic" | "classic" | "signature";

const PLANS: readonly { slug: PlanSlug; name: string; from: string; note: string }[] = [
  { slug: "basic", name: "Standard", from: "od 150 €", note: "Intimna slavlja" },
  { slug: "classic", name: "Premium", from: "od 200 €", note: "Celodnevno pokriće" },
  { slug: "signature", name: "Signature", from: "od 300 €", note: "Foto + film" },
] as const;

const LEFT_NAV = [
  { href: "/portfolio", label: "Priče" },
  { href: "/onama", label: "O nama" },
];

const RIGHT_NAV = [
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navbar({ variant = "solid" }: { variant?: "solid" | "overlay" }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    // Ponovna provera posle učitavanja — layout pomeraji umeju da ostave
    // ustajalo stanje bez novog scroll eventa.
    const t = window.setTimeout(onScroll, 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Zaključaj skrol dok je mobilni meni otvoren
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const openPlans = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setPlansOpen(true);
  };
  const scheduleClosePlans = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setPlansOpen(false), 160);
  };

  const light = variant === "overlay" && !scrolled && !open;
  const linkCls = light ? "navlink navlink--light" : "navlink";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-500 ${
          light
            ? "nav-light nav-overlay-text border-b-0 bg-transparent"
            : "border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-sm"
        }`}
        style={
          light
            ? {
                background:
                  "linear-gradient(to bottom, rgba(12,10,8,0.65) 0%, rgba(12,10,8,0.32) 60%, rgba(12,10,8,0) 100%)",
              }
            : undefined
        }
      >
        {/* Desktop */}
        <div className="mx-auto hidden h-20 w-full max-w-[1480px] grid-cols-3 items-center px-8 md:grid">
          <nav className="flex items-center gap-8" aria-label="Glavna navigacija">
            {LEFT_NAV.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className={`${linkCls} text-[11px] uppercase tracking-[0.16em]`}
              >
                {i.label}
              </Link>
            ))}

            {/* Paketi — miran editorial dropdown */}
            <div
              className="relative inline-block"
              onMouseEnter={openPlans}
              onMouseLeave={scheduleClosePlans}
              onFocus={openPlans}
              onBlur={scheduleClosePlans}
            >
              <Link
                href="/ponude"
                className={`${linkCls} inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em]`}
                aria-haspopup="menu"
                aria-expanded={plansOpen}
              >
                Paketi
                <svg width="7" height="5" viewBox="0 0 7 5" aria-hidden="true" className="opacity-50">
                  <path d="M1 1l2.5 2.5L6 1" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              </Link>

              {plansOpen && (
                <div
                  role="menu"
                  onMouseEnter={openPlans}
                  onMouseLeave={scheduleClosePlans}
                  className="absolute left-1/2 top-full z-50 w-[340px] -translate-x-1/2 border border-[var(--border)] bg-[var(--bg)] pt-2 shadow-[0_24px_60px_-24px_rgba(23,20,18,0.18)]"
                >
                  {PLANS.map((p, i) => (
                    <Link
                      key={p.slug}
                      href={`/ponude?plan=${p.slug}`}
                      className={`group/plan flex items-baseline justify-between gap-4 px-6 py-4 transition hover:bg-[var(--surface-2)]/60 ${
                        i > 0 ? "border-t border-[var(--border)]" : ""
                      }`}
                    >
                      <span>
                        <span className="font-serif text-lg text-[var(--fg)]">{p.name}</span>
                        <span className="mt-0.5 block text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                          {p.note}
                        </span>
                      </span>
                      <span className="whitespace-nowrap text-[13px] text-[var(--accent-strong)]">{p.from}</span>
                    </Link>
                  ))}
                  <Link
                    href="/ponude"
                    className="block border-t border-[var(--border)] px-6 py-3.5 text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] transition hover:text-[var(--fg)]"
                  >
                    Otvorite konfigurator →
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Brand u sredini */}
          <div className="flex items-center justify-center">
            <Link
              href="/"
              className={`brand-logo relative inline-flex flex-col items-center justify-center px-4 py-1 focus:outline-none ${
                light ? "text-[var(--ink-fg)]" : "text-[var(--fg)]"
              }`}
            >
              <span className="font-serif text-[22px] leading-none tracking-[0.01em]">
                <span className="brand-part">Studio</span>{" "}
                <span className="brand-part serif-italic">Contrast</span>
              </span>
              <span
                className={`mt-1.5 text-[8.5px] uppercase tracking-[0.42em] ${
                  light ? "text-[var(--ink-fg)]/60" : "text-[var(--muted)]"
                }`}
              >
                Foto &amp; film
              </span>
            </Link>
          </div>

          <div className="flex items-center justify-end gap-8">
            {RIGHT_NAV.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className={`${linkCls} text-[11px] uppercase tracking-[0.16em]`}
              >
                {i.label}
              </Link>
            ))}
            <Link
              href="/upit"
              className={`btn ${light ? "btn-light-outline" : "btn-primary"} !px-6 !py-2.5 !text-[11px]`}
            >
              Proverite datum
            </Link>
          </div>
        </div>

        {/* Mobile traka */}
        <div className="flex h-16 items-center justify-between px-5 md:hidden">
          <Link
            href="/"
            className={`brand-logo font-serif text-lg ${light ? "text-[var(--ink-fg)]" : "text-[var(--fg)]"}`}
            onClick={() => setOpen(false)}
          >
            <span className="brand-part">Studio</span>{" "}
            <span className="brand-part serif-italic">Contrast</span>
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Zatvorite meni" : "Otvorite meni"}
            aria-expanded={open}
            className={`inline-flex h-10 items-center gap-2.5 text-[11px] uppercase tracking-[0.22em] ${
              open ? "text-[var(--ink-fg)]" : light ? "text-[var(--ink-fg)]" : "text-[var(--fg)]"
            }`}
          >
            {open ? "Zatvori" : "Meni"}
            <span className="relative block h-[10px] w-5" aria-hidden="true">
              <span
                className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-300 ${
                  open ? "translate-y-[4.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-300 ${
                  open ? "-translate-y-[4.5px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Mobilni meni — full screen, ink */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-[var(--ink)] text-[var(--ink-fg)] transition-opacity duration-500 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <nav className="flex flex-1 flex-col justify-center gap-1 px-8 pt-16" aria-label="Mobilna navigacija">
          {[
            { href: "/portfolio", label: "Priče", n: "01" },
            { href: "/ponude", label: "Paketi", n: "02" },
            { href: "/onama", label: "O nama", n: "03" },
            { href: "/faq", label: "FAQ", n: "04" },
            { href: "/kontakt", label: "Kontakt", n: "05" },
          ].map((i, idx) => (
            <Link
              key={i.href}
              href={i.href}
              onClick={() => setOpen(false)}
              className={`group flex items-baseline gap-4 border-b border-white/10 py-4 transition-all duration-500 ${
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${120 + idx * 60}ms` : "0ms" }}
            >
              <span className="text-[10px] tracking-[0.3em] text-[var(--accent)]">{i.n}</span>
              <span className="font-serif text-[34px] leading-tight transition group-hover:text-[var(--accent)]">
                {i.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="px-8 pb-10">
          <Link
            href="/upit"
            onClick={() => setOpen(false)}
            className="btn btn-light w-full"
          >
            Proverite svoj datum
          </Link>
          <p className="mt-6 text-center text-[11px] uppercase tracking-[0.25em] text-[var(--ink-fg)]/50">
            Užice · Zlatibor · Srbija
          </p>
        </div>
      </div>

      {/* Spacer za stranice bez full-bleed heroja */}
      {variant === "solid" && <div className="h-16 md:h-20" aria-hidden="true" />}
    </>
  );
}

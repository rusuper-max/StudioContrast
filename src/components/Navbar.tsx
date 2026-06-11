// src/components/Navbar.tsx
"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Container from "./Container";

type PlanSlug = "basic" | "classic" | "signature";

/** Fallback (usklađen: “Studio” umesto “Portret”, nema “Drugo”) */
const FALLBACK_EVENTS = ["Svadba", "Venčanje", "Studio", "Rođendani", "Krštenja"] as const;

const rightNav = [
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
];

/** Paketi + boje (ujednačena editorial paleta: taupe / šampanj / ink) */
const OFFERS: readonly {
  slug: PlanSlug;
  name: string;
  color: string; // akcent za ivicu/hover
  wipe: string;  // diskretan flat tint na hover
}[] = [
  {
    slug: "basic",
    name: "Standard",
    color: "#9A938A",
    wipe: "rgba(154,147,138,0.14)",
  },
  {
    slug: "classic",
    name: "Premium",
    color: "#B89B5E",
    wipe: "rgba(184,155,94,0.16)",
  },
  {
    slug: "signature",
    name: "Signature",
    color: "#2B2925",
    wipe: "rgba(43,41,37,0.08)",
  },
] as const;

/** FIKS širina jedne pločice (paket i event pločice jednako široke) */
const TILE_W = 240; // px

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);
  const [hoverPlan, setHoverPlan] = useState<PlanSlug>("basic");
  const [events, setEvents] = useState<string[]>([...FALLBACK_EVENTS]);

  // timer za odloženo zatvaranje (sprečava "bljeskanje")
  const closeTimerRef = useRef<number | null>(null);

  // učitaj tipove proslave iz API-ja (ako postoji)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/inquiry/addons?onlyTypes=1", { cache: "no-store" });
        const data = res.ok ? await res.json() : null;
        const list: string[] | undefined = data?.eventTypes || data?.event_types || data?.types;
        if (!cancelled && Array.isArray(list) && list.length) setEvents(list);
      } catch {
        /* fallback ostaje */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const openOffers = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOffersOpen(true);
  };

  const scheduleCloseOffers = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setOffersOpen(false), 180);
  };

  const activeOffer = OFFERS.find(o => o.slug === hoverPlan) || OFFERS[0];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]">
      {/* Desktop */}
      <Container className="hidden h-16 items-center justify-between md:grid md:grid-cols-3">
        {/* LEFT NAV */}
        <nav className="flex items-center gap-6">
          <Link href="/portfolio" className="navlink text-sm inline-flex items-center">
            Priče
          </Link>

          {/* Paketi — mega dropdown (levo paketi, desno vidovi) */}
          <div
            className="relative inline-block"
            onMouseEnter={openOffers}
            onMouseLeave={scheduleCloseOffers}
            onFocus={openOffers}
            onBlur={scheduleCloseOffers}
          >
            <Link
              href="/ponude"
              className="navlink text-sm inline-flex items-center"
              aria-haspopup="menu"
              aria-expanded={offersOpen}
            >
              Paketi <span className="ml-1 text-[var(--muted)]" aria-hidden="true">▾</span>
            </Link>

            {offersOpen && (
              <div
                className="absolute left-0 top-full z-50 mt-0 overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl shadow-black/5"
                role="menu"
                onMouseEnter={openOffers}
                onMouseLeave={scheduleCloseOffers}
                style={
                  {
                    // širina = 1 kolona paketa + most + 2 kolone eventa + unutrašnji gapovi
                    minWidth: `${TILE_W + 8 + (TILE_W * 2 + 8) + 16}px`,
                    ["--accentColor" as any]: activeOffer.color,
                  } as React.CSSProperties
                }
              >
                {/* uvek u JEDNOM redu; items-stretch => leva kolona prati visinu desne */}
                <div className="flex flex-nowrap items-stretch gap-2">
                  {/* Levo: paketi (fiksna širina, FLEX-COL i svaka pločica flex-1 da popuni visinu) */}
                  <div
                    className="shrink-0 rounded-xl border border-[var(--border)] p-2 flex flex-col"
                    style={{ width: TILE_W }}
                  >
                    <div className="px-1 pb-1 text-xs text-[var(--muted)]">Izaberite paket</div>
                    <div className="flex flex-col gap-2 h-full">
                      {OFFERS.map((o) => {
                        const active = hoverPlan === o.slug;
                        return (
                          <button
                            key={o.slug}
                            onMouseEnter={() => setHoverPlan(o.slug)}
                            className="offer-item relative overflow-hidden rounded-lg px-3 py-2 text-left text-sm text-[var(--fg)] transition focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)] flex-1 min-h-[48px]"
                            title={o.name}
                            aria-pressed={active}
                            style={{
                              boxShadow: active ? `inset 0 0 0 1px ${o.color}` : "none",
                              border: active ? `1px solid ${o.color}` : "1px solid var(--border)",
                              backgroundColor: "var(--surface)",
                            }}
                          >
                            <span
                              className="color-wipe pointer-events-none absolute inset-0 z-0 opacity-0"
                              style={{ background: o.wipe }}
                            />
                            <span className="relative z-10 flex items-center justify-between">
                              {o.name}
                              <span className="text-[var(--muted)] transition-transform">→</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* mali “most” da prelaz miša ne prekine meni */}
                  <div className="w-2 shrink-0" />

                  {/* Desno: vidovi (svaka pločica tačno kao levo: TILE_W) */}
                  <div className="shrink-0 rounded-xl border border-[var(--border)] p-2">
                    <div className="px-2 pb-1 text-xs text-[var(--muted)]">Izaberite vid proslave</div>
                    <ul
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(2, ${TILE_W}px)`,
                        gap: "8px",
                      }}
                    >
                      {events.map((ev) => (
                        <li key={ev}>
                          <Link
                            href={`/ponude?plan=${activeOffer.slug}&type=${encodeURIComponent(ev)}`}
                            className="event-link group relative block overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] transition min-h-[48px]"
                            title={`${activeOffer.name} — ${ev}`}
                          >
                            <span className="relative z-10 flex items-center justify-between">
                              <span className="inline-flex items-center gap-2">
                                <span
                                  className="inline-block h-1.5 w-1.5 rounded-full"
                                  style={{ background: "var(--accentColor)" }}
                                />
                                {ev}
                              </span>
                              <span className="text-[var(--muted)] transition-transform group-hover:translate-x-0.5">→</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/onama" className="navlink text-sm inline-flex items-center">
            O nama
          </Link>
        </nav>

        {/* Brand u sredini */}
        <div className="flex items-center justify-center">
          <Link href="/" className="brand-logo relative inline-flex items-center justify-center px-4 py-1 focus:outline-none">
            <span className="font-serif text-xl md:text-2xl leading-none">
              <span className="brand-part">Studio</span>{" "}
              <span className="brand-part">Contrast</span>
            </span>
          </Link>
        </div>

        {/* RIGHT NAV + CTA */}
        <div className="flex items-center justify-end gap-6">
          {rightNav.map((i) => (
            <Link key={i.href} href={i.href} className="navlink text-sm inline-flex items-center">
              {i.label}
            </Link>
          ))}
          <Link href="/upit" className="btn btn-primary">Proverite svoj datum</Link>
        </div>
      </Container>

      {/* Mobile */}
      <Container className="flex h-16 items-center justify-between md:hidden">
        <Link href="/" className="brand-logo font-serif text-lg">
          <span className="brand-part">Studio Contrast</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm text-[var(--fg)] transition hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
          aria-label="Otvori meni"
          aria-expanded={open}
        >
          Meni
        </button>
      </Container>

      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg)]">
          <Container className="flex flex-col gap-1 py-4">
            <Link href="/portfolio" className="py-2 font-serif text-2xl text-[var(--fg)] hover:text-[var(--accent-strong)]" onClick={() => setOpen(false)}>
              Priče
            </Link>
            <Link href="/ponude" className="py-2 font-serif text-2xl text-[var(--fg)] hover:text-[var(--accent-strong)]" onClick={() => setOpen(false)}>
              Paketi
            </Link>
            <Link href="/onama" className="py-2 font-serif text-2xl text-[var(--fg)] hover:text-[var(--accent-strong)]" onClick={() => setOpen(false)}>
              O nama
            </Link>
            <Link href="/faq" className="py-2 font-serif text-2xl text-[var(--fg)] hover:text-[var(--accent-strong)]" onClick={() => setOpen(false)}>
              FAQ
            </Link>
            <Link href="/kontakt" className="py-2 font-serif text-2xl text-[var(--fg)] hover:text-[var(--accent-strong)]" onClick={() => setOpen(false)}>
              Kontakt
            </Link>
            <Link href="/upit" onClick={() => setOpen(false)} className="btn btn-primary mt-3 w-full">
              Proverite svoj datum
            </Link>
          </Container>
        </div>
      )}

      {/* Lokalni stil: wipe i hover akcenti */}
      <style>{`
        .offer-item .color-wipe {
          transform-origin: left;
          transform: scaleX(0);
          transition: transform .35s ease, opacity .2s ease;
        }
        .offer-item:hover .color-wipe {
          transform: scaleX(1);
          opacity: 1;
        }
        .event-link:hover,
        .event-link:focus-visible {
          border-color: var(--accentColor);
          box-shadow: inset 0 0 0 1px var(--accentColor);
        }
      `}</style>
    </header>
  );
}

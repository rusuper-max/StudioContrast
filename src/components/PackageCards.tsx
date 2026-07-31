// src/components/PackageCards.tsx
// Paketi na početnoj — editorial kolone razdvojene hairline linijama,
// serif cene, bez kartica. Klik vodi u konfigurator sa prefill-om plana.
import Link from "next/link";
import { HOME_PACKAGES } from "@/data/homePackages";
import type { PlanSlug } from "@/data/packages";

const ORDER: PlanSlug[] = ["basic", "classic", "signature"];

export default function PackageCards() {
  return (
    <div className="grid border-y border-[var(--border)] md:grid-cols-3 md:divide-x md:divide-[var(--border)]">
      {ORDER.map((slug, col) => {
        const p = HOME_PACKAGES[slug];
        const featured = slug === "classic";

        return (
          <Link
            key={slug}
            href={`/ponude?plan=${slug}`}
            className={`group relative flex flex-col px-2 py-10 transition-colors duration-300 hover:bg-[var(--surface-2)]/50 md:px-10 md:py-14 ${
              col > 0 ? "border-t border-[var(--border)] md:border-t-0" : ""
            }`}
          >
            <div>
              {/* Rezervisan red za bedž u SVIM kolonama — baseline cena ostaje poravnat */}
              <span
                className={`mb-3 block h-[2px] w-8 ${featured ? "bg-[var(--accent)]" : "bg-transparent"}`}
                aria-hidden="true"
              />
              <span className="flex items-baseline gap-3">
                <span className="text-[11px] uppercase tracking-[0.28em] text-[var(--fg)]">
                  {p.name}
                </span>
                {featured && (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                    Najtraženiji
                  </span>
                )}
              </span>
            </div>

            <p className="mt-6 font-serif text-[clamp(34px,3vw,44px)] leading-none">
              <span className="text-[0.5em] uppercase tracking-[0.2em] text-[var(--muted)]">od </span>
              {p.fromPrice.toLocaleString("sr-RS")}
              <span className="serif-italic text-[0.62em]"> €</span>
            </p>

            <p className="mt-5 max-w-[30ch] text-sm leading-relaxed text-[var(--muted)]">{p.blurb}</p>

            <ul className="mt-8 flex-1 space-y-[18px]">
              {p.bullets.slice(0, 5).map((line, i) => (
                <li key={i} className="text-[13.5px] leading-snug text-[var(--fg)]/85">
                  {line}
                </li>
              ))}
            </ul>

            <span
              className="mt-10 self-start text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] transition group-hover:text-[var(--accent-strong)]"
              aria-hidden="true"
            >
              Prilagodite →
            </span>
          </Link>
        );
      })}
    </div>
  );
}

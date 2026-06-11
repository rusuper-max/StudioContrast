// src/components/PackageCards.tsx
// Teaser paketa na početnoj — bele kartice sa hairline ivicom.
// Klik na karticu otvara konfigurator sa prefill-om plana (/ponude?plan=...).
import Link from "next/link";
import { HOME_PACKAGES } from "@/data/homePackages";
import type { PlanSlug } from "@/data/packages";

const ORDER: PlanSlug[] = ["basic", "classic", "signature"];

export default function PackageCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {ORDER.map((slug) => {
        const p = HOME_PACKAGES[slug];
        const featured = slug === "classic";

        return (
          <Link
            key={slug}
            href={`/ponude?plan=${slug}`}
            className="card group relative block p-6 pt-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-strong)]"
            style={
              featured
                ? {
                    borderColor: "var(--accent)",
                    boxShadow: "0 0 0 1px var(--accent)",
                  }
                : undefined
            }
          >
            {featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--accent)] bg-[var(--surface)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                Najtraženiji
              </span>
            )}

            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-serif text-xl">{p.name}</h3>
              <span className="whitespace-nowrap text-sm text-[var(--accent-strong)]">
                od {p.fromPrice.toLocaleString("sr-RS")} €
              </span>
            </div>

            <p className="mt-2 text-sm text-[var(--muted)]">{p.blurb}</p>

            <ul className="mt-4 space-y-2 text-sm">
              {p.bullets.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span
                    className="mt-[7px] inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]"
                    aria-hidden="true"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <span className="mt-5 inline-flex items-center gap-1 text-sm text-[var(--accent-strong)]">
              Prilagodite paket
              <span
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                →
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

// src/components/PricingSection.tsx
// Editorial pregled tipova proslava — hairline kolone (bez kartica),
// serif cene, izbor označen šampanj linijom umesto okvira.
"use client";

import { useState } from "react";

type PlanId = "svadba" | "vencanje" | "portret" | "rodjendan" | "krstenja";

type Plan = {
  id: PlanId;
  title: string;
  price: string;
  features: string[];
  cta?: string;
};

const PLANS: Plan[] = [
  {
    id: "svadba",
    title: "Svadba",
    price: "od 900 €",
    features: ["Ceo dan", "2 fotografa", "Album 30x30", "Online galerija"],
    cta: "Izaberite Svadbu",
  },
  {
    id: "vencanje",
    title: "Venčanje",
    price: "od 1.200 €",
    features: ["Ceo dan + video", "2 fotografa", "Foto knjiga", "Online galerija"],
    cta: "Izaberite Venčanje",
  },
  {
    id: "portret",
    title: "Portret",
    price: "od 150 €",
    features: ["Studijski / outdoor", "Retuš 10 fotki", "Online isporuka"],
    cta: "Izaberite Portret",
  },
  {
    id: "rodjendan",
    title: "Rođendan",
    price: "od 180 €",
    features: ["Do 3h snimanja", "50+ obrađenih fotki", "Online galerija"],
    cta: "Izaberite Rođendan",
  },
  {
    id: "krstenja",
    title: "Krštenja",
    price: "od 220 €",
    features: ["Crkveni obred", "Porodične fotografije", "Online galerija"],
    cta: "Izaberite Krštenja",
  },
];

export default function PricingSection({
  highlightTextToo = true, // ako je true — naslov/cena u šampanj tonu kada je selektovan
  initialSelected,
}: {
  highlightTextToo?: boolean;
  initialSelected?: PlanId;
}) {
  const [selected, setSelected] = useState<PlanId | null>(initialSelected ?? null);

  return (
    <section className="section">
      <div className="mb-12 md:mb-16">
        <span className="eyebrow">Ponude</span>
        <h2 className="display-2 mt-4 max-w-[16ch]">
          Naši <em className="serif-italic">paketi</em>
        </h2>
        <p className="lead mt-5 max-w-md text-[15px] leading-relaxed">
          Izaberite tip proslave koji vam odgovara — cene su orijentacione.
        </p>
      </div>

      <div className="grid border-y border-[var(--border)] sm:grid-cols-2 sm:divide-x sm:divide-[var(--border)] lg:grid-cols-5">
        {PLANS.map((p, col) => {
          const isActive = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(isActive ? null : p.id)}
              aria-pressed={isActive}
              className={[
                "group relative flex flex-col px-5 py-8 text-left transition-colors duration-300",
                "hover:bg-[var(--surface-2)]/50",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent-strong)]",
                col > 0 ? "border-t border-[var(--border)] sm:border-t-0" : "",
              ].join(" ")}
            >
              {/* Šampanj linija na vrhu kad je selektovan */}
              <span
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[var(--accent)] transition-opacity duration-300",
                  isActive ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />

              <span className="flex items-baseline justify-between gap-2">
                <span
                  className={[
                    "text-[11px] uppercase tracking-[0.28em] transition-colors",
                    isActive && highlightTextToo
                      ? "text-[var(--accent-strong)]"
                      : "text-[var(--fg)]",
                  ].join(" ")}
                >
                  {p.title}
                </span>
                {isActive && (
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                    Izabrano
                  </span>
                )}
              </span>

              <span
                className={[
                  "mt-5 block font-serif text-[26px] leading-none transition-colors",
                  isActive && highlightTextToo ? "text-[var(--accent-strong)]" : "text-[var(--fg)]",
                ].join(" ")}
              >
                {p.price}
              </span>

              <ul className="mt-6 flex-1 space-y-[10px]">
                {p.features.map((f, i) => (
                  <li key={i} className="text-[13.5px] leading-snug text-[var(--fg)]/85">
                    {f}
                  </li>
                ))}
              </ul>

              <span
                className="mt-8 self-start text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] transition-colors group-hover:text-[var(--accent-strong)]"
                aria-hidden="true"
              >
                {isActive ? "Poništite izbor" : (p.cta ?? "Izaberite")} →
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

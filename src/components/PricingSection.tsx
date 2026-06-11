"use client";

import { useState } from "react";

/**
 * Boje po paketu — svetla editorial paleta (samo za ivicu/tekst selektovane kartice)
 */
type PlanId = "svadba" | "vencanje" | "portret" | "rodjendan" | "krstenja";

type Plan = {
  id: PlanId;
  title: string;
  price: string;
  color: string;       // koristi se za outline/tekst kad je selektovan (CSS var)
  features: string[];
  cta?: string;
};

const PLANS: Plan[] = [
  {
    id: "svadba",
    title: "Svadba",
    price: "od 900€",
    color: "#2B2925", // ink
    features: ["Ceo dan", "2 fotografa", "Album 30x30", "Online galerija"],
    cta: "Izaberite Svadbu",
  },
  {
    id: "vencanje",
    title: "Venčanje",
    price: "od 1200€",
    color: "#8C7340", // šampanj (tekst-bezbedan)
    features: ["Ceo dan + video", "2 fotografa", "Foto knjiga", "Online galerija"],
    cta: "Izaberite Venčanje",
  },
  {
    id: "portret",
    title: "Portret",
    price: "od 150€",
    color: "#9A938A", // topli siva
    features: ["Studijski / outdoor", "Retuš 10 fotki", "Online isporuka"],
    cta: "Izaberite Portret",
  },
  {
    id: "rodjendan",
    title: "Rođendan",
    price: "od 180€",
    color: "#6F6A60", // muted ink
    features: ["Do 3h snimanja", "50+ obrađenih fotki", "Online galerija"],
    cta: "Izaberite Rođendan",
  },
  {
    id: "krstenja",
    title: "Krštenja",
    price: "od 220€",
    color: "#B89B5E", // šampanj
    features: ["Crkveni obred", "Porodične fotografije", "Online galerija"],
    cta: "Izaberite Krštenja",
  },
];

export default function PricingSection({
  highlightTextToo = true,  // ako je true — ofarba i naslov/cenu u boju paketa kada je selektovan
  initialSelected,
}: {
  highlightTextToo?: boolean;
  initialSelected?: PlanId;
}) {
  const [selected, setSelected] = useState<PlanId | null>(initialSelected ?? null);

  return (
    <section className="section">
      <div className="mb-8 text-center">
        <div className="kicker">Ponude</div>
        <h2 className="mt-3 font-serif text-3xl md:text-4xl">Naši paketi</h2>
        <p className="lead mx-auto mt-3 max-w-2xl">
          Izaberite tip proslave koji vam odgovara — cene su orijentacione.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((p) => {
          const isActive = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(isActive ? null : p.id)}
              aria-pressed={isActive}
              style={{ ["--card-accent" as any]: p.color }}
              className={[
                "group relative flex flex-col rounded-xl border bg-[var(--surface)] p-5 text-left transition",
                isActive
                  ? "border-[var(--card-accent)] shadow-[0_0_0_1px_var(--card-accent)]"
                  : "border-[var(--border)] hover:border-[var(--border-strong)]",
                "focus-visible:outline-2 focus-visible:outline-[var(--accent-strong)] focus-visible:outline-offset-2",
              ].filter(Boolean).join(" ")}
            >
              {/* Tanka akcent-linija na vrhu kad je selektovan */}
              <span
                className={[
                  "pointer-events-none absolute inset-x-0 top-0 h-0.5 rounded-t-xl opacity-0 transition",
                  isActive && "opacity-100",
                ].join(" ")}
                style={{ background: "var(--card-accent)" }}
                aria-hidden
              />

              <div className="mb-2 flex items-center justify-between">
                <span
                  className={[
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs transition",
                    isActive
                      ? "border-[var(--card-accent)] text-[var(--card-accent)]"
                      : "border-[var(--border)] text-[var(--muted)]",
                  ].join(" ")}
                >
                  {p.title}
                </span>
                <span
                  className={[
                    "text-sm font-medium transition",
                    isActive && highlightTextToo ? "text-[var(--card-accent)]" : "text-[var(--fg)]",
                  ].join(" ")}
                >
                  {p.price}
                </span>
              </div>

              <ul className="mt-3 grid gap-2 text-sm text-[var(--fg)]">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className={[
                        "mt-1.5 inline-block h-1.5 w-1.5 rounded-full",
                        isActive ? "bg-[var(--card-accent)]" : "bg-[var(--border-strong)]",
                      ].join(" ")}
                      aria-hidden
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span
                  className={[
                    "text-xs transition",
                    isActive && highlightTextToo ? "text-[var(--card-accent)]" : "text-[var(--muted)]",
                  ].join(" ")}
                >
                  Kliknite da {isActive ? "poništite izbor" : "odaberete paket"}
                </span>
                <span
                  className={[
                    "rounded-full border px-3 py-1.5 text-sm transition",
                    isActive
                      ? "border-[var(--card-accent)] text-[var(--card-accent)]"
                      : "border-[var(--border-strong)] text-[var(--fg)] group-hover:border-[var(--accent-strong)] group-hover:text-[var(--accent-strong)]",
                  ].join(" ")}
                >
                  {p.cta ?? "Izaberite"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

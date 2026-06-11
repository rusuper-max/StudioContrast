// src/components/PricingConfigurator.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PLANS, type PlanSlug } from "@/data/packages";
import { getPlanIncludes } from "@/data/planIncludes";
import { EVENT_TYPES as FALLBACK_EVENTS, type EventType } from "@/lib/addons";
import type { AddonRule } from "@/lib/addons";

/** Vizuelne boje po paketu — svetla editorial paleta */
const PLAN_COLORS: Record<PlanSlug, { ring: string }> = {
  basic: { ring: "#9A938A" },
  classic: { ring: "#B89B5E" },
  signature: { ring: "#2B2925" },
};

/** Prikazna imena (vizuelno), slugovi ostaju isti */
const DISPLAY_PLAN_NAME: Record<PlanSlug, string> = {
  basic: "Standard",
  classic: "Premium",
  signature: "Signature",
};

type Props = { initialPlan?: PlanSlug; initialType?: string };

/** Lepo labelovanje za ključ addona */
function prettyLabel(key: string) {
  const k = key.toLowerCase();
  if (k === "secondphotog") return "Drugi fotograf";
  if (k === "thirdphotog" || k === "trecifotograf") return "Treći fotograf";
  if (k === "dodatnikamerman" || k === "secondvideographer") return "Dodatni kamerman";
  if (k === "video") return "Video";
  if (k === "video4k" || k === "4kvideo" || k === "4k video") return "4K video";
  if (k === "drone" || k === "dron") return "Dron";
  if (k === "album") return "Album (premium)";
  if (k === "express" || k === "expres" || k === "ekspres") return "Ekspres obrada";
  if (k === "raw" || k === "rawfiles") return "RAW fajlovi";
  if (k === "printonsite" || k === "izrada foto na licu mesta") return "Izrada fotografija na licu mesta";
  if (k === "usb") return "USB";
  if (k === "dontpublish") return "Ne objavljuj u portfoliju / na mrežama";
  // fallback – Title Case
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\p{L}+/gu, (w) => w[0].toUpperCase() + w.slice(1));
}

/** ——— Pomocni tipovi za prefill iz URL-a ——— */
type InitFromQuery = {
  plan?: PlanSlug;
  type?: string;
  extraHours?: number;
  addons: Record<string, boolean>;
  dontPublish?: boolean;
};

/** ——— URL type → canonical event name (robust match) ——— */
function normalizeAsciiKey(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, ""); // squash non-alphanum
}

/**
 * Pokušava da nađe najbliže poklapanje među event tipovima koje API vraća,
 * tolerantno na dijakritike, sing./plurale i sinonime ("Studio" ↔ "Portret", "Svadba" ↔ "Venčanje", "Rođendan" ↔ "Rođendani" itd).
 */
function findClosestEventType(raw: string | undefined, candidates: string[]): string | undefined {
  if (!raw) return undefined;
  const key = normalizeAsciiKey(raw);
  const pool = candidates.map((c) => ({ raw: c, key: normalizeAsciiKey(c) }));

  // 1) direktno poklapanje po normalizovanom ključu
  const exact = pool.find((p) => p.key === key);
  if (exact) return exact.raw;

  // 2) sinonimi / klasteri
  const CLUSTERS: Record<string, string[]> = {
    svadba: ["svadba", "vencanje", "venčanje"],
    vencanje: ["svadba", "vencanje", "venčanje"],
    studio: ["studio", "portret", "portreti"],
    portret: ["studio", "portret", "portreti"],
    rodjendan: ["rodjendan", "rodjendani", "rodendan", "rodendani", "rođendan", "rođendani"],
    krstenje: ["krstenje", "krstenja", "krštenje", "krštenja"],
    drugo: ["drugo"],
  };

  // nađi klaster kome pripada "key"
  const cluster = Object.values(CLUSTERS).find((arr) => arr.includes(key));
  if (cluster) {
    const hit = pool.find((p) => cluster.includes(p.key));
    if (hit) return hit.raw;
  }

  // 3) soft match: startsWith / contains
  const soft = pool.find((p) => p.key.startsWith(key) || key.startsWith(p.key));
  if (soft) return soft.raw;

  return undefined;
}

function readInitFromUrl(): InitFromQuery {
  if (typeof window === "undefined") return { addons: {} };
  const q = new URLSearchParams(window.location.search);
  const toBool = (x: string | null) => (x ? ["1","true","yes"].includes(x.toLowerCase()) : false);
  const plan = q.get("plan");
  const planSlug = (["basic","classic","signature"] as const).includes(plan as any) ? (plan as PlanSlug) : undefined;
  const extraHours = Number(q.get("extraHours"));
  const addons: Record<string, boolean> = {};
  const known = [
    "secondPhotog","thirdPhotog","secondVideographer","video","video4k","drone",
    "album","express","raw","printOnSite","usb","dontPublish",
  ];
  for (const k of known) if (toBool(q.get(k))) addons[k] = true;
  return {
    plan: planSlug,
    type: q.get("type") || undefined,
    extraHours: Number.isFinite(extraHours) ? extraHours : undefined,
    addons,
    dontPublish: toBool(q.get("dontPublish")),
  };
}
// —— Robustno mapiranje tipa proslave iz URL-a na dostupne iz API-ja ——
function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // skini dijakritiku
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// sinonimi i jednina/množina → kanonsko ime
const TYPE_ALIASES: Record<string, string> = {
  svadba: "Svadba",
  vencanje: "vencanje",
  "venčanje": "Venčanje",

  studio: "Studio",
  portret: "Studio",

  rodjendan: "Rođendan",
  rodjendani: "Rođendan",
  "rođendan": "Rođendan",
  "rođendani": "Rođendan",

  krstenje: "Krštenje",
  "krštenje": "Krštenje",
  krstenja: "Krštenje",
  "krštenja": "Krštenje",

  drugo: "Drugo",
};

function matchEventType(raw: string | undefined | null, available: string[], fallback: string) {
  if (!available?.length) return fallback;
  if (!raw) return available.includes(fallback) ? fallback : available[0];

  const n = norm(raw);

  // 1) direktan alias → kanon, ako postoji u listi
  const aliased = TYPE_ALIASES[n];
  if (aliased && available.includes(aliased)) return aliased;

  // 2) tačno normalizovano poklapanje
  for (const ev of available) if (norm(ev) === n) return ev;

  // 3) "meko" poklapanje (startsWith u oba smera)
  for (const ev of available) {
    const m = norm(ev);
    if (m.startsWith(n) || n.startsWith(m)) return ev;
  }

  // 4) fallback
  return available.includes(fallback) ? fallback : available[0];
}

export default function PricingConfigurator({ initialPlan = "classic", initialType }: Props) {
  const initQ = useRef<InitFromQuery>(readInitFromUrl());
  const [plan, setPlan] = useState<PlanSlug>(initQ.current.plan || initialPlan);
  // SSR-safe inicijalni type: mapiramo searchParams?.type na najbliži dostupni iz FALLBACK_EVENTS
const [eventType, setEventType] = useState<EventType>(() =>
  matchEventType(initialType, FALLBACK_EVENTS as unknown as string[], "Svadba") as EventType
);

  // Excel/Sheets data
  const [events, setEvents] = useState<EventType[]>(FALLBACK_EVENTS);
  const [base, setBase] = useState<Record<string, Record<PlanSlug, number>> | null>(null);
  const [rules, setRules] = useState<Record<string, Record<PlanSlug, Record<string, AddonRule>>>>({} as any);
  const [extras, setExtras] = useState<Record<string, Record<PlanSlug, string[]>>>({} as any);
  const [notes, setNotes] = useState<Record<string, Record<PlanSlug, string>>>({} as any);

  // flag da inicijalni URL prefill primenimo samo jednom i tek kad sve stigne
  const [prefilledFromUrl, setPrefilledFromUrl] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // prvo probamo /api/inquiry/addons (ovde smo ga postavili), pa fallback /api/addons
        let res = await fetch("/api/inquiry/addons?debug=0", { cache: "no-store" });
        if (!res.ok) res = await fetch("/api/addons", { cache: "no-store" });
        if (!res.ok) return;

        const json = await res.json();
        if (!json?.ok) return;

        // USB patch (harmless ako nije potreban)
        const patched = promoteUsbIncluded(json);

        if (!cancelled) {
          setEvents(patched.eventTypes);
          setBase(patched.base);
          setRules(patched.addons);
          setExtras(patched.extrasIncluded);
          setNotes(patched.notes);

// Ako URL/SSR nose 'type' — mapiraj ga na najbliži u onome što API vraća
const desired = initQ.current.type || initialType;
const matched = matchEventType(desired, patched.eventTypes as string[], patched.eventTypes[0]);
setEventType(matched as EventType);

          // Ako URL nosi plan — postavi (već je i inicijalni state)
          const p = initQ.current.plan;
          if (p && p !== plan) setPlan(p);
        }
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.error("Fetch addons failed", e);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount

  /** UI state za čekirane addone – dinamički ključ, jer set addona zavisi od event/plan */
  const [addonChecked, setAddonChecked] = useState<Record<string, boolean>>({});

  // Kad promenimo event/plan, resetuj sve što više nije 'available'
  useEffect(() => {
    const current = { ...addonChecked };
    for (const key of addonKeysForCurrent()) {
      const st = effectiveState(key);
      if (st !== "available") current[key] = false;
    }
    setAddonChecked(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType, plan]);

  // ——— nakon što stignu rules + base i jednom primeni prefill iz URL-a ———
  const [extraHours, setExtraHours] = useState(0); // +60€/sat
  useEffect(() => {
    if (prefilledFromUrl) return;
    if (!rules || !base || !events?.length) return;

    // primeni posle mikro-tika, da reset efekt iznad odradi prvo
    const timer = setTimeout(() => {
      const q = initQ.current;

      // extraHours
      if (typeof q.extraHours === "number") setExtraHours(q.extraHours);

      // addons (samo oni koji su available u tekućem stanju)
      const keys = addonKeysForCurrent();
      const next: Record<string, boolean> = {};
      for (const k of keys) {
        if (effectiveState(k) === "available" && q.addons[k]) next[k] = true;
      }
      if (q.dontPublish) next["dontPublish"] = true;
      setAddonChecked((s) => ({ ...s, ...next }));

      setPrefilledFromUrl(true);
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules, base, events, plan, eventType, prefilledFromUrl]);

  // ——— helpers: čitanje iz API matrica ———
  function effectiveBase(): number {
    const v = base?.[eventType]?.[plan];
    return typeof v === "number" ? v : PLANS[plan].basePrice;
  }
  function effectiveBaseFor(p: PlanSlug): number {
    const v = base?.[eventType]?.[p];
    return typeof v === "number" && !Number.isNaN(v) ? v : PLANS[p].basePrice;
  }

  function effectiveRule(key: string): AddonRule {
    const r = rules?.[eventType]?.[plan]?.[key];
    if (r) return r;
    // Fallback: privacy uvek available 0€
    if (key === "dontPublish") return { state: "available", price: 0 };
    return { state: "hidden" };
  }
  function effectiveState(key: string) { return effectiveRule(key).state; }
  function isAvailableRule(r: AddonRule): r is { state: "available"; price?: number } {
    return !!r && (r as any).state === "available";
  }
  function effectivePrice(key: string): number {
    const r = effectiveRule(key);
    if (isAvailableRule(r) && typeof r.price === "number" && !Number.isNaN(r.price)) {
      return r.price;
    }
    return 0;
  }

  /** Redosled prikaza – prvo poznati bitni addoni, zatim ostali, pa na kraju dontPublish */
  function addonKeysForCurrent(): string[] {
    const raw = Object.keys(rules?.[eventType]?.[plan] ?? {});
    const order = ["secondPhotog", "thirdPhotog", "video", "video4k", "drone", "album", "express", "raw", "printOnSite", "usb"];
    const known = order.filter((k) => raw.includes(k));
    const rest = raw.filter((k) => !order.includes(k));
    const withPrivacy = [...known, ...rest, "dontPublish"]; // privacy uvek postoji (fallback)
    return Array.from(new Set(withPrivacy));
  }

  const basePrice = effectiveBase();

  const price = useMemo(() => {
    let sum = basePrice + extraHours * 60;
    for (const key of addonKeysForCurrent()) {
      const st = effectiveState(key);
      if (st === "available" && addonChecked[key]) {
        sum += effectivePrice(key);
      }
    }
    return Math.round(sum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePrice, extraHours, addonChecked, eventType, plan]);

  const continueHref = useMemo(() => {
    // poznati ključevi koje možemo da prosledimo kroz URL
    const knownKeys = [
      "secondPhotog",
      "thirdPhotog",
      "secondVideographer",
      "video",
      "video4k",
      "drone",
      "album",
      "express",
      "raw",
      "printOnSite",
      "usb",
      "dontPublish",
    ] as const;

    const q = new URLSearchParams({
      plan,
      type: eventType,
      price: String(price),          // hint za orijentacionu cenu
      extraHours: String(extraHours),
    });

    // privacy flag
    if (addonChecked["dontPublish"]) q.set("dontPublish", "1");

    // svi čekirani addoni koje znamo → true
    for (const k of knownKeys) {
      if (k === "dontPublish") continue; // već setovano gore
      if (addonChecked[k]) q.set(k, "1");
    }

    return `/upit?${q.toString()}`;
  }, [plan, eventType, price, extraHours, addonChecked]);

  // Opisi: neutralne stavke + extras + uključeni addoni
  const includesBase = getPlanIncludes(eventType, plan);

  const includedAddons: string[] = addonKeysForCurrent()
    .filter((k) => effectiveState(k) === "included" && k !== "dontPublish")
    .map((k) => prettyLabel(k));

  // dedupe extras
  const extrasRaw = extras?.[eventType]?.[plan] ?? [];
  const extrasIncluded = (() => {
    const seen = new Set<string>();
    return extrasRaw.filter((x: string) => {
      const k = x.trim().toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  })();

  const note = notes?.[eventType]?.[plan];

  return (
    <div className="grid gap-6 md:grid-cols-[320px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)_300px]">
      {/* LEVO — izbor */}
      <div className="card self-start p-5">
        {/* Tip proslave */}
        <div>
          <div className="text-sm text-[var(--muted)]">Tip proslave</div>
          <div className="mt-2">
            <div className="relative">
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                aria-label="Tip proslave"
                className="w-full appearance-none rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 pr-9 text-[var(--fg)] transition focus:border-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-[var(--accent-strong)] focus-visible:outline-offset-2"
              >
                {events.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">▾</span>
            </div>
            <div className="mt-1 text-xs text-[var(--muted)]">
              Cene i mogućnosti zavise od tipa proslave.
            </div>
          </div>
        </div>

        {/* Paketi */}
        <div className="mt-6 text-sm text-[var(--muted)]">Izbor paketa</div>
        <div className="mt-2 grid gap-2">
          {(["basic","classic","signature"] as PlanSlug[]).map((p) => {
            const isActive = plan === p;
            const ring = PLAN_COLORS[p].ring;

            return (
              <div key={p}>
                <button
                  type="button"
                  onClick={() => setPlan(p)}
                  aria-pressed={isActive}
                  data-active={isActive}
                  className="w-full rounded-[10px] border bg-[var(--surface)] px-3 py-2.5 text-left transition hover:bg-black/[0.03] focus-visible:outline-2 focus-visible:outline-[var(--accent-strong)] focus-visible:outline-offset-2"
                  style={{
                    borderColor: isActive ? ring : "var(--border)",
                    boxShadow: isActive ? `0 0 0 1px ${ring}` : "none",
                  }}
                  title={`Izaberite paket ${DISPLAY_PLAN_NAME[p]}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 font-medium text-[var(--fg)]">
                        {DISPLAY_PLAN_NAME[p]}
                        {isActive && (
                          <span aria-hidden className="shrink-0" style={{ color: ring }}>
                            <CheckIcon />
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-[var(--muted)]">{PLANS[p].tagline}</div>
                    </div>
                    <div className="whitespace-nowrap text-sm text-[var(--muted)]">
                      od {effectiveBaseFor(p).toLocaleString("sr-RS")} €
                    </div>
                  </div>
                </button>

                {/* Collapsible opis za aktivan paket */}
                {isActive && (
                  <details className="group mt-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
                    <summary className="flex cursor-pointer select-none items-center justify-between rounded-[10px] px-3 py-2 focus-visible:outline-2 focus-visible:outline-[var(--accent-strong)] focus-visible:outline-offset-2">
                      <span className="text-sm text-[var(--fg)]">Šta ovaj paket uključuje</span>
                      <span className="text-[var(--muted)] transition-transform duration-200 group-open:rotate-180">
                        <ChevronIcon />
                      </span>
                    </summary>

                    <div className="px-3 pb-3 pt-1">
                      <ul className="space-y-1.5">
                        {/* 1) Osnovne stavke plana */}
                        {includesBase.map((it, idx) => (
                          <li key={`incbase-${idx}`} className="flex items-start gap-2 text-sm text-[var(--fg)]">
                            <span className="shrink-0 text-[var(--accent-strong)]"><CheckIcon /></span>
                            <span>{it}</span>
                          </li>
                        ))}

                        {/* 2) Extras iz API-ja */}
                        {extrasIncluded.map((it, idx) => (
                          <li key={`extra-${idx}`} className="flex items-start gap-2 text-sm text-[var(--fg)]">
                            <span className="shrink-0 text-[var(--accent-strong)]"><CheckIcon /></span>
                            <span>{it}</span>
                          </li>
                        ))}

                        {/* 3) Napomena */}
                        {note && (
                          <li key="note" className="mt-2 flex items-start gap-2 text-sm text-[var(--muted)]">
                            <span className="shrink-0 text-[var(--accent-strong)]"><CheckIcon /></span>
                            <span>{note}</span>
                          </li>
                        )}

                        {/* 4) Uključeni addoni — uvek poslednji, diskretan šampanj okvir */}
                        {includedAddons.map((it, idx) => (
                          <li
                            key={`adinc-${idx}`}
                            className="flex items-start gap-2 rounded-lg border border-[var(--accent)] px-2 py-1.5 text-sm text-[var(--fg)]"
                          >
                            <span className="shrink-0 text-[var(--accent-strong)]"><SparkleIcon /></span>
                            <span className="inline-flex flex-wrap items-center gap-2">
                              {it}
                              <span className="rounded-full border border-[var(--accent)] px-2 py-0.5 text-xs text-[var(--accent-strong)]">
                                Uključeno
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SREDINA — addoni */}
      <div className="card self-start p-5">
        <div className="text-sm text-[var(--muted)]">Dodatne opcije</div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {/* kolona 1: prioritetni addoni */}
          <div className="space-y-3">
            {addonKeysForCurrent()
              .filter((k) => ["secondPhotog","thirdPhotog","video","video4k","drone"].includes(k))
              .filter((k) => effectiveState(k) === "available")
              .map((k) => (
                <LabeledToggle
                  key={k}
                  label={prettyLabel(k)}
                  value={!!addonChecked[k]}
                  onChange={(v) => setAddonChecked((s)=>({ ...s, [k]: v }))}
                  note={priceNote(effectivePrice(k), k)}
                />
              ))}
          </div>

          {/* kolona 2: ostali addoni + privacy + sati posle ponoći */}
          <div className="space-y-3">
            {addonKeysForCurrent()
              .filter((k) => !["secondPhotog","thirdPhotog","video","video4k","drone"].includes(k))
              .filter((k) => effectiveState(k) === "available")
              .map((k) => (
                <div key={k}>
                  <LabeledToggle
                    label={prettyLabel(k)}
                    value={!!addonChecked[k]}
                    onChange={(v) => setAddonChecked((s)=>({ ...s, [k]: v }))}
                    note={priceNote(effectivePrice(k), k)}
                  />
                  {k === "dontPublish" && (
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {!addonChecked["dontPublish"]
                        ? "Značilo bi nam da ovu opciju ne uključujete 🙂 (pomaže nam kao preporuka/portfolio)."
                        : "Razumemo i poštujemo 🙂 — ne objavljujemo vaše fotografije u portfoliju/mrežama."}
                    </div>
                  )}
                </div>
              ))}

            <LabeledNumber
              label="Sati posle ponoći (prelazak u drugi dan)"
              value={extraHours}
              setValue={setExtraHours}
              min={0}
              max={12}
              step={1}
              note="+60€/sat"
            />
          </div>
        </div>
      </div>

      {/* DESNO — rezime (sticky na lg+) */}
      <aside className="self-start md:col-span-2 lg:col-span-1 lg:sticky lg:top-24">
        <div className="card p-5">
          <div className="kicker">Rezime</div>
          <div className="mt-3 text-sm text-[var(--fg)]">
            {DISPLAY_PLAN_NAME[plan]} · {eventType}
          </div>
          <div className="mt-4 text-sm text-[var(--muted)]">Orijentaciona cena</div>
          <div className="mt-1 font-serif text-4xl text-[var(--fg)]">
            {price.toLocaleString("sr-RS")} €
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Prikaz zavisi od izabranog tipa proslave i dodataka. Za preciznu ponudu pošaljite upit.
          </p>
          <div className="divider mt-5" />
          <div className="mt-5">
            <a href={continueHref} className="btn btn-primary w-full" title="Nastavite ka formi za upit">
              Nastavite na upit
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

/** ——— Util: promoviši “USB” iz extrasIncluded u pravilan addon (included) ——— */
function promoteUsbIncluded(json: any) {
  try {
    const cloned = structuredClone(json);
    const evs = Object.keys(cloned.extrasIncluded || {});
    for (const ev of evs) {
      const plans = Object.keys(cloned.extrasIncluded[ev] || {});
      for (const p of plans) {
        const arr: string[] = cloned.extrasIncluded[ev][p] || [];
        // nađi “USB” (case-insensitive)
        const idx = arr.findIndex((x) => x && x.toString().trim().toLowerCase() === "usb");
        if (idx !== -1) {
          // obezbedi granu u addons
          cloned.addons ||= {};
          cloned.addons[ev] ||= {};
          cloned.addons[ev][p] ||= {};
          // ako nema pravilo za usb – postavi kao included
          if (!cloned.addons[ev][p]["usb"]) {
            cloned.addons[ev][p]["usb"] = { state: "included" };
          }
          // ukloni iz extras, da ne dupliramo
          cloned.extrasIncluded[ev][p] = arr.filter((_, i) => i !== idx);
        }
      }
    }
    return cloned;
  } catch {
    return json;
  }
}

function priceNote(price: number, key: string) {
  if (key === "dontPublish") return "gratis";
  if (price > 0) return `+${price}€`;
  return undefined;
}

/* ——— UI helpers ——— */

function LabeledToggle({
  label, value, onChange, note,
}: { label: string; value: boolean; onChange: (v:boolean)=>void; note?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 transition hover:bg-black/[0.03]">
      <div>
        <div className="text-sm font-medium text-[var(--fg)]">{label}</div>
        {note && <div className="text-xs text-[var(--muted)]">{note}</div>}
      </div>
      <input
        type="checkbox"
        className="h-5 w-5 shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--accent-strong)] focus-visible:outline-offset-2"
        style={{ accentColor: "var(--accent-strong)" }}
        checked={value}
        onChange={(e)=>onChange(e.target.checked)}
      />
    </label>
  );
}

function LabeledNumber({
  label, value, setValue, min=0, max=10, step=1, note,
}: { label: string; value: number; setValue: (n:number)=>void; min?: number; max?: number; step?: number; note?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-[var(--fg)]">{label}</div>
        {note && <div className="text-xs text-[var(--muted)]">{note}</div>}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e)=>setValue(Number(e.target.value))}
          className="w-full focus-visible:outline-2 focus-visible:outline-[var(--accent-strong)] focus-visible:outline-offset-2"
          style={{ accentColor: "var(--accent-strong)" }}
          aria-label={label}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e)=>setValue(Number(e.target.value))}
          className="w-20 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--fg)] focus:border-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-[var(--accent-strong)] focus-visible:outline-offset-2"
          aria-label={label}
        />
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-[2px]" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-[1px]" aria-hidden="true">
      <path d="M12 3l1.6 3.9L17.5 8 13.6 9.6 12 13.5 10.4 9.6 6.5 8l3.9-1.1L12 3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// src/components/PricingConfigurator.tsx
// Editorial konfigurator — hairline arhitektura umesto kartica:
// paketi kao kolone sa serif cenama (ogledaju PackageCards), addoni kao
// minimalna lista sa custom checkbox kvadratima, rezime kao sticky kolona.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PLANS, type PlanSlug } from "@/data/packages";
import { getPlanIncludes } from "@/data/planIncludes";
import { EVENT_TYPES as FALLBACK_EVENTS, type EventType } from "@/lib/addons";
import type { AddonRule } from "@/lib/addons";

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
        // Napomena: raniji fallback na "/api/addons" je uklonjen — ta ruta ne
        // postoji, pa je svaki neuspeh primarne davao još jedan 404 u konzoli.
        const res = await fetch("/api/inquiry/addons?debug=0", { cache: "no-store" });
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

  // ——— samo za prikaz u rezimeu (kalkulacija ostaje u `price`) ———
  const PRIORITY_ADDONS = ["secondPhotog", "thirdPhotog", "video", "video4k", "drone"];
  const availableKeys = addonKeysForCurrent().filter((k) => effectiveState(k) === "available");
  const primaryKeys = availableKeys.filter((k) => PRIORITY_ADDONS.includes(k));
  const secondaryKeys = availableKeys.filter((k) => !PRIORITY_ADDONS.includes(k));
  const summaryAddons = availableKeys.filter((k) => addonChecked[k]);

  // Balans kolona: ako nema prioritetnih addona, ostali prelaze u levu
  // kolonu, a klizač ostaje sam u desnoj (bez prazne kolone sa visećom linijom).
  const leftAddonKeys = primaryKeys.length > 0 ? primaryKeys : secondaryKeys;
  const rightAddonKeys = primaryKeys.length > 0 ? secondaryKeys : [];

  const renderAddonRow = (k: string) => (
    <div key={k}>
      <LabeledToggle
        label={prettyLabel(k)}
        value={!!addonChecked[k]}
        onChange={(v) => setAddonChecked((s)=>({ ...s, [k]: v }))}
        note={priceNote(effectivePrice(k), k)}
      />
      {k === "dontPublish" && (
        <p className="-mt-2 pb-4 pl-[30px] text-xs leading-relaxed text-[var(--muted)]">
          {!addonChecked["dontPublish"]
            ? "Značilo bi nam da ovu opciju ne uključujete — objave nam služe kao preporuka i portfolio."
            : "Razumemo i poštujemo — vaše fotografije ne objavljujemo u portfoliju ni na mrežama."}
        </p>
      )}
    </div>
  );

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-0">
      <style>{CONFIGURATOR_CSS}</style>

      {/* LEVO — izbor */}
      <div className="lg:col-span-8 lg:pr-14 xl:pr-20">
        {/* Tip proslave */}
        <div className="max-w-sm">
          <label htmlFor="cfg-event" className="form-label">
            Tip proslave
          </label>
          <select
            id="cfg-event"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            aria-label="Tip proslave"
            className="input-line"
          >
            {events.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <p className="mt-2.5 text-xs text-[var(--muted)]">
            Cene i mogućnosti zavise od tipa proslave.
          </p>
        </div>

        {/* Izbor paketa — kolone sa hairline podelama, serif cene */}
        <div className="mt-12 md:mt-14">
          <span className="form-label">Izbor paketa</span>
          <div className="mt-2 grid border-y border-[var(--border)] sm:grid-cols-3 sm:divide-x sm:divide-[var(--border)]">
            {(["basic","classic","signature"] as PlanSlug[]).map((p, col) => {
              const isActive = plan === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  aria-pressed={isActive}
                  title={`Izaberite paket ${DISPLAY_PLAN_NAME[p]}`}
                  className={`relative flex flex-col px-5 py-7 text-left transition-colors duration-300 hover:bg-[var(--surface-2)]/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent-strong)] md:px-6 md:py-8 ${
                    col > 0 ? "border-t border-[var(--border)] sm:border-t-0" : ""
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-[2px] bg-[var(--accent)] transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <span className="flex items-baseline justify-between gap-2">
                    <span
                      className={`text-[11px] uppercase tracking-[0.28em] transition-colors ${
                        isActive ? "text-[var(--fg)]" : "text-[var(--muted)]"
                      }`}
                    >
                      {DISPLAY_PLAN_NAME[p]}
                    </span>
                    {isActive && (
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                        Izabrano
                      </span>
                    )}
                  </span>
                  <span className="mt-5 block font-serif text-[30px] leading-none text-[var(--fg)]">
                    <span className="text-[0.5em] uppercase tracking-[0.2em] text-[var(--muted)]">od </span>
                    {effectiveBaseFor(p).toLocaleString("sr-RS")}
                    <span className="serif-italic text-[0.62em]"> €</span>
                  </span>
                  <span className="mt-3 block max-w-[26ch] text-[12.5px] leading-snug text-[var(--muted)]">
                    {PLANS[p].tagline}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Šta paket uključuje — hairline red ispod kolona */}
          <details className="group border-b border-[var(--border)]">
            <summary className="flex cursor-pointer select-none items-center justify-between gap-4 py-4 text-[11px] uppercase tracking-[0.22em] text-[var(--fg)] transition-colors hover:text-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]">
            <span>Šta paket {DISPLAY_PLAN_NAME[plan]} uključuje</span>
              <span
                aria-hidden="true"
                className="text-[var(--muted)] transition-transform duration-200 group-open:rotate-180"
              >
                <ChevronIcon />
              </span>
            </summary>

            <div className="pb-7 pt-1">
              <ul className="grid gap-x-12 gap-y-[11px] sm:grid-cols-2">
                {/* 1) Osnovne stavke plana */}
                {includesBase.map((it, idx) => (
                  <li key={`incbase-${idx}`} className="text-[13.5px] leading-snug text-[var(--fg)]/85">
                    {it}
                  </li>
                ))}

                {/* 2) Extras iz API-ja */}
                {extrasIncluded.map((it, idx) => (
                  <li key={`extra-${idx}`} className="text-[13.5px] leading-snug text-[var(--fg)]/85">
                    {it}
                  </li>
                ))}

                {/* 3) Uključeni addoni — diskretan šampanj caps marker */}
                {includedAddons.map((it, idx) => (
                  <li key={`adinc-${idx}`} className="text-[13.5px] leading-snug text-[var(--fg)]/85">
                    {it}
                    <span className="ml-2 whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                      Uključeno
                    </span>
                  </li>
                ))}
              </ul>

              {/* 4) Napomena */}
              {note && (
                <p className="mt-5 max-w-[56ch] font-serif text-[13.5px] italic leading-relaxed text-[var(--muted)]">
                  {note}
                </p>
              )}
            </div>
          </details>
        </div>

        {/* Dodatne opcije — minimalna lista, custom checkbox kvadrati */}
        <div className="mt-12 md:mt-14">
          <span className="form-label">Dodatne opcije</span>
          <div className="mt-2 grid gap-x-12 sm:grid-cols-2">
            {/* kolona 1: prioritetni addoni (ili svi, ako prioritetnih nema) */}
            <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
              {leftAddonKeys.map(renderAddonRow)}
            </div>

            {/* kolona 2: ostali addoni + sati posle ponoći */}
            <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
              {rightAddonKeys.map(renderAddonRow)}

              <LabeledNumber
                label="Sati posle ponoći (prelazak u drugi dan)"
                value={extraHours}
                setValue={setExtraHours}
                min={0}
                max={12}
                step={1}
                note="+60 € / sat"
              />
            </div>
          </div>
        </div>
      </div>

      {/* DESNO — rezime (sticky na lg+, sekcija na dnu na manjim) */}
      <aside className="border-t border-[var(--border)] pt-10 lg:col-span-4 lg:border-l lg:border-t-0 lg:border-[var(--border)] lg:pl-12 lg:pt-0 xl:pl-16">
        <div className="lg:sticky lg:top-28">
          <span className="eyebrow">Rezime</span>
          <p className="mt-5 text-[11px] uppercase tracking-[0.25em] text-[var(--fg)]">
            {DISPLAY_PLAN_NAME[plan]}
            <span className="mx-2 text-[var(--border-strong)]">·</span>
            {eventType}
          </p>

          {/* Stavke — samo prikaz; kalkulacija ostaje ista */}
          <dl className="mt-6 space-y-[10px] border-t border-[var(--border)] pt-5">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[13px] text-[var(--muted)]">Osnova paketa</dt>
              <dd className="whitespace-nowrap text-[13px] text-[var(--fg)]">
                {basePrice.toLocaleString("sr-RS")} €
              </dd>
            </div>
            {summaryAddons.map((k) => (
              <div key={k} className="flex items-baseline justify-between gap-4">
                <dt className="text-[13px] text-[var(--muted)]">{prettyLabel(k)}</dt>
                <dd className="whitespace-nowrap text-[13px] text-[var(--fg)]">
                  {k === "dontPublish" || effectivePrice(k) === 0
                    ? "gratis"
                    : `+${effectivePrice(k).toLocaleString("sr-RS")} €`}
                </dd>
              </div>
            ))}
            {extraHours > 0 && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[13px] text-[var(--muted)]">
                  Sati posle ponoći × {extraHours}
                </dt>
                <dd className="whitespace-nowrap text-[13px] text-[var(--fg)]">
                  +{(extraHours * 60).toLocaleString("sr-RS")} €
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-5 border-t border-[var(--border)] pt-6">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
              Orijentaciona cena
            </span>
            <p className="mt-3 font-serif text-[clamp(44px,3.6vw,56px)] leading-none text-[var(--fg)]">
              {price.toLocaleString("sr-RS")}
              <span className="serif-italic text-[0.6em]"> €</span>
            </p>
          </div>

          <p className="mt-5 max-w-[38ch] text-xs leading-relaxed text-[var(--muted)]">
            Prikaz zavisi od izabranog tipa proslave i dodataka. Za preciznu
            ponudu pošaljite upit.
          </p>

          <a
            href={continueHref}
            className="btn btn-primary mt-8 w-full"
            title="Nastavite ka formi za upit"
          >
            Nastavite na upit
          </a>
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
  if (price > 0) return `+${price} €`;
  return undefined;
}

/* ——— Lokalni stilovi (globals.css je read-only) ——— */
const CONFIGURATOR_CSS = `
.cfg-check{
  position:relative;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:15px;
  height:15px;
  flex:0 0 15px;
  border:1px solid var(--border-strong);
  border-radius:var(--radius);
  background:transparent;
  transition:background .2s ease, border-color .2s ease;
}
.cfg-check svg{opacity:0;transition:opacity .15s ease;}
.cfg-toggle:hover .cfg-check{border-color:var(--accent-strong);}
.cfg-toggle input:checked ~ .cfg-check{
  background:var(--accent-strong);
  border-color:var(--accent-strong);
}
.cfg-toggle input:checked ~ .cfg-check svg{opacity:1;}
.cfg-toggle input:focus-visible ~ .cfg-check{
  outline:2px solid var(--accent-strong);
  outline-offset:2px;
}

.cfg-range{
  -webkit-appearance:none;
  appearance:none;
  width:100%;
  height:16px;
  background:transparent;
  cursor:pointer;
}
.cfg-range::-webkit-slider-runnable-track{height:2px;background:var(--border-strong);}
.cfg-range::-webkit-slider-thumb{
  -webkit-appearance:none;
  appearance:none;
  width:14px;
  height:14px;
  margin-top:-6px;
  border-radius:50%;
  border:0;
  background:var(--ink);
  transition:transform .15s ease;
}
.cfg-range::-webkit-slider-thumb:hover{transform:scale(1.12);}
.cfg-range::-moz-range-track{height:2px;background:var(--border-strong);}
.cfg-range::-moz-range-thumb{
  width:14px;
  height:14px;
  border-radius:50%;
  border:0;
  background:var(--ink);
}
.cfg-range:focus-visible{outline:2px solid var(--accent-strong);outline-offset:4px;}

.cfg-num{
  width:3.25rem;
  text-align:center;
  -moz-appearance:textfield;
  appearance:textfield;
}
.cfg-num::-webkit-outer-spin-button,
.cfg-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
`;

/* ——— UI helpers ——— */

function LabeledToggle({
  label, value, onChange, note,
}: { label: string; value: boolean; onChange: (v:boolean)=>void; note?: string }) {
  return (
    <label className="cfg-toggle flex cursor-pointer items-center justify-between gap-4 py-[15px]">
      <span className="flex min-w-0 items-center gap-[15px]">
        <input
          type="checkbox"
          className="sr-only"
          checked={value}
          onChange={(e)=>onChange(e.target.checked)}
        />
        <span className="cfg-check" aria-hidden="true">
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3.4 6 8 1"
              stroke="var(--ink-fg)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-[14px] leading-snug text-[var(--fg)]">{label}</span>
      </span>
      {note && (
        <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          {note}
        </span>
      )}
    </label>
  );
}

function LabeledNumber({
  label, value, setValue, min=0, max=10, step=1, note,
}: { label: string; value: number; setValue: (n:number)=>void; min?: number; max?: number; step?: number; note?: string }) {
  return (
    <div className="py-[15px]">
      <div className="flex items-baseline justify-between gap-4">
        <div className="text-[14px] leading-snug text-[var(--fg)]">{label}</div>
        {note && (
          <div className="whitespace-nowrap text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            {note}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e)=>setValue(Number(e.target.value))}
          className="cfg-range flex-1"
          aria-label={label}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e)=>setValue(Number(e.target.value))}
          className="input-line cfg-num shrink-0"
          aria-label={label}
        />
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

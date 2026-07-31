// src/components/InquiryForm.tsx
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { PLANS, type PlanSlug } from "@/data/packages";

const TS_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

const TYPES = ["Svadba", "Venčanje", "Studio", "Rođendan", "Krštenje", "Drugo"] as const;
type TypeOption = (typeof TYPES)[number];

type FormState = {
  type?: TypeOption;
  date: string;
  start?: string;
  end?: string;
  location: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

const TO_EMAIL = "studio.contrast031@gmail.com";

/* editorial underline stil za polja forme (globals.css) */
const INPUT_CLS = "input-line";
const LABEL_CLS = "form-label";

/* helpers za vreme */
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
function normalizeTime(raw: string | undefined): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  if (/^\d{1,2}$/.test(s)) {
    const hh = clamp(Number(s), 0, 23);
    return `${String(hh).padStart(2, "0")}:00`;
  }
  if (/^\d{3,4}$/.test(s)) {
    const mm = clamp(Number(s.slice(-2)), 0, 59);
    const hh = clamp(Number(s.slice(0, -2)), 0, 23);
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  const m = /^(\d{1,2}):(\d{1,2})$/.exec(s);
  if (m) {
    const hh = clamp(Number(m[1]), 0, 23);
    const mm = clamp(Number(m[2]), 0, 59);
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  return "";
}
function isValidTime(t?: string) {
  return !!t && /^\d{2}:\d{2}$/.test(t);
}

function normType(v?: string): TypeOption | undefined {
  const s = (v ?? "").trim();
  if (!s) return undefined;

  const normalize = (x: string) =>
    x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "");

  const key = normalize(s);
  const MAP: Record<string, TypeOption> = {
    svadba: "Svadba",
    vencanje: "Venčanje",
    "venčanje": "Venčanje",
    studio: "Studio",
    portret: "Studio",
    portreti: "Studio",
    rodjendan: "Rođendan",
    rodjendani: "Rođendan",
    "rođendan": "Rođendan",
    "rođendani": "Rođendan",
    krstenje: "Krštenje",
    krstenja: "Krštenje",
    "krštenje": "Krštenje",
    "krštenja": "Krštenje",
    drugo: "Drugo",
  };

  return MAP[key] || (TYPES as readonly string[]).includes(s) ? (s as TypeOption) : undefined;
}

function prettyLabel(key: string) {
  const k = key.toLowerCase();
  if (k === "secondphotog") return "Drugi fotograf";
  if (k === "thirdphotog") return "Treći fotograf";
  if (k === "secondvideographer") return "Dodatni kamerman";
  if (k === "video") return "Video";
  if (k === "video4k") return "4K video";
  if (k === "drone") return "Dron";
  if (k === "album") return "Album (premium)";
  if (k === "express") return "Ekspres obrada";
  if (k === "raw") return "RAW fajlovi";
  if (k === "printonsite") return "Izrada fotografija na licu mesta";
  if (k === "usb") return "USB";
  if (k === "dontpublish") return "Ne objavljuj u portfoliju / na mrežama";
  return key;
}

export default function InquiryForm({
  prefill,
}: {
  prefill?: Partial<FormState> & {
    priceHint?: number;
    plan?: PlanSlug;
    extraHours?: number;
    secondPhotog?: boolean;
    thirdPhotog?: boolean;
    secondVideographer?: boolean;
    video?: boolean;
    video4k?: boolean;
    drone?: boolean;
    album?: boolean;
    express?: boolean;
    raw?: boolean;
    printOnSite?: boolean;
    usb?: boolean;
    dontPublish?: boolean;
  };
}) {
  const typeFromConfigurator = normType(prefill?.type);
  const hasPlan = !!prefill?.plan;

  const DEFAULT: FormState = {
    type: typeFromConfigurator,
    date: "",
    start: "",
    end: "",
    location: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  };
  const [f, setF] = useState<FormState>({ ...DEFAULT, ...(prefill || {}) });

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | "ok" | "err">(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const priceHint = prefill?.priceHint;

  // Turnstile
  const [tsToken, setTsToken] = useState("");
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(f.email.trim()), [f.email]);
  const phoneDigits = useMemo(() => f.phone.replace(/\D+/g, ""), [f.phone]);
  const phoneValid = phoneDigits.length >= 7;

  const canSubmit =
    hasPlan &&
    f.name.trim().length >= 2 &&
    emailValid &&
    phoneValid &&
    f.date.trim().length >= 4 &&
    f.location.trim().length >= 2 &&
    !!tsToken;

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = (e.target as HTMLInputElement).value as string;
      setF((s) => ({ ...s, [key]: val }));
    };

  const onTimeBlur = (key: "start" | "end") => (e: React.FocusEvent<HTMLInputElement>) => {
    setF((s) => ({ ...s, [key]: normalizeTime(e.target.value) }));
  };

  const selectedAddons = useMemo(() => {
    const map = {
      secondPhotog: !!prefill?.secondPhotog,
      thirdPhotog: !!prefill?.thirdPhotog,
      secondVideographer: !!prefill?.secondVideographer,
      video: !!prefill?.video,
      video4k: !!prefill?.video4k,
      drone: !!prefill?.drone,
      album: !!prefill?.album,
      express: !!prefill?.express,
      raw: !!prefill?.raw,
      printOnSite: !!prefill?.printOnSite,
      usb: !!prefill?.usb,
      dontPublish: !!prefill?.dontPublish,
    };
    return Object.entries(map)
      .filter(([, v]) => v)
      .map(([k]) => k);
  }, [prefill]);

  const displayType = typeFromConfigurator || "tip TBA";

  const subject = useMemo(() => {
    const planName = prefill?.plan ? PLANS[prefill.plan].name : "Paket (nije odabran)";
    return `Upit — ${planName} / ${displayType} (${f.date || "datum TBA"})`;
  }, [prefill?.plan, displayType, f.date]);

  const body = useMemo(() => {
    const startT = isValidTime(f.start) ? f.start : "";
    const endT = isValidTime(f.end) ? f.end : "";
    const timePart = startT || endT ? ` (${startT || "?"}–${endT || "?"})` : "";

    const planLine = prefill?.plan ? `${PLANS[prefill.plan].name}` : "— (nije odabran)";

    const lines = [
      "Zdravo Studio Contrast,",
      "",
      "Želeo/la bih da proverim dostupnost i okvirnu ponudu.",
      "",
      `Tip događaja: ${displayType}`,
      `Datum: ${f.date}${timePart}`,
      `Lokacija: ${f.location}`,
      "",
      `Paket: ${planLine}`,
      selectedAddons.length ? `Dodaci: ${selectedAddons.map(prettyLabel).join(", ")}` : "Dodaci: —",
      prefill?.extraHours ? `Dodatni sati: ${prefill?.extraHours}` : "",
      "",
      `Kontakt: ${f.name} | ${f.phone}`,
      `Email: ${f.email}`,
      "",
      "Poruka:",
      f.message || "-",
      "",
      priceHint ? `Orijentaciona cena iz konfiguratora: ~${priceHint.toLocaleString("sr-RS")} €` : "",
    ].filter(Boolean);
    return lines.join("\n");
  }, [f, selectedAddons, prefill?.plan, prefill?.extraHours, priceHint, displayType]);

  const mailtoHref = useMemo(() => {
    const s = encodeURIComponent(subject);
    const b = encodeURIComponent(body);
    return `mailto:${TO_EMAIL}?subject=${s}&body=${b}`;
  }, [subject, body]);

  /* Turnstile render */
  const renderTurnstile = () => {
    if (!widgetRef.current || !window.turnstile || !TS_SITE_KEY) return;
    widgetRef.current.innerHTML = "";
    widgetIdRef.current = window.turnstile.render(widgetRef.current, {
      sitekey: TS_SITE_KEY,
      theme: "light",
      callback: (token) => setTsToken(token),
      "expired-callback": () => setTsToken(""),
      "error-callback": () => setTsToken(""),
    });
  };

  useEffect(() => {
    if (window.turnstile) renderTurnstile();
    const onLoaded = () => renderTurnstile();
    document.addEventListener("cf-turnstile-loaded", onLoaded);
    return () => document.removeEventListener("cf-turnstile-loaded", onLoaded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || sending) return;

    const payload = {
      ...f,
      type: typeFromConfigurator,
      start: normalizeTime(f.start),
      end: normalizeTime(f.end),
      plan: prefill?.plan,
      extraHours: prefill?.extraHours ?? 0,
      priceHint,
      addons: selectedAddons,
      tsToken, // ako backend još očekuje 'turnstileToken', preimenuj ili podrži oba
    };

    setSending(true);
    setSent(null);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setSent("ok");
      setTsToken("");
      try {
        if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
      } catch {}
    } catch {
      window.location.href = mailtoHref;
      setSent("err");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-10">
      {/* ——— Detalji događaja ——— */}
      <fieldset className="m-0 border-0 p-0">
        <legend className="eyebrow mb-8 p-0">Detalji događaja</legend>

        <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
          {/* Tip događaja — read-only iz Konfiguratora */}
          <div className="grid gap-1">
            <label className={LABEL_CLS}>Tip događaja</label>
            <input
              value={displayType === "tip TBA" ? "— (postavlja se u Konfiguratoru)" : displayType}
              disabled
              className={`${INPUT_CLS} !border-b-[var(--border)] text-[var(--muted)]`}
              aria-readonly="true"
            />
          </div>

          <div className="grid gap-1">
            <label className={LABEL_CLS}>Datum *</label>
            <input
              type="date"
              value={f.date}
              onChange={onChange("date")}
              className={INPUT_CLS}
              required
            />
          </div>

          <div className="grid gap-1">
            <label className={LABEL_CLS}>Vreme od</label>
            <input
              type="text"
              inputMode="numeric"
              value={f.start || ""}
              onChange={onChange("start")}
              onBlur={onTimeBlur("start")}
              className={INPUT_CLS}
              placeholder="HH:MM (npr. 22 ili 2230)"
            />
          </div>

          <div className="grid gap-1">
            <label className={LABEL_CLS}>Vreme do</label>
            <input
              type="text"
              inputMode="numeric"
              value={f.end || ""}
              onChange={onChange("end")}
              onBlur={onTimeBlur("end")}
              className={INPUT_CLS}
              placeholder="HH:MM (npr. 01 ili 1305)"
            />
          </div>

          <div className="grid gap-1 md:col-span-2">
            <label className={LABEL_CLS}>Lokacija *</label>
            <input
              value={f.location}
              onChange={onChange("location")}
              className={INPUT_CLS}
              placeholder="Grad / venue"
              required
            />
          </div>
        </div>
      </fieldset>

      {/* ——— Vaši podaci ——— */}
      <fieldset className="m-0 border-0 border-t border-[var(--border)] p-0 pt-9">
        <legend className="sr-only">Vaši podaci</legend>
        <span aria-hidden="true" className="eyebrow mb-8 block">Vaši podaci</span>

        <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
          <div className="grid gap-1">
            <label className={LABEL_CLS}>Ime i prezime *</label>
            <input
              value={f.name}
              onChange={onChange("name")}
              className={INPUT_CLS}
              placeholder="npr. Ana Jovanović"
              required
            />
          </div>

          <div className="grid gap-1">
            <label className={LABEL_CLS}>Telefon *</label>
            <input
              value={f.phone}
              onChange={onChange("phone")}
              onBlur={() => setPhoneTouched(true)}
              className={INPUT_CLS}
              placeholder="+381 6x xxx xxxx"
              required
              aria-invalid={phoneTouched && !phoneValid}
            />
            {phoneTouched && f.phone.trim() !== "" && !phoneValid && (
              <span className="form-error mt-1">
                Unesite validan broj (min. 7 cifara, format po volji).
              </span>
            )}
          </div>

          <div className="grid gap-1 md:col-span-2">
            <label className={LABEL_CLS}>Email *</label>
            <input
              type="email"
              value={f.email}
              onChange={onChange("email")}
              onBlur={() => setEmailTouched(true)}
              className={INPUT_CLS}
              placeholder="npr. ana@email.com"
              required
              aria-invalid={emailTouched && !emailValid}
            />
            {emailTouched && f.email.trim() !== "" && !emailValid && (
              <span className="form-error mt-1">Unesite validan email.</span>
            )}
          </div>

          <div className="grid gap-1 md:col-span-2">
            <label className={LABEL_CLS}>Poruka</label>
            <textarea
              rows={4}
              value={f.message}
              onChange={onChange("message")}
              placeholder="Dodatne informacije, satnica, posebne želje…"
              className={INPUT_CLS}
            />
          </div>
        </div>
      </fieldset>

      {/* Turnstile widget */}
      <div className="-mt-4">
        <div ref={widgetRef} className="min-h-[70px]" />
      </div>

      {/* CTA */}
      <div className="-mt-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="max-w-sm text-xs leading-relaxed text-[var(--muted)]">
          Klikom na „Proverite svoj datum“ šaljemo podatke direktno na email studija.
          {sent === "err" && <> Ako imate problem, koristi se backup preko vašeg email klijenta.</>}
        </div>
        <button
          type="submit"
          disabled={!canSubmit || sending}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-70"
          title={
            hasPlan
              ? canSubmit
                ? "Proverite svoj datum"
                : "Popunite obavezna polja"
              : "Najpre završite Konfigurator"
          }
        >
          {sending ? "Slanje…" : sent === "ok" ? "Poslato ✓" : "Proverite svoj datum"}
        </button>
      </div>

      {sent === "ok" && (
        <div className="-mt-4 text-sm text-emerald-700">
          Hvala! Vaš upit je poslat — proverite email u narednim satima.
        </div>
      )}
    </form>
  );
}

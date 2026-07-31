// src/components/QuickInquiry.tsx
"use client";

import { useMemo, useState, useEffect, useRef } from "react";

type FormState = {
  type: string;
  date: string;
  location: string;
  email: string;
  message: string;
  website?: string; // honeypot
};

const DEFAULT: FormState = {
  type: "Svadba",
  date: "",
  location: "",
  email: "",
  message: "",
};

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

const INPUT_CLS = "input-line";
const LABEL_CLS = "form-label";

export default function QuickInquiry({ prefill }: { prefill?: Partial<FormState> }) {
  const [f, setF] = useState<FormState>({ ...DEFAULT, ...prefill });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | "ok" | "err">(null);
  const [emailTouched, setEmailTouched] = useState(false);

  const [tsToken, setTsToken] = useState("");
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderTurnstile = () => {
    if (!widgetRef.current || !window.turnstile || !SITE_KEY) return;
    widgetRef.current.innerHTML = "";
    widgetIdRef.current = window.turnstile.render(widgetRef.current, {
      sitekey: SITE_KEY,
      theme: "light",
      callback: (token) => setTsToken(token),
      "expired-callback": () => setTsToken(""),
      "error-callback": () => setTsToken(""),
    });
  };

  useEffect(() => {
    if (window.turnstile) {
      renderTurnstile();
      return;
    }
    const onLoaded = () => renderTurnstile();
    document.addEventListener("cf-turnstile-loaded", onLoaded);
    return () => document.removeEventListener("cf-turnstile-loaded", onLoaded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(f.email.trim()), [f.email]);
  const canSubmit =
    f.type.trim().length >= 2 &&
    f.date.trim().length >= 4 &&
    f.location.trim().length >= 2 &&
    emailValid &&
    (!SITE_KEY || !!tsToken);

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setF((s) => ({ ...s, [key]: e.target.value }));
    };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || sending) return;

    setSending(true);
    setSent(null);
    try {
      const res = await fetch("/api/inquiry-quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, tsToken }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSent("ok");
      setF((s) => ({ ...s, message: "" }));
      setTsToken("");
      try {
        if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
      } catch {}
    } catch {
      setSent("err");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      {/* HONEYPOT */}
      <input
        type="text"
        value={f.website || ""}
        onChange={onChange("website")}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
        <div className="grid gap-1">
          <label htmlFor="qi-type" className={LABEL_CLS}>Tip događaja *</label>
          <select
            id="qi-type"
            value={f.type}
            onChange={onChange("type")}
            className={INPUT_CLS}
          >
            {["Svadba", "Venčanje", "Portret", "Rođendan", "Krštenja", "Drugo"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-1">
          <label htmlFor="qi-date" className={LABEL_CLS}>Datum *</label>
          <input
            id="qi-date"
            type="date"
            value={f.date}
            onChange={onChange("date")}
            onClick={(e) => (e.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.()}
            className={`${INPUT_CLS} relative`}
            required
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="qi-location" className={LABEL_CLS}>Lokacija *</label>
          <input
            id="qi-location"
            value={f.location}
            onChange={onChange("location")}
            className={INPUT_CLS}
            placeholder="Grad / venue"
            required
          />
        </div>

        <div className="relative grid gap-1">
          <label htmlFor="qi-email" className={LABEL_CLS}>Email *</label>
          <input
            id="qi-email"
            type="email"
            value={f.email}
            onChange={onChange("email")}
            onBlur={() => setEmailTouched(true)}
            className={INPUT_CLS}
            placeholder="npr. korisnik@email.com"
            required
            aria-invalid={emailTouched && !emailValid}
          />
          {/* Poruka van toka — red forme se nikad ne pomera */}
          {emailTouched && f.email.trim() !== "" && !emailValid && (
            <span className="form-error absolute -bottom-5 left-0">
              Unesite validan email.
            </span>
          )}
        </div>

        <div className="grid gap-1 md:col-span-2">
          <label htmlFor="qi-message" className={LABEL_CLS}>Pitanje / poruka</label>
          <textarea
            id="qi-message"
            rows={3}
            value={f.message}
            onChange={onChange("message")}
            className={INPUT_CLS}
            placeholder="Ukoliko imate pitanje, napišite ga ovde…"
          />
        </div>
      </div>

      {/* TURNSTILE WIDGET — prostor se rezerviše samo kada ključ postoji */}
      {SITE_KEY ? (
        <div className="mt-1">
          <div ref={widgetRef} className="min-h-[70px]" />
        </div>
      ) : (
        <div ref={widgetRef} className="hidden" />
      )}

      <div className="mt-2 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div className="text-xs text-[var(--muted)]">
          Ispunite kratku formu i javljamo se u roku od 24h.
        </div>
        <button
          type="submit"
          disabled={!canSubmit || sending}
          className="btn btn-primary disabled:cursor-not-allowed"
          title={canSubmit ? "Proverite svoj datum" : !tsToken ? "Potvrdite captcha" : "Popunite obavezna polja"}
        >
          {sending ? "Slanje…" : sent === "ok" ? "Poslato ✓" : "Proverite svoj datum"}
        </button>
      </div>

      {sent === "ok" && (
        <div className="text-sm text-emerald-700">
          Hvala! Vaša poruka je poslata — proverite email u narednim satima.
        </div>
      )}
      {sent === "err" && (
        <div className="form-error text-sm">
          Ups, nešto nije u redu. Pokušajte kasnije ili nas kontaktirajte direktno emailom/telefonom.
        </div>
      )}
    </form>
  );
}
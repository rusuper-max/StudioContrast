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

const INPUT_CLS =
  "rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent-strong)] focus-visible:border-[var(--accent-strong)]";
const LABEL_CLS = "text-sm text-[var(--muted)]";

export default function QuickInquiry({ prefill }: { prefill?: Partial<FormState> }) {
  const [f, setF] = useState<FormState>({ ...DEFAULT, ...prefill });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | "ok" | "err">(null);

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
    !!tsToken;

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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-1">
          <label className={LABEL_CLS}>Tip događaja *</label>
          <select
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
          <label className={LABEL_CLS}>Lokacija *</label>
          <input
            value={f.location}
            onChange={onChange("location")}
            className={INPUT_CLS}
            placeholder="Grad / venue"
            required
          />
        </div>

        <div className="grid gap-1">
          <label className={LABEL_CLS}>Email *</label>
          <input
            type="email"
            value={f.email}
            onChange={onChange("email")}
            className={INPUT_CLS}
            placeholder="npr. korisnik@email.com"
            required
            aria-invalid={!emailValid}
          />
          {!emailValid && <span className="text-xs text-red-700">Unesite validan email.</span>}
        </div>

        <div className="grid gap-1 md:col-span-2">
          <label className={LABEL_CLS}>Pitanje / poruka</label>
          <textarea
            rows={3}
            value={f.message}
            onChange={onChange("message")}
            className={INPUT_CLS}
            placeholder="Ukoliko imate pitanje, napišite ga ovde…"
          />
        </div>
      </div>

      {/* TURNSTILE WIDGET */}
      <div className="mt-1">
        <div ref={widgetRef} className="min-h-[70px]" />
      </div>

      <div className="mt-2 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div className="text-xs text-[var(--muted)]">
          Ispunite kratku formu i javljamo se u roku od 24h.
        </div>
        <button
          type="submit"
          disabled={!canSubmit || sending}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-70"
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
        <div className="text-sm text-red-700">
          Ups, nešto nije u redu. Pokušajte kasnije ili nas kontaktirajte direktno emailom/telefonom.
        </div>
      )}
    </form>
  );
}
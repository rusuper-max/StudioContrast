// src/components/TestimonialsSection.tsx
// Full-bleed crno-bela fotografija sa velikim serif tekstom preko.
// Ako postoje PRAVI utisci u src/data/testimonials.ts — rotiraju se citati.
// Dok ih nema, prikazuje se izjava studija (sopstvene reči, ništa izmišljeno).
"use client";

import { useEffect, useState } from "react";
import { testimonials } from "@/data/testimonials";

const ITEMS = testimonials.slice(0, 3);
const ROTATE_MS = 9000;

/** Izjava studija — koristi se dok ne stignu pravi utisci klijenata */
const STUDIO_STATEMENT = {
  quote:
    "Najlepše fotografije nastaju kada zaboravite da smo tu.",
  attribution: "Janko i Marija — Studio Contrast",
};

export default function TestimonialsSection() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const hasReal = ITEMS.length > 0;

  useEffect(() => {
    if (ITEMS.length < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || paused) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % ITEMS.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section
      className="relative overflow-hidden bg-[var(--ink)] text-[var(--ink-fg)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Pozadina — trubači, energija svadbe */}
      <img
        src="/home/band-celebration.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[50%_38%] opacity-60"
        loading="lazy"
        style={{ filter: "grayscale(1) contrast(1.06)" }}
      />
      {/* Vinjeta umesto ravnog prekrivača */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 45%, rgba(23,20,18,0.42) 0%, rgba(23,20,18,0.66) 70%, rgba(23,20,18,0.82) 100%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[480px] w-full max-w-4xl flex-col items-center justify-center px-5 py-24 text-center md:min-h-[560px] md:py-32">
        <span className="eyebrow eyebrow--light">
          {hasReal ? "Utisci mladenaca" : "Naša misao vodilja"}
        </span>
        <span className="mt-2 block h-6 w-px bg-[var(--accent)]/70" aria-hidden="true" />

        {hasReal ? (
          <>
            <div className="relative mt-8 w-full">
              {ITEMS.map((t, i) => (
                <figure
                  key={t.attribution + i}
                  aria-hidden={i !== idx}
                  className={`transition-opacity duration-1000 ${
                    i === idx ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
                  }`}
                >
                  <blockquote className="mx-auto max-w-[24ch] font-serif text-[clamp(26px,4vw,52px)] font-[350] italic leading-[1.22]">
                    „{t.quote}“
                  </blockquote>
                  <figcaption className="mt-8 text-[11px] uppercase tracking-[0.25em] text-[var(--ink-fg)]/60">
                    {t.attribution}
                  </figcaption>
                </figure>
              ))}
            </div>

            {ITEMS.length > 1 && (
              <div className="mt-10 flex justify-center gap-3">
                {ITEMS.map((t, i) => (
                  <button
                    key={t.attribution + i}
                    type="button"
                    onClick={() => setIdx(i)}
                    aria-label={`Prikažite utisak ${i + 1}`}
                    aria-pressed={i === idx}
                    className={`h-[3px] w-8 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                      i === idx ? "bg-[var(--accent)]" : "bg-white/25 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <figure className="mt-8">
            <blockquote className="mx-auto max-w-[20ch] font-serif text-[clamp(28px,4.2vw,56px)] font-[350] italic leading-[1.2]">
              „{STUDIO_STATEMENT.quote}“
            </blockquote>
            <figcaption className="mt-8 text-[11px] uppercase tracking-[0.25em] text-[var(--ink-fg)]/60">
              {STUDIO_STATEMENT.attribution}
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}

// src/components/TestimonialsSection.tsx
// Jedan veliki serif italic citat sa šampanj linijom + diskretna rotacija 3 citata.
// Sadržaj dolazi iz src/data/testimonials.ts (PLACEHOLDER — zameniti pravim utiscima).
"use client";

import { useEffect, useState } from "react";
import Container from "./Container";
import { testimonials } from "@/data/testimonials";

const ITEMS = testimonials.slice(0, 3);
const ROTATE_MS = 9000;

export default function TestimonialsSection() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // Diskretna automatska rotacija — isključena uz prefers-reduced-motion.
  useEffect(() => {
    if (ITEMS.length < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || paused) return;
    const id = window.setInterval(
      () => setIdx((i) => (i + 1) % ITEMS.length),
      ROTATE_MS
    );
    return () => window.clearInterval(id);
  }, [paused]);

  if (ITEMS.length === 0) return null;

  return (
    <section
      className="section divider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="kicker">Utisci mladenaca</span>
          <span
            className="mx-auto mt-5 block h-px w-16 bg-[var(--accent)]"
            aria-hidden="true"
          />

          <div className="relative mt-8">
            {ITEMS.map((t, i) => (
              <figure
                key={t.names}
                aria-hidden={i !== idx}
                className={`transition-opacity duration-700 ${
                  i === idx
                    ? "opacity-100"
                    : "pointer-events-none absolute inset-0 opacity-0"
                }`}
              >
                <blockquote className="font-serif text-2xl italic leading-snug text-[var(--fg)] md:text-3xl">
                  „{t.quote}“
                </blockquote>
                <figcaption className="mt-6 text-sm text-[var(--muted)]">
                  <span className="font-medium text-[var(--fg)]">{t.names}</span>
                  {" — "}
                  {t.event}, {t.location} · {t.dateLabel}
                </figcaption>
              </figure>
            ))}
          </div>

          {ITEMS.length > 1 && (
            <div className="mt-8 flex justify-center gap-2.5">
              {ITEMS.map((t, i) => (
                <button
                  key={t.names}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Prikaži utisak para ${t.names}`}
                  aria-pressed={i === idx}
                  className={`h-2 w-2 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)] ${
                    i === idx
                      ? "bg-[var(--accent)]"
                      : "bg-[var(--border-strong)] hover:bg-[var(--accent)]"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

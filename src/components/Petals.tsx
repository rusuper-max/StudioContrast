"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Petals (DOM, bez <canvas>) — ISTI pokret i slojevi kao tvoj stari kod,
 * ali umesto generisanog SVG-a koristi realne hi-res latice iz /public/petals/petals-pack.
 *
 * Dodajene sitnice:
 * - koristimo više različitih SVG latica (8 kom), rotacije, blur i drop-shadow ostaju kao kod tebe
 * - “teal” akcenat rešavamo preko saturate/hue-rotate (18% latica)
 * - backgroundPosition: center; backgroundSize: contain
 */

const LAYERS = [
  { count: 14, sizeMin: 10, sizeMax: 16, vyMin: 0.10, vyMax: 0.20, blur: 2.0,  opacity: 0.50 }, // FAR
  { count: 18, sizeMin: 14, sizeMax: 22, vyMin: 0.16, vyMax: 0.30, blur: 0.8,  opacity: 0.85 }, // MID
  { count: 12, sizeMin: 18, sizeMax: 28, vyMin: 0.22, vyMax: 0.36, blur: 1.2,  opacity: 0.75 }, // NEAR
];
const TOTAL = LAYERS.reduce((s, l) => s + l.count, 0);

/** Mali procenat latica pojačamo teal akcenat (ostale su vrlo suptilne, skoro čisto bele) */
const ACCENT_RATIO = 0.18;

/** Putanje do tvojih hi-res latica (SVG u public/petals/petals-pack) */
const PETAL_URLS = [
  "/petals/petals-pack/petal-1.svg",
  "/petals/petals-pack/petal-2.svg",
  "/petals/petals-pack/petal-3.svg",
  "/petals/petals-pack/petal-4.svg",
  "/petals/petals-pack/petal-5.svg",
  "/petals/petals-pack/petal-6.svg",
  "/petals/petals-pack/petal-7.svg",
  "/petals/petals-pack/petal-8.svg",
  "/petals/petals-pack/white-teal.svg",
];

/** Tip jednog “partiala” u animaciji */
type Petal = {
  x: number; y: number;           // u vh/vw (0-100)
  baseX: number; amp: number;     // sin “ljuljanje”
  vx: number; vy: number;
  rot: number; vr: number;
  size: number; blur: number; baseOpacity: number;
  teal: boolean;                   // da li pojačati teal akcenat
  phase: number;                   // faza sin talasa
  url: string;                     // izabrana tekstura latice (SVG)
};

export default function Petals() {
  const [enabled, setEnabled] = useState(false); // Off by default
  const [paused, setPaused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Preload (da ne “blinkuje” kad prvi put krene)
  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    PETAL_URLS.forEach((src) => {
      const im = new Image();
      im.src = src;
      imgs.push(im);
    });
  }, []);

  // Inicijalizacija čestica — kao kod tebe, samo upisujemo url umesto shape
  const petals = useMemo<Petal[]>(() => {
    const arr: Petal[] = [];
    let idx = 0;
    for (const L of LAYERS) {
      for (let i = 0; i < L.count; i++) {
        arr.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          baseX: Math.random() * 100,
          amp: 1 + Math.random() * 3,                     // amplitude sin talasa (vw)
          vx: -0.04 + Math.random() * 0.08,               // blagi drift levo/desno
          vy: L.vyMin + Math.random() * (L.vyMax - L.vyMin),
          rot: Math.random() * 360,
          vr: -0.25 + Math.random() * 0.5,
          size: L.sizeMin + Math.random() * (L.sizeMax - L.sizeMin),
          blur: L.blur,
          baseOpacity: L.opacity,
          teal: Math.random() < ACCENT_RATIO,
          phase: Math.random() * Math.PI * 2,
          url: PETAL_URLS[idx % PETAL_URLS.length],       // rasporedi razne varijante kroz niz
        });
        idx++;
      }
    }
    return arr;
  }, []);

  // animacija — identično kao kod tebe
  useEffect(() => {
    let raf = 0;
    let t = 0;
    const tick = () => {
      if (!paused && enabled) {
        t += 0.016; // ~60fps
        petals.forEach((p) => {
          p.y += p.vy;                   // pad
          p.rot += p.vr;                 // rotacija
          const sway = p.amp * Math.sin(t * 0.8 + p.phase + p.y * 0.03); // “ljuljanje”
          p.x = p.baseX + sway;          // baza + sin

          // recikliraj ispod dna
          if (p.y > 105) {
            p.y = -5;
            p.baseX = Math.random() * 100;
            p.phase = Math.random() * Math.PI * 2;
            // kad respawn-uje, promeni i varijantu latice da izgleda prirodnije
            p.url = PETAL_URLS[Math.floor(Math.random() * PETAL_URLS.length)];
            p.teal = Math.random() < ACCENT_RATIO;
          }
          // zamotavanje levo/desno
          if (p.x < -5) p.x = 105;
          if (p.x > 105) p.x = -5;
        });

        // primeni stilove
        const el = wrapRef.current;
        if (el) {
          const children = el.children as unknown as HTMLElement[];
          for (let i = 0; i < children.length; i++) {
            const node = children[i] as HTMLElement;
            const p = petals[i];

            // fade/dissolve pri dnu: od 85vh do 100vh
            const fadeStart = 85;
            const k = p.y <= fadeStart ? 1 : Math.max(0, 1 - (p.y - fadeStart) / 15);
            const opacity = p.baseOpacity * k;

            // filter:
            // - blur po sloju (kao pre)
            // - drop-shadow suptilan
            // - saturate/hue-rotate: pojačaj teal za “teal” latice, za bele smanji saturaciju skroz malo
            const accentFilter = p.teal
              ? "saturate(1.35) hue-rotate(-8deg)"
              : "saturate(0.92)";

            node.style.transform = `translate(${p.x}vw, ${p.y}vh) rotate(${p.rot}deg)`;
            node.style.opacity = `${opacity}`;
            node.style.width = `${p.size}px`;
            node.style.height = `${p.size * 1.25}px`;
            node.style.filter = `blur(${p.blur}px) drop-shadow(0 2px 4px rgba(0,0,0,.35)) ${accentFilter}`;
            node.style.backgroundImage = `url("${p.url}")`;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, paused, petals]);

  return (
    <>
      {/* sloj latica */}
      {enabled && (
        <div
          ref={wrapRef}
          className="pointer-events-none fixed inset-0 z-[30]"
          aria-hidden="true"
        >
          {new Array(TOTAL).fill(0).map((_, i) => (
            <div
              key={i}
              className="absolute will-change-transform"
              style={{
                // OVO ostaje statički, a “src”/filter/size/transform menjamo u rAF-u
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                backgroundPosition: "center",
              }}
            />
          ))}
        </div>
      )}

      {/* kontrole (diskretno, bottom-right) — ostavljam kao i kod tebe */}
      <div className="fixed bottom-4 right-4 z-[40] flex items-center gap-2">
        <button
          onClick={() => setEnabled((e) => !e)}
          className="rounded-full border border-white/20 bg-black/70 px-3 py-1.5 text-xs text-white/90 backdrop-blur hover:bg-white/10"
          aria-label={`Latice: ${enabled ? "isključene" : "uključene"}`}
        >
          🌹 Latice: {enabled ? "On" : "Off"}
        </button>
        <button
          onClick={() => setPaused((p) => !p)}
          className="rounded-full border border-white/20 bg-black/70 px-3 py-1.5 text-xs text-white/90 backdrop-blur hover:bg-white/10"
          aria-label={paused ? "Nastavi animaciju" : "Pauziraj animaciju"}
        >
          {paused ? "Play" : "Pause"}
        </button>
      </div>
    </>
  );
}
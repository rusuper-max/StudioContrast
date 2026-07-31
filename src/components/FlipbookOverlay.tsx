// src/components/FlipbookOverlay.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type FlipItem = { src: string; alt?: string };

type Spread = { left?: FlipItem | null; right?: FlipItem | null };
type Leaf   = { front?: FlipItem | null; back?: FlipItem | null; spreadIndex: number };

// Pomoćno: uklanja query/hash iz URL-a da dedup radi pouzdano (Cloudinary ume da doda ?_a=...)
function normKey(s?: string) {
  return (s ?? "").replace(/([?#]).*$/, "");
}

function buildSpreads(items: FlipItem[]): Spread[] {
  const spreads: Spread[] = [];
  for (let i = 0; i < items.length; i += 2) {
    spreads.push({ left: items[i] ?? null, right: items[i + 1] ?? null });
  }
  // Ako ima tačno 1 fotka, desna strana prve strane biće ona (leva ostaje prazna)
  if (items.length === 1 && spreads.length === 0) spreads.push({ right: items[0] });
  return spreads;
}

function buildLeaves(spreads: Spread[]): Leaf[] {
  const leaves: Leaf[] = [];
  for (let i = 0; i < spreads.length; i++) {
    // front = desna stranica trenutnog spreada
    const front = spreads[i].right ?? null;
    // back = leva stranica sledećeg spreada
    const back  = spreads[i + 1]?.left ?? null;
    if (!front && !back) continue;
    leaves.push({ front, back, spreadIndex: i });
  }
  return leaves;
}

export default function FlipbookOverlay({
  items,
  onClose,
  fullHref,
}: {
  items: FlipItem[];
  onClose: () => void;
  fullHref?: string;
}) {
  const [page, setPage] = useState(0);
  const mountedAt = useRef<number>(Date.now());

  // 0) DEDUP po src (bez query stringa) – ovo gasi svaku šansu da levo/desno bude ista fotka
  const cleanItems = useMemo(() => {
    const seen = new Set<string>();
    const out: FlipItem[] = [];
    for (const it of items) {
      const key = normKey(it?.src);
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...it, src: key });
    }
    return out;
  }, [items]);

  // 1) Spreads i leaves rade nad “clean” listom
  const spreads = useMemo(() => buildSpreads(cleanItems), [cleanItems]);
  const leaves  = useMemo(() => buildLeaves(spreads), [spreads]);

  // 2) Navigacija
  const maxFlips = useMemo(() => leaves.filter((l) => !!l.back).length, [leaves]);
  const currentSpreadIdx = Math.min(page, Math.max(0, spreads.length - 1));
  const totalSpreads     = spreads.length;

  const atStart = page <= 0;
  const atEnd   = page >= maxFlips;

  const next = () => setPage((p) => (p < maxFlips ? p + 1 : p));
  const prev = () => setPage((p) => (p > 0 ? p - 1 : p));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")  prev();
    };
    // Skrol-kontejner je <html> — zaključavanje samo <body> propušta skrol.
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, maxFlips]);

  const backdropClick: React.MouseEventHandler<HTMLDivElement> = () => {
    if (Date.now() - mountedAt.current < 150) return;
    onClose();
  };

  // Preload (opciono)
  useEffect(() => {
    spreads.forEach((sp) => {
      [sp.left, sp.right].forEach((s) => {
        if (s?.src) {
          const img = new Image();
          img.src = s.src;
        }
      });
    });
  }, [spreads]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[color-mix(in_srgb,var(--bg)_96%,transparent)]"
      role="dialog"
      aria-modal="true"
      aria-label="Foto album"
      onClick={backdropClick}
    >
      <div className="relative mx-auto w-full max-w-[1200px] px-4" onClick={(e) => e.stopPropagation()}>
        {/* velike klik zone */}
        <button
          onClick={prev}
          disabled={atStart}
          aria-label="Prethodna strana"
          className={`absolute left-0 top-0 z-[900] h-full w-1/2 bg-transparent ${atStart ? "cursor-not-allowed opacity-30" : "cursor-w-resize"}`}
        />
        <button
          onClick={next}
          disabled={atEnd}
          aria-label="Sledeća strana"
          className={`absolute right-0 top-0 z-[900] h-full w-1/2 bg-transparent ${atEnd ? "cursor-not-allowed opacity-30" : "cursor-e-resize"}`}
        />

        {/* kontrole */}
        <button
          onClick={prev}
          disabled={atStart}
          aria-label="Prethodna"
          className="absolute left-2 top-1/2 z-[901] -translate-y-1/2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--fg)] transition hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)] disabled:opacity-40 md:left-4"
        >
          ←
        </button>
        <button
          onClick={next}
          disabled={atEnd}
          aria-label="Sledeća"
          className="absolute right-2 top-1/2 z-[901] -translate-y-1/2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--fg)] transition hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)] disabled:opacity-40 md:right-4"
        >
          →
        </button>

        {fullHref && (
          <a
            href={fullHref}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 z-[901] inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--fg)] transition hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
            aria-label="Otvori kompletnu galeriju"
          >
            Otvori sve
          </a>
        )}

        <button
          onClick={onClose}
          aria-label="Zatvori"
          // right-1 (a ne -right-1): na 390px je dugme izlazilo ~4px van
          // ekrana pa je glavni način zatvaranja bio odsečen.
          className="absolute right-1 -top-10 z-[901] rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--fg)] transition hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)] md:-right-4 md:-top-12"
        >
          ✕
        </button>

        {/* KNJIGA */}
        <div className="flipbook-wrapper">
          <div className="flipbook">
            {/* početna leva baza */}
            <div
              className="base-left"
              style={{ backgroundImage: spreads[0]?.left?.src ? `url(${spreads[0].left!.src})` : "none" }}
              aria-label={spreads[0]?.left?.alt ?? "Leva strana"}
            />

            {/* listovi */}
            {leaves.map((leaf, i) => {
              const flipped = i < page;
              const zIndex  = flipped ? i : 800 - i;
              return (
                <div key={i} className={`leaf ${flipped ? "flipped" : ""}`} style={{ zIndex }}>
                  <div
                    className="face face-front"
                    style={{ backgroundImage: leaf.front?.src ? `url(${leaf.front.src})` : "none" }}
                    aria-label={leaf.front?.alt ?? `Desna strana ${leaf.spreadIndex + 1}`}
                  />
                  <div
                    className="face face-back"
                    style={{ backgroundImage: leaf.back?.src ? `url(${leaf.back.src})` : "none" }}
                    aria-label={leaf.back?.alt ?? `Leva strana ${leaf.spreadIndex + 2}`}
                  />
                </div>
              );
            })}

            {/* desna korica */}
            <div className="cover-right" />
          </div>
        </div>

        <div className="mt-3 text-center text-sm text-[var(--muted)]">
          Strana {currentSpreadIdx + 1}/{totalSpreads} — ESC, klik pozadina ili ✕ zatvara
        </div>
      </div>

      {/* scoped CSS — svetla tema (ivory stranice, ink senke) */}
      <style>{`
        .flipbook-wrapper{
          margin: 0 auto; width: min(96vw, 1200px); height: min(72vh, 760px);
          display:flex; align-items:center; justify-content:center;
        }
        .flipbook{ position:relative; width:100%; height:100%; perspective:2000px; transform-style:preserve-3d; }
        .base-left{
          position:absolute; top:0; bottom:0; left:0; width:50%;
          background-size: cover; background-position: center;
          border:1px solid var(--border-strong); border-radius: 14px 0 0 14px;
          box-shadow: inset 0 0 24px rgba(43,41,37,.08); background-color:var(--surface-2); z-index:0;
        }
        .cover-right{
          position:absolute; top:0; bottom:0; right:0; width:50%;
          border:1px solid var(--border-strong); border-radius: 0 14px 14px 0;
          background: radial-gradient(120% 120% at 50% 20%, rgba(255,255,255,.7), rgba(43,41,37,.05)), var(--surface-2);
          box-shadow: inset 0 0 24px rgba(43,41,37,.08); z-index:-1;
        }
        .leaf{
          position:absolute; top:0; bottom:0; right:0; width:50%;
          transform-origin:left; transform-style:preserve-3d;
          transition: transform .9s cubic-bezier(.22,.61,.36,1), box-shadow .9s;
          box-shadow: 0 18px 40px rgba(43,41,37,.14);
        }
        .leaf::after{
          content:""; position:absolute; top:0; bottom:0; left:-1px; width:1px;
          background: linear-gradient(180deg, rgba(43,41,37,.2), rgba(43,41,37,0)); opacity:.5;
        }
        .leaf .face{
          position:absolute; inset:0; background-size:cover; background-position:center;
          border:1px solid var(--border-strong); border-radius:0 14px 14px 0;
          overflow:hidden; backface-visibility:hidden; background-color:var(--surface-2);
        }
        .leaf .face-front{ transform: rotateY(0deg) translateZ(0.1px); }
        .leaf .face-back { transform: rotateY(180deg) translateZ(0.1px); border-radius:14px 0 0 14px; }
        .leaf:not(.flipped):hover{ box-shadow:0 24px 60px rgba(43,41,37,.2); }
        .leaf.flipped{ transform: rotateY(-180deg); box-shadow:0 14px 30px rgba(43,41,37,.1); }
        .leaf:not(.flipped) .face-front::before{
          content:""; position:absolute; inset:0; background:linear-gradient(90deg, rgba(43,41,37,0), rgba(43,41,37,.1)); opacity:.6; pointer-events:none;
        }
        .leaf.flipped .face-back::before{
          content:""; position:absolute; inset:0; background:linear-gradient(270deg, rgba(43,41,37,0), rgba(43,41,37,.08)); opacity:.6; pointer-events:none;
        }
        @media (max-width: 640px){ .flipbook-wrapper{ height: min(64vh, 600px); } }
      `}</style>
    </div>
  );
}
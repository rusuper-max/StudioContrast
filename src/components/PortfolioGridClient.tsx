"use client";

import { useMemo, useState } from "react";
import GalleryGrid from "@/components/GalleryGrid";
import FlipbookOverlay from "@/components/FlipbookOverlay";

type Cat = "sve" | "venčanje" | "veridba" | "portret" | "crno-belo";

type Item = {
  src: string;
  alt: string;
  cat: Exclude<Cat, "sve">;
};

const ALL_ITEMS: Item[] = [
  { src: "/photos/p1.webp", alt: "Venčanje — scena 1", cat: "venčanje" },
  { src: "/photos/p2.webp", alt: "Veridba — par", cat: "veridba" },
  { src: "/photos/p3.webp", alt: "Portret — editorial", cat: "portret" },
  { src: "/photos/p4.webp", alt: "Crno-belo — detalj", cat: "crno-belo" },
  { src: "/photos/p5.webp", alt: "Venčanje — ples", cat: "venčanje" },
  { src: "/photos/p6.webp", alt: "Portret — low-key", cat: "portret" },
];

const CATS: Cat[] = ["sve", "venčanje", "veridba", "portret", "crno-belo"];

export default function PortfolioGridClient() {
  const [active, setActive] = useState<Cat>("sve");
  const [albumOpen, setAlbumOpen] = useState(false);

  const filtered = useMemo(() => {
    if (active === "sve") return ALL_ITEMS;
    return ALL_ITEMS.filter((i) => i.cat === active);
  }, [active]);

  return (
    <>
      {/* Filter dugmad + Album toggle */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {CATS.map((c) => {
          const selected = c === active;
          return (
            <button
              key={c}
              onClick={() => setActive(c)}
              aria-pressed={selected}
              className={selected ? "btn btn-primary" : "btn btn-outline"}
            >
              {c === "sve" ? "Sve" : c[0].toUpperCase() + c.slice(1)}
            </button>
          );
        })}
        <span className="mx-2 h-6 w-px bg-[var(--border-strong)]" />
        <button
          onClick={() => setAlbumOpen(true)}
          className="btn btn-outline"
          aria-haspopup="dialog"
          aria-expanded={albumOpen}
        >
          Prelistaj kao album
        </button>
      </div>

      {/* Grid */}
      <div className="mt-8">
        <GalleryGrid items={filtered.map((it) => ({ src: it.src, alt: it.alt }))} />
        {filtered.length === 0 && (
          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Za ovu kategoriju još nemamo primere — uskoro ih dodajemo.
          </p>
        )}
      </div>

      {/* Overlay album */}
      {albumOpen && (
        <FlipbookOverlay
          items={filtered.map((it) => ({ src: it.src, alt: it.alt }))}
          onClose={() => setAlbumOpen(false)}
        />
      )}
    </>
  );
}
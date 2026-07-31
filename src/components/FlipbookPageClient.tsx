"use client";

import { useEffect, useMemo, useState } from "react";
import FlipbookOverlay, { FlipItem } from "./FlipbookOverlay";
import Lightbox from "./Lightbox";
import { photoCountLabel } from "@/lib/alt";

/**
 * Editorial galerija kategorije: masonry kolone sa prirodnim proporcijama
 * fotografija i velikodušnim belinama. Klik otvara lightbox; "Prelistajte kao
 * album" otvara postojeći FlipbookOverlay kao sekundarni prikaz.
 *
 * Raspored: dok se ne saznaju proporcije, CSS kolone; kada su sve slike
 * učitane, prelazi se na raspodelu "najkraća kolona prvo" (redosled očuvan)
 * da dna kolona ostanu poravnata (razlika < jedne fotografije).
 */
export default function FlipbookPageClient({
  gridItems,
  flipItems,
  lightboxItems,
  label,
}: {
  gridItems: FlipItem[];
  flipItems?: FlipItem[];
  lightboxItems?: FlipItem[];
  label?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [ratios, setRatios] = useState<(number | null)[]>(() =>
    Array(gridItems.length).fill(null)
  );
  const [cols, setCols] = useState(1);

  // Broj kolona prati breakpointe; sa malo fotografija 2 šire kolone
  // deluju premium i balansiraju se bolje od 3 izgladnele.
  useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const update = () =>
      setCols(lg.matches ? (gridItems.length >= 9 ? 3 : 2) : sm.matches ? 2 : 1);
    update();
    sm.addEventListener("change", update);
    lg.addEventListener("change", update);
    return () => {
      sm.removeEventListener("change", update);
      lg.removeEventListener("change", update);
    };
  }, [gridItems.length]);

  const onImgLoad = (i: number, img: HTMLImageElement) => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    setRatios((r) => {
      if (r[i]) return r;
      const next = [...r];
      next[i] = img.naturalWidth / img.naturalHeight;
      return next;
    });
  };

  const allKnown = ratios.every((r) => r !== null);

  // Optimalna uzastopna podela u kolone (čuva strogi redosled, minimizuje
  // najvišu kolonu) — dna kolona ostaju poravnata koliko sadržaj dozvoljava.
  const distributed = useMemo(() => {
    if (!allKnown || cols < 2) return null;
    const n = gridItems.length;
    const h = ratios.map((r) => 1 / (r as number) + 0.08); // visina + razmak

    // 1) Pohlepna raspodela po redu (u najkraću kolonu)
    const assign: number[] = Array(n).fill(0);
    {
      const heights = Array(cols).fill(0);
      for (let i = 0; i < n; i++) {
        let t = 0;
        for (let c = 1; c < cols; c++) if (heights[c] < heights[t]) t = c;
        assign[i] = t;
        heights[t] += h[i];
      }
    }
    // 2) Lokalno doterivanje: premeštaj pojedinačne stavke dok se raspon
    //    (najviša − najniža kolona) smanjuje; unutar kolone redosled je po
    //    indeksu, pa vizuelni tok ostaje očuvan.
    const colHeights = () => {
      const hs = Array(cols).fill(0);
      for (let i = 0; i < n; i++) hs[assign[i]] += h[i];
      return hs;
    };
    const spreadOf = (hs: number[]) => Math.max(...hs) - Math.min(...hs);
    for (let pass = 0; pass < 24; pass++) {
      const hs = colHeights();
      let improved = false;
      for (let i = 0; i < n; i++) {
        const from = assign[i];
        for (let to = 0; to < cols; to++) {
          if (to === from) continue;
          // kolona ne sme da ostane prazna
          if (assign.filter((a) => a === from).length === 1) continue;
          const trial = [...hs];
          trial[from] -= h[i];
          trial[to] += h[i];
          if (spreadOf(trial) + 1e-9 < spreadOf(hs)) {
            assign[i] = to;
            hs[from] = trial[from];
            hs[to] = trial[to];
            improved = true;
          }
        }
      }
      if (!improved) break;
    }

    const columns: { item: FlipItem; i: number }[][] = Array.from(
      { length: cols },
      () => []
    );
    gridItems.forEach((item, i) => columns[assign[i]].push({ item, i }));
    return columns;
  }, [allKnown, cols, gridItems, ratios]);

  const zoomLabel = (it: FlipItem, idx: number) =>
    `Uvećaj: ${it.alt ?? `${label ?? "fotografija"} ${idx + 1}`}`;

  const renderTile = (it: FlipItem, i: number) => (
    <button
      key={i}
      type="button"
      onClick={() => setOpenIndex(i)}
      aria-label={zoomLabel(it, i)}
      className="group mb-6 block w-full break-inside-avoid cursor-zoom-in rounded-[var(--radius)] md:mb-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
    >
      <span className="img-frame block">
        <img
          src={it.src}
          alt={it.alt ?? `Fotografija ${i + 1}`}
          loading="eager"
          onLoad={(e) => onImgLoad(i, e.currentTarget)}
          ref={(el) => {
            // Keširane slike se učitaju pre hidratacije — onLoad tada ne okine
            if (el && el.complete && el.naturalWidth) onImgLoad(i, el);
          }}
          className="img-zoom w-full"
          style={{ height: "auto" }}
        />
      </span>
    </button>
  );

  return (
    <>
      {/* Kontrolni red — hairline kao potpisi na naslovnoj: meta levo, album desno */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--border)] pb-3">
        <span className="meta-caps">
          Galerija · {photoCountLabel(gridItems.length)}
        </span>
        <button
          type="button"
          onClick={() => setAlbumOpen(true)}
          className="btn-text !text-[11px]"
          aria-haspopup="dialog"
          aria-expanded={albumOpen}
        >
          Prelistajte kao album
        </button>
      </div>

      {/* Masonry — balansirane kolone kada su proporcije poznate */}
      {distributed ? (
        <div
          className="mt-8 flex gap-6 md:mt-10 md:gap-10"
          aria-label={label ? `Galerija: ${label}` : "Galerija"}
        >
          {distributed.map((column, c) => (
            <div key={c} className="min-w-0 flex-1">
              {column.map(({ item, i }) => renderTile(item, i))}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="mt-8 columns-1 gap-6 sm:columns-2 lg:columns-3 md:mt-10 md:gap-10"
          aria-label={label ? `Galerija: ${label}` : "Galerija"}
        >
          {gridItems.map((it, i) => renderTile(it, i))}
        </div>
      )}

      {openIndex !== null && (
        <Lightbox
          items={lightboxItems?.length ? lightboxItems : gridItems}
          initial={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}

      {albumOpen && (
        <FlipbookOverlay
          items={flipItems?.length ? flipItems : gridItems}
          onClose={() => setAlbumOpen(false)}
        />
      )}
    </>
  );
}

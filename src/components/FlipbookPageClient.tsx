"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import FlipbookOverlay, { FlipItem } from "./FlipbookOverlay";
import Lightbox from "./Lightbox";

type Row = { start: number; items: FlipItem[] };

/**
 * Editorial galerija kategorije: naizmenično krupna fotografija pune širine,
 * pa red od 2–3 manje. Klik otvara lightbox; "Prelistaj kao album" otvara
 * postojeći FlipbookOverlay kao sekundarni prikaz.
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

  // Ritam redova: 1 puna širina, pa 3 manje, pa 1 puna, pa 2 manje...
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    let i = 0;
    let block = 0;
    while (i < gridItems.length) {
      out.push({ start: i, items: [gridItems[i]] });
      i += 1;
      const take = block % 2 === 0 ? 3 : 2;
      const slice = gridItems.slice(i, i + take);
      if (slice.length) out.push({ start: i, items: slice });
      i += take;
      block += 1;
    }
    return out;
  }, [gridItems]);

  const zoomLabel = (it: FlipItem, idx: number) =>
    `Uvećaj: ${it.alt ?? `${label ?? "fotografija"} ${idx + 1}`}`;

  const tileClass =
    "group relative block w-full cursor-zoom-in overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]";

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setAlbumOpen(true)}
          className="btn btn-outline"
          aria-haspopup="dialog"
          aria-expanded={albumOpen}
        >
          Prelistaj kao album
        </button>
      </div>

      <div className="mt-8 space-y-4 md:space-y-6" aria-label={label ? `Galerija: ${label}` : "Galerija"}>
        {rows.map((row) =>
          row.items.length === 1 ? (
            <button
              key={row.start}
              type="button"
              onClick={() => setOpenIndex(row.start)}
              aria-label={zoomLabel(row.items[0], row.start)}
              className={`${tileClass} aspect-[3/2]`}
            >
              <Image
                src={row.items[0].src}
                alt={row.items[0].alt ?? `Fotografija ${row.start + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                sizes="(max-width: 1200px) 100vw, 1152px"
                priority={row.start === 0}
              />
            </button>
          ) : (
            <div
              key={row.start}
              className={`grid gap-4 md:gap-6 ${
                row.items.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
              }`}
            >
              {row.items.map((it, j) => {
                const idx = row.start + j;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setOpenIndex(idx)}
                    aria-label={zoomLabel(it, idx)}
                    className={`${tileClass} aspect-[4/3]`}
                  >
                    <Image
                      src={it.src}
                      alt={it.alt ?? `Fotografija ${idx + 1}`}
                      fill
                      loading="lazy"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                      sizes={
                        row.items.length >= 3
                          ? "(max-width: 640px) 100vw, (max-width: 1200px) 33vw, 384px"
                          : "(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 568px"
                      }
                    />
                  </button>
                );
              })}
            </div>
          )
        )}
      </div>

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

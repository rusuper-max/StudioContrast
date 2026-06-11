"use client";
import Image from "next/image";
import { useMemo, useState } from "react";

type Pic = { src: string; alt?: string };
type Spread = { left?: Pic; right?: Pic };

export default function Album({ images, title = "Foto album" }: { images: Pic[]; title?: string }) {
  const spreads = useMemo<Spread[]>(() => {
    const arr: Spread[] = [];
    for (let i = 0; i < images.length; i += 2) {
      arr.push({ left: images[i], right: images[i + 1] });
    }
    return arr;
  }, [images]);

  const [current, setCurrent] = useState(0);
  const total = spreads.length;
  const canPrev = current > 0;
  const canNext = current < total;

  function prev() { if (canPrev) setCurrent((c) => c - 1); }
  function next() { if (canNext) setCurrent((c) => c + 1); }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-4 flex items-center justify-between text-sm text-[var(--muted)]">
        <span>{title}</span>
        <span>Strana {current}/{total}</span>
      </div>

      <div className="relative mx-auto h-[70vh] max-h-[80svh] w-full max-w-5xl select-none">
        <div className="relative mx-auto h-full w-[min(100%,900px)] perspective-2000">
          {/* korice */}
          <div className="absolute left-1/2 top-0 h-full w-[50%] rounded-r-2xl border border-[var(--border-strong)] bg-[var(--surface-2)]" />
          <div className="absolute right-1/2 top-0 h-full w-[50%] rounded-l-2xl border border-[var(--border-strong)] bg-[var(--surface-2)]" />

          {/* stranice */}
          <div className="relative z-10 h-full w-full [transform-style:preserve-3d]">
            {spreads.map((s, i) => {
              const flipped = i < current;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-0 h-full w-[50%] origin-left [transform-style:preserve-3d] transition-transform duration-700"
                  style={{
                    zIndex: 1000 - i,
                    transform: flipped ? "rotateY(-180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* front (desna) */}
                  <div className="absolute inset-0 overflow-hidden rounded-r-2xl border border-[var(--border)] bg-[var(--surface-2)] backface-hidden">
                    {s.right?.src && (
                      <Image
                        src={s.right.src}
                        alt={s.right.alt ?? "Desna strana albuma"}
                        fill
                        className="object-cover"
                        sizes="50vw"
                        priority={i < 2}
                      />
                    )}
                  </div>
                  {/* back (leva) */}
                  <div className="absolute inset-0 overflow-hidden rounded-l-2xl border border-[var(--border)] bg-[var(--surface-2)] [transform:rotateY(180deg)] backface-hidden">
                    {s.left?.src && (
                      <Image
                        src={s.left.src}
                        alt={s.left.alt ?? "Leva strana albuma"}
                        fill
                        className="object-cover"
                        sizes="50vw"
                        priority={i < 2}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* kontrole */}
        <button
          onClick={prev}
          disabled={!canPrev}
          aria-label="Prethodna strana"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] transition hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)] disabled:opacity-40"
        >
          ◀
        </button>
        <button
          onClick={next}
          disabled={!canNext}
          aria-label="Sledeća strana"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] transition hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)] disabled:opacity-40"
        >
          ▶
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-[var(--muted)]">Strelice ◀ ▶ za listanje.</p>
    </div>
  );
}
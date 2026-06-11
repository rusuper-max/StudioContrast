"use client";
import Image from "next/image";
import { useState } from "react";
import Lightbox from "./Lightbox";
import { altForImage } from "@/lib/alt";

export type GalleryItem = { src: string; alt?: string };

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!items?.length) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Galerija je trenutno prazna — fotografije stižu uskoro.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((it, i) => {
          const alt = it.alt ?? altForImage(it.src, undefined, i);
          return (
            <div key={i} className="group">
              {/* 4:3 placeholder preko padding-bottom trika */}
              <div className="relative h-0 overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] pb-[75%]">
                <Image
                  src={it.src}
                  alt={alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={i < 4}
                />
                <button
                  onClick={() => setOpenIndex(i)}
                  aria-label={`Uvećaj: ${alt}`}
                  className="absolute inset-0 cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
                />
              </div>
            </div>
          );
        })}
      </div>

      {openIndex !== null && (
        <Lightbox
          items={items}
          initial={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}

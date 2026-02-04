"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ClientGallery, GalleryImage } from "@/lib/gallery";
import { cinzel } from "@/lib/fonts";

// Helper za srpsku množinu
function formatPhotoCount(count: number): string {
  if (count === 1) return "1 fotografija";
  if (count >= 2 && count <= 4) return `${count} fotografije`;
  return `${count} fotografija`;
}

type Props = {
  gallery: ClientGallery;
  images: GalleryImage[];
  hasPassword: boolean;
};

export default function ClientGalleryView({ gallery, images, hasPassword }: Props) {
  const [isUnlocked, setIsUnlocked] = useState(!hasPassword);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : images.length - 1));
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : 0));
    }

    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, images.length]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const params = new URLSearchParams({ slug: gallery.slug });
      if (password) params.set("p", password);
      const res = await fetch(`/api/gallery/download?${params}`);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${gallery.name}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Greška pri preuzimanju albuma");
    } finally {
      setDownloading(false);
    }
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/gallery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: gallery.slug, password }),
      });

      if (res.ok) {
        setIsUnlocked(true);
      } else {
        setError("Pogrešna šifra");
      }
    } catch {
      setError("Greška pri provjeri šifre");
    } finally {
      setLoading(false);
    }
  }

  // Password screen
  if (!isUnlocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className={`${cinzel.className} mb-3 text-2xl font-semibold tracking-wide text-white md:text-3xl`}>
              {gallery.name}
            </h1>
            {gallery.clientName && (
              <p className="text-neutral-400">za {gallery.clientName}</p>
            )}
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm text-neutral-400">
                Unesite šifru za pristup galeriji
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-neutral-500 focus:border-white/40 focus:outline-none"
                placeholder="Šifra"
                autoFocus
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-lg bg-white py-3 font-medium text-black transition hover:bg-neutral-200 disabled:opacity-50"
            >
              {loading ? "Provjera..." : "Pristupi galeriji"}
            </button>
          </form>

          <a
            href="https://studiocontrast.rs"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 block text-center font-serif text-sm text-neutral-500 transition hover:text-white"
          >
            Studio <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">Contrast</span>
          </a>
        </div>
      </div>
    );
  }

  // Gallery view with masonry layout
  return (
    <div className="min-h-screen bg-black">
      {/* Header with Logo */}
      <header className="border-b border-white/10 bg-black">
        {/* Logo */}
        <div className="border-b border-white/5 py-4 text-center">
          <a href="https://studiocontrast.rs" target="_blank" rel="noopener noreferrer" className="inline-block font-serif text-xl text-white/90 transition hover:text-white">
            Studio <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">Contrast</span>
          </a>
        </div>
        {/* Gallery Title */}
        <div className="mx-auto max-w-[2000px] px-4 py-8 text-center">
          <h1 className={`${cinzel.className} text-3xl font-semibold tracking-wide text-white md:text-4xl lg:text-5xl`}>
            {gallery.name}
          </h1>
          {gallery.clientName && (
            <p className="mt-2 text-base text-neutral-400">{gallery.clientName}</p>
          )}
          <p className="mt-3 text-sm text-neutral-500">
            {formatPhotoCount(images.length)}
          </p>
          {/* Download & Visit buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading || images.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Priprema albuma...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Preuzmi ceo album
                </>
              )}
            </button>
            <a
              href="https://studiocontrast.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Poseti naš sajt
            </a>
          </div>
        </div>
      </header>

      {/* Gallery Grid - horizontal row-by-row layout */}
      <main className="mx-auto max-w-[2000px] px-3 py-6 sm:px-4 md:px-6">
        {images.length === 0 ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <p className="text-neutral-400">
              Galerija je prazna. Slike će uskoro biti dostupne.
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {(() => {
              // Simple row-based justified layout
              const targetHeight = 280;
              const containerWidth = 1800; // approximate max width

              // Group images into rows based on aspect ratios
              const rows: { images: typeof images; totalAspect: number }[] = [];
              let currentRow: typeof images = [];
              let currentAspect = 0;
              const targetAspect = containerWidth / targetHeight; // ~6.4 for full row

              images.forEach((img) => {
                const aspect = (img.width && img.height) ? img.width / img.height : 4/3;

                if (currentAspect + aspect > targetAspect && currentRow.length > 0) {
                  // Current row is full enough, start new row
                  rows.push({ images: currentRow, totalAspect: currentAspect });
                  currentRow = [img];
                  currentAspect = aspect;
                } else {
                  currentRow.push(img);
                  currentAspect += aspect;
                }
              });

              // Don't forget the last row
              if (currentRow.length > 0) {
                rows.push({ images: currentRow, totalAspect: currentAspect });
              }

              let globalIndex = 0;

              return rows.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-2 sm:gap-3">
                  {row.images.map((img) => {
                    const aspect = (img.width && img.height) ? img.width / img.height : 4/3;
                    const widthPercent = (aspect / row.totalAspect) * 100;
                    const imgIndex = globalIndex++;

                    return (
                      <div
                        key={img.public_id}
                        className="group relative cursor-pointer overflow-hidden rounded-md"
                        style={{ width: `${widthPercent}%` }}
                        onClick={() => setLightboxIndex(images.findIndex(i => i.public_id === img.public_id))}
                      >
                        <div
                          className="relative w-full bg-neutral-900"
                          style={{ paddingBottom: `${(1 / aspect) * 100}%` }}
                        >
                          <Image
                            src={img.thumbSrc}
                            alt={`Fotografija ${imgIndex + 1}`}
                            fill
                            className="object-cover transition-all duration-300 group-hover:scale-[1.02] group-hover:brightness-110"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            loading={imgIndex < 10 ? "eager" : "lazy"}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center">
        <a
          href="https://studiocontrast.rs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-serif text-sm text-neutral-500 transition hover:text-white"
        >
          Studio <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">Contrast</span>
        </a>
      </footer>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute left-4 top-4 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
            {lightboxIndex + 1} / {images.length}
          </div>

          <div className="relative h-[90vh] w-[95vw] max-w-7xl">
            <Image
              src={images[lightboxIndex].src}
              alt={`Fotografija ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="95vw"
              priority
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : images.length - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-4 text-white transition hover:bg-white/20"
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setLightboxIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : 0))}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-4 text-white transition hover:bg-white/20"
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <button
            onClick={() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : images.length - 1))}
            className="absolute bottom-0 left-0 top-16 w-1/3 cursor-w-resize bg-transparent"
          />
          <button
            onClick={() => setLightboxIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : 0))}
            className="absolute bottom-0 right-0 top-16 w-1/3 cursor-e-resize bg-transparent"
          />
        </div>
      )}
    </div>
  );
}

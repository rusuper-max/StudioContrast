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

  // Download state
  const [downloadState, setDownloadState] = useState<"idle" | "preparing" | "background" | "done" | "error">("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

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

  function startDownload() {
    const controller = new AbortController();
    setAbortController(controller);
    setDownloadState("preparing");
    setDownloadProgress(0);
    setShowDownloadModal(true);

    const params = new URLSearchParams({ slug: gallery.slug });
    if (password) params.set("p", password);

    fetch(`/api/gallery/download?${params}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Download failed");

        const contentLength = res.headers.get("Content-Length");
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const chunks: BlobPart[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (total > 0) {
            setDownloadProgress(Math.round((received / total) * 100));
          } else {
            // Estimate based on image count (~500KB per image average)
            const estimated = images.length * 500 * 1024;
            setDownloadProgress(Math.min(95, Math.round((received / estimated) * 100)));
          }
        }

        const blob = new Blob(chunks, { type: "application/zip" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${gallery.name}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setDownloadState("done");
        setDownloadProgress(100);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          setDownloadState("idle");
          setShowDownloadModal(false);
        } else {
          setDownloadState("error");
        }
      });
  }

  function cancelDownload() {
    abortController?.abort();
    setAbortController(null);
    setDownloadState("idle");
    setShowDownloadModal(false);
  }

  function backgroundDownload() {
    setDownloadState("background");
    setShowDownloadModal(false);
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
              onClick={startDownload}
              disabled={downloadState === "preparing" || downloadState === "background" || images.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              {downloadState === "background" ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Priprema u toku ({downloadProgress}%)
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

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-neutral-900 p-6 text-center">
            {downloadState === "preparing" && (
              <>
                <svg className="mx-auto mb-4 h-10 w-10 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <h3 className="mb-2 text-lg font-medium text-white">Priprema albuma...</h3>
                <p className="mb-4 text-sm text-neutral-400">
                  {formatPhotoCount(images.length)} se pakuje u ZIP
                </p>

                {/* Progress bar */}
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-300 transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <p className="mb-5 text-xs text-neutral-500">{downloadProgress}%</p>

                <div className="flex gap-3">
                  <button
                    onClick={backgroundDownload}
                    className="flex-1 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    Nastavi u pozadini
                  </button>
                  <button
                    onClick={cancelDownload}
                    className="rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                  >
                    Prekini
                  </button>
                </div>
              </>
            )}

            {downloadState === "done" && (
              <>
                <svg className="mx-auto mb-4 h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="mb-2 text-lg font-medium text-white">Album je spreman!</h3>
                <p className="mb-5 text-sm text-neutral-400">Preuzimanje je započeto.</p>
                <button
                  onClick={() => { setShowDownloadModal(false); setDownloadState("idle"); }}
                  className="w-full rounded-lg bg-white py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200"
                >
                  Zatvori
                </button>
              </>
            )}

            {downloadState === "error" && (
              <>
                <svg className="mx-auto mb-4 h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mb-2 text-lg font-medium text-white">Greška</h3>
                <p className="mb-5 text-sm text-neutral-400">Priprema albuma nije uspela. Pokušajte ponovo.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowDownloadModal(false); setDownloadState("idle"); }}
                    className="flex-1 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    Zatvori
                  </button>
                  <button
                    onClick={startDownload}
                    className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200"
                  >
                    Pokušaj ponovo
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

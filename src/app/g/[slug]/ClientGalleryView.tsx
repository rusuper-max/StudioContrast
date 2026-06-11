"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ClientGallery, GalleryImage } from "@/lib/gallery";

// Helper za srpsku množinu
function formatPhotoCount(count: number): string {
  if (count === 1) return "1 fotografija";
  if (count >= 2 && count <= 4) return `${count} fotografije`;
  return `${count} fotografija`;
}

// Datum u srpskoj latinici (npr. "12. jun 2026.")
function formatGalleryDate(iso: string): string | null {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("sr-Latn-RS", { day: "numeric", month: "long", year: "numeric" });
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
      setError("Greška pri proveri šifre");
    } finally {
      setLoading(false);
    }
  }

  const galleryDate = formatGalleryDate(gallery.createdAt);

  // Password screen
  if (!isUnlocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-4 py-12">
        <div className="card w-full max-w-sm p-8 text-center sm:p-10">
          <p className="kicker mb-4">Studio Contrast</p>
          <h1 className="text-3xl text-[var(--fg)]">Vaša galerija</h1>
          <p className="mt-3 text-[var(--muted)]">
            {gallery.name}
            {gallery.clientName ? ` — za ${gallery.clientName}` : ""}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            Uspomene vas čekaju. Unesite šifru koju ste dobili od nas i uživajte.
          </p>

          <form onSubmit={handleUnlock} className="mt-8 space-y-4 text-left">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm text-[var(--muted)]">
                Šifra za pristup galeriji
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-strong)] bg-white px-4 py-3 text-[var(--fg)] placeholder:text-[var(--muted)] focus:border-[var(--accent-strong)] focus:outline-none"
                placeholder="Šifra"
                autoFocus
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading || !password}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Provera..." : "Otvorite galeriju"}
            </button>
          </form>
        </div>

        <a
          href="https://studiocontrast.rs"
          target="_blank"
          rel="noopener noreferrer"
          className="link mt-8 font-serif text-sm text-[var(--muted)]"
        >
          Studio Contrast
        </a>
      </div>
    );
  }

  // Gallery view with masonry layout
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header with Logo */}
      <header className="border-b border-[var(--border)]">
        {/* Logo */}
        <div className="border-b border-[var(--border)] py-4 text-center">
          <a
            href="https://studiocontrast.rs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-serif text-lg text-[var(--fg)] transition hover:text-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
          >
            Studio Contrast
          </a>
        </div>
        {/* Gallery Title */}
        <div className="mx-auto max-w-[2000px] px-4 py-12 text-center md:py-16">
          <p className="kicker mb-5">Vaša galerija</p>
          <h1 className="text-[var(--fg)]">{gallery.name}</h1>
          {gallery.clientName && (
            <p className="mt-4 text-base text-[var(--muted)]">{gallery.clientName}</p>
          )}
          <p className="mt-2 text-sm text-[var(--muted)]">
            {galleryDate ? `${galleryDate} · ` : ""}
            {formatPhotoCount(images.length)}
          </p>
          {/* Download & Visit buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={startDownload}
              disabled={downloadState === "preparing" || downloadState === "background" || images.length === 0}
              className="btn btn-primary gap-2 disabled:opacity-50"
            >
              {downloadState === "background" ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Priprema u toku ({downloadProgress}%)
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Preuzmite sve fotografije
                </>
              )}
            </button>
            <a
              href="https://studiocontrast.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Posetite naš sajt
            </a>
          </div>
        </div>
      </header>

      {/* Gallery Grid - horizontal row-by-row layout */}
      <main className="mx-auto max-w-[2000px] px-3 py-8 sm:px-4 md:px-6 md:py-10">
        {images.length === 0 ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <p className="text-[var(--muted)]">
              Fotografije će uskoro biti ovde. Hvala vam na strpljenju.
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
                      <button
                        key={img.public_id}
                        type="button"
                        aria-label={`Pogledajte fotografiju ${imgIndex + 1} uvećano`}
                        className="group relative block cursor-pointer overflow-hidden rounded-md p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
                        style={{ width: `${widthPercent}%` }}
                        onClick={() => setLightboxIndex(images.findIndex(i => i.public_id === img.public_id))}
                      >
                        <div
                          className="relative w-full bg-[var(--surface-2)]"
                          style={{ paddingBottom: `${(1 / aspect) * 100}%` }}
                        >
                          <Image
                            src={img.thumbSrc}
                            alt={`Fotografija ${imgIndex + 1} — ${gallery.name}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            loading={imgIndex < 10 ? "eager" : "lazy"}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 text-center">
        <a
          href="https://studiocontrast.rs"
          target="_blank"
          rel="noopener noreferrer"
          className="link inline-block font-serif text-sm text-[var(--muted)]"
        >
          Studio Contrast
        </a>
      </footer>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]">
          <button
            onClick={() => setLightboxIndex(null)}
            aria-label="Zatvorite pregled"
            className="absolute right-4 top-4 z-10 rounded-full border border-[var(--border)] bg-white p-3 text-[var(--fg)] transition hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute left-4 top-4 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--muted)]">
            {lightboxIndex + 1} / {images.length}
          </div>

          <div className="relative h-[90vh] w-[95vw] max-w-7xl">
            <Image
              src={images[lightboxIndex].src}
              alt={`Fotografija ${lightboxIndex + 1} — ${gallery.name}`}
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
                aria-label="Prethodna fotografija"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-white p-4 text-[var(--fg)] transition hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setLightboxIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : 0))}
                aria-label="Sledeća fotografija"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-white p-4 text-[var(--fg)] transition hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <button
            onClick={() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : images.length - 1))}
            aria-label="Prethodna fotografija"
            tabIndex={-1}
            className="absolute bottom-0 left-0 top-16 w-1/3 cursor-w-resize bg-transparent"
          />
          <button
            onClick={() => setLightboxIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : 0))}
            aria-label="Sledeća fotografija"
            tabIndex={-1}
            className="absolute bottom-0 right-0 top-16 w-1/3 cursor-e-resize bg-transparent"
          />
        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-sm p-6 text-center">
            {downloadState === "preparing" && (
              <>
                <svg className="mx-auto mb-4 h-10 w-10 animate-spin text-[var(--fg)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <h3 className="mb-2 text-lg text-[var(--fg)]">Priprema albuma...</h3>
                <p className="mb-4 text-sm text-[var(--muted)]">
                  {formatPhotoCount(images.length)} se pakuje u ZIP
                </p>

                {/* Progress bar */}
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <p className="mb-5 text-xs text-[var(--muted)]">{downloadProgress}%</p>

                <div className="flex gap-3">
                  <button
                    onClick={backgroundDownload}
                    className="flex-1 rounded-full border border-[var(--border-strong)] px-4 py-2.5 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
                  >
                    Nastavite u pozadini
                  </button>
                  <button
                    onClick={cancelDownload}
                    className="rounded-full border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    Prekini
                  </button>
                </div>
              </>
            )}

            {downloadState === "done" && (
              <>
                <svg className="mx-auto mb-4 h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="mb-2 text-lg text-[var(--fg)]">Album je spreman</h3>
                <p className="mb-5 text-sm text-[var(--muted)]">Preuzimanje je započeto.</p>
                <button
                  onClick={() => { setShowDownloadModal(false); setDownloadState("idle"); }}
                  className="btn btn-primary w-full"
                >
                  Zatvori
                </button>
              </>
            )}

            {downloadState === "error" && (
              <>
                <svg className="mx-auto mb-4 h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mb-2 text-lg text-[var(--fg)]">Greška</h3>
                <p className="mb-5 text-sm text-[var(--muted)]">Priprema albuma nije uspela. Pokušajte ponovo.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowDownloadModal(false); setDownloadState("idle"); }}
                    className="flex-1 rounded-full border border-[var(--border-strong)] px-4 py-2.5 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
                  >
                    Zatvori
                  </button>
                  <button
                    onClick={startDownload}
                    className="btn btn-primary flex-1"
                  >
                    Pokušajte ponovo
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

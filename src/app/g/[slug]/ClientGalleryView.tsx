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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-3">
            {images.map((img, i) => {
              const aspectRatio = img.width && img.height ? img.width / img.height : 4 / 3;

              return (
                <div
                  key={img.public_id}
                  className="group relative cursor-pointer overflow-hidden rounded-md"
                  onClick={() => setLightboxIndex(i)}
                >
                  <div
                    className="relative w-full bg-neutral-900"
                    style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
                  >
                    <Image
                      src={img.thumbSrc}
                      alt={`Fotografija ${i + 1}`}
                      fill
                      className="object-cover transition-all duration-300 group-hover:scale-[1.02] group-hover:brightness-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      loading={i < 10 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </div>
              );
            })}
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

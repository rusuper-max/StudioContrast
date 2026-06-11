// src/components/HeroVideo.tsx
// Editorial hero: krupan serif naslov na svetloj pozadini, video kao samostalan
// kadar ispod — tekst nikad ne stoji preko snimka (čitljivost + magazine look).
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Container from "./Container";

type Props = {
  /** Gde vodi glavno dugme "Proverite svoj datum" (default /upit) */
  ctaHref?: string;
  /** Poster / fallback slika — prikazuje se na mobilnom i dok se video ne učita */
  poster?: string;
};

export default function HeroVideo({ ctaHref = "/upit", poster = "/photos/p1.webp" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  // Video se pušta samo na md+ ekranima i kada korisnik ne traži smanjeno kretanje.
  // Na mobilnom ostaje poster slika.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setShowVideo(mq.matches && !reduced.matches);
    update();
    mq.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [muted, playing, showVideo]);

  return (
    <section className="overflow-hidden">
      {/* Tipografski blok — na ivory pozadini, levo poravnat, magazine stil */}
      <Container>
        <div className="pt-10 md:pt-16">
          <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-4">
            <span className="kicker">Fotografija i film venčanja</span>
            <span className="hidden text-[11px] uppercase tracking-[0.25em] text-[var(--muted)] sm:block">
              Užice · Zlatibor · Srbija
            </span>
          </div>

          <h1 className="mt-8 max-w-[14ch] font-serif text-[clamp(48px,8.5vw,120px)] leading-[1.02] tracking-[-0.015em] md:mt-10">
            Priče koje ostaju <em className="italic">zauvek</em>.
          </h1>

          <div className="mt-8 flex flex-col gap-6 md:mt-12 md:flex-row md:items-end md:justify-between">
            <p className="lead max-w-md text-base md:text-lg">
              Tiho prisustvo, prirodni kadrovi i emocija koja se ne režira — od
              spremanja do poslednjeg plesa.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={ctaHref} className="btn btn-primary">
                Proverite svoj datum
              </Link>
              <Link href="/portfolio" className="btn btn-outline">
                Pogledajte priče
              </Link>
            </div>
          </div>
        </div>
      </Container>

      {/* Video kadar — pun, ali uokviren, kao samostalna fotografija u magazinu */}
      <div className="mx-auto mt-10 w-full max-w-[1480px] px-4 md:mt-14 md:px-8">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-[var(--surface-2)] sm:aspect-[16/9] md:aspect-[21/9]">
          {/* Poster / fallback slika (uvek prisutna ispod videa) */}
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {showVideo && (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={poster}
            >
              <source src="/hero/hero.mp4" type="video/mp4" />
            </video>
          )}

          {/* Kontrole videa — samo dok se video prikazuje */}
          {showVideo && (
            <div className="absolute bottom-4 right-4 z-[2] flex items-center gap-1 rounded-full border border-white/30 bg-black/35 px-1.5 py-1 text-[11px] text-white/90">
              <button
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Uključi zvuk" : "Isključi zvuk"}
                className="rounded-full px-2.5 py-1 transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                {muted ? "Zvuk: isklj." : "Zvuk: uklj."}
              </button>
              <button
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pauziraj video" : "Pusti video"}
                className="rounded-full px-2.5 py-1 transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                {playing ? "Pauza" : "Pusti"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

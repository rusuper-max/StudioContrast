// src/components/HeroCinematic.tsx
// Full-bleed kinematski hero: video (md+) / fotografija (mobilni) preko celog
// ekrana, scrim za čitljivost, naslov dole-levo, scroll indikator.
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Props = {
  ctaHref?: string;
  /** Kadar iz videa — prvi frame; stoji ispod videa na md+ (bez „bljeska“) */
  poster?: string;
  /** Crno-bela fotografija za mobilni, gde se video ne pušta */
  posterMobile?: string;
};

export default function HeroCinematic({
  ctaHref = "/upit",
  poster = "/home/hero-poster.jpg",
  posterMobile = "/home/hero-mobile.jpg",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [muted, setMuted] = useState(true);

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

    // Safari: `muted` mora da postoji i kao ATRIBUT (React postavlja samo
    // svojstvo). Bez toga autoplay ume da bude odbijen, a video ostane
    // zamrznut na prvom kadru dok se stranica ne osveži.
    if (muted) v.setAttribute("muted", "");
    else v.removeAttribute("muted");
    v.muted = muted;

    let cancelled = false;
    const tryPlay = () => {
      if (cancelled || !v.paused) return;
      // Odbijanje je normalno (npr. Low Power Mode) — tada ostaje poster,
      // koji je isti kadar, pa izgleda namerno. Ali NE odustajemo posle
      // prvog pokušaja, jer je najčešći uzrok samo „još nema podataka“.
      v.play().catch(() => {});
    };

    tryPlay();

    // Ponovi kada stigne dovoljno podataka i kada se korisnik vrati na tab.
    const events = ["loadeddata", "canplay", "canplaythrough", "stalled", "suspend"];
    for (const e of events) v.addEventListener(e, tryPlay);
    const onVisible = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      for (const e of events) v.removeEventListener(e, tryPlay);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [muted, showVideo]);

  return (
    <section className="relative min-h-[640px] w-full overflow-hidden bg-[var(--ink)] text-[var(--ink-fg)]" style={{ height: "100svh" }}>
      {/* Pozadina. Na md+ stoji PRVI KADAR videa (isti filter) pa je prelaz
          na video nevidljiv; na mobilnom, gde se video ne pušta, stoji
          crno-bela fotografija. <picture> bira samo jednu — bez dvostrukog
          preuzimanja. LCP element: eager + visok prioritet. */}
      <picture>
        <source media="(min-width: 768px)" srcSet={poster} />
        <img
          src={posterMobile}
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="hero-poster absolute inset-0 h-full w-full object-cover object-[50%_30%]"
        />
      </picture>
      {showVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
          style={{ filter: "saturate(0.55) contrast(1.05)" }}
        >
          <source src="/hero/hero.mp4" type="video/mp4" />
        </video>
      )}

      {/* Scrim — jak gore (čitljiv logo i na svetlom nebu), jak dole (naslov) */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, rgba(15,13,11,0.30) 0%, rgba(15,13,11,0.10) 26%, rgba(15,13,11,0.14) 46%, rgba(15,13,11,0.80) 100%)",
        }}
      />

      {/* Sadržaj — blaga senka čuva čitljivost preko svetlih delova kadra */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ textShadow: "0 1px 12px rgba(15,13,11,0.45)" }}
      >
        <div className="mx-auto w-full max-w-[1480px] px-5 pb-10 md:px-8 md:pb-14">
          <p className="eyebrow eyebrow--light">
            <span className="md:hidden">Foto i film — Užice · Srbija</span>
            <span className="hidden md:inline">
              Fotografija i film venčanja — Užice · Zlatibor · Srbija
            </span>
          </p>
          <h1 className="mt-4 max-w-[13ch] text-[clamp(46px,7.5vw,116px)] leading-[0.96]">
            Priče koje ostaju <em className="serif-italic">zauvek</em>.
          </h1>

          <div className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between">
            <p className="max-w-md font-serif text-[16px] leading-relaxed text-[var(--ink-fg)]/85 md:text-[17px]">
              Tiho prisustvo, prirodni kadrovi i emocija koja se ne režira —
              od spremanja do poslednjeg plesa.
            </p>
            <div className="flex flex-wrap items-center gap-7">
              <Link href={ctaHref} className="btn btn-light">
                Proverite svoj datum
              </Link>
              <Link
                href="/portfolio"
                className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-fg)]/70 transition hover:text-[var(--ink-fg)]"
              >
                Pogledajte priče →
              </Link>
            </div>
          </div>

          {/* Donja meta linija */}
          <div className="mt-10 hidden items-center justify-between border-t border-white/15 pt-5 md:flex">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--ink-fg)]/55">
              Dokumentarno · U boji i crno-belo
            </span>
            <span className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[var(--ink-fg)]/55">
              Skrolujte
              <span className="scroll-line relative block h-px w-10 overflow-hidden bg-white/25" aria-hidden="true">
                <span className="absolute inset-y-0 left-0 w-1/2 animate-[heroline_2.2s_ease-in-out_infinite] bg-[var(--ink-fg)]/80" />
              </span>
            </span>
            {showVideo ? (
              <button
                onClick={() => setMuted((m) => !m)}
                className="text-[10px] uppercase tracking-[0.3em] text-[var(--ink-fg)]/55 transition hover:text-[var(--ink-fg)]"
                aria-label={muted ? "Uključite zvuk" : "Isključite zvuk"}
              >
                {muted ? "Zvuk — isklj." : "Zvuk — uklj."}
              </button>
            ) : (
              <span className="w-24" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* Mobilni: crno-bela fotografija. md+: isti filter kao video,
           da zamena poster→video ne bude vidljiva. */
        .hero-poster { filter: grayscale(1) contrast(1.06); }
        @media (min-width: 768px) {
          .hero-poster { filter: saturate(0.55) contrast(1.05); }
        }
        @keyframes heroline {
          0% { transform: translateX(-100%); }
          55% { transform: translateX(200%); }
          100% { transform: translateX(200%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .scroll-line span { animation: none; }
        }
      `}</style>
    </section>
  );
}

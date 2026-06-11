import Link from "next/link";
import Container from "./Container";

export default function HeroImage() {
  return (
    <section
      className="relative overflow-hidden bg-[var(--surface-2)]"
      style={{
        backgroundImage: "url(/hero/hero.webp)", // stavi sliku u: public/hero/hero.webp
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Blagi tamni gradijent — samo pri dnu, radi čitljivosti teksta */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,.10) 50%, rgba(0,0,0,.38) 100%)",
        }}
      />

      <Container className="relative z-10 flex min-h-[78vh] flex-col justify-end pb-14 md:min-h-[86vh] md:pb-20">
        <span className="block text-[11px] uppercase tracking-[0.25em] text-white/80">
          Fotografija i film venčanja
        </span>

        <h1 className="mt-4 text-white">Priče koje ostaju zauvek.</h1>

        <p className="mt-4 max-w-xl text-base text-white/85 md:text-lg">
          Fotografija i film venčanja — Užice, Zlatibor i cela Srbija.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/upit" className="btn btn-primary">
            Proverite svoj datum
          </Link>
          <Link
            href="/portfolio"
            className="btn border border-white/70 text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-white"
          >
            Pogledajte priče
          </Link>
        </div>
      </Container>
    </section>
  );
}

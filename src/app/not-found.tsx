// src/app/not-found.tsx
// Stranica 404 — zadržava posetioca (i crawler-a) na sajtu umesto
// podrazumevane Next.js poruke na engleskom. Status ostaje 404.
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";

export const metadata = {
  title: "Stranica nije pronađena",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/portfolio", label: "Portfolio", hint: "Venčanja, svadbe, krštenja i portreti" },
  { href: "/ponude", label: "Paketi i cene", hint: "Konfigurator ponude" },
  { href: "/onama", label: "O nama", hint: "Janko i Marija" },
  { href: "/kontakt", label: "Kontakt", hint: "Carinska 4, Užice" },
];

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main>
        <section className="pb-20 pt-16 md:pb-28 md:pt-24">
          <Container className="!max-w-[1480px] md:!px-8">
            <div className="grid gap-8 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <span className="eyebrow">404</span>
                <h1 className="display-2 mt-4 max-w-[16ch]">
                  Ove stranice <em className="serif-italic">nema</em>
                </h1>
              </div>
              <div className="md:col-span-5 md:pb-2">
                <p className="lead max-w-sm leading-relaxed md:ml-auto">
                  Adresa je verovatno stara ili pogrešno otkucana. Odavde možete
                  nastaviti tamo gde ste krenuli.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-x-8 border-t border-[var(--border)] md:mt-16 md:grid-cols-2">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex items-baseline justify-between gap-6 border-b border-[var(--border)] py-6"
                >
                  <span className="font-serif text-[21px] leading-tight md:text-[23px]">
                    {l.label}
                    <em className="serif-italic block pt-1 text-[13px] not-italic text-[var(--muted)]">
                      {l.hint}
                    </em>
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] transition-colors group-hover:text-[var(--accent-strong)]"
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Link href="/" className="btn-text">
                Nazad na početnu
              </Link>
            </div>
          </Container>
        </section>
      </main>
      <Footer cta={false} />
    </>
  );
}

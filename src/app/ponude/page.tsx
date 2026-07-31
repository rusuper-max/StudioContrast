// src/app/ponude/page.tsx
// Konfigurator ponude — editorial header (levo poravnat) + hairline
// arhitektura konfiguratora. Logika cena živi u PricingConfigurator.
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import PricingConfigurator from "@/components/PricingConfigurator";
import { type PlanSlug } from "@/data/packages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Paketi i cene fotografisanja venčanja",
  ogTitle: "Paketi i cene fotografisanja venčanja | Studio Contrast",
  description:
    "Paketi za fotografisanje i snimanje venčanja, svadbi i slavlja, uz konfigurator dodataka. Izračunajte orijentacionu cenu i pošaljite upit — odgovaramo za 24h.",
  path: "/ponude",
});

type Props = {
  searchParams?: Promise<{ plan?: string; type?: string }>;
};

export default async function OffersPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const plan: PlanSlug =
    sp.plan && (["basic", "classic", "signature"] as string[]).includes(sp.plan)
      ? (sp.plan as PlanSlug)
      : "classic";
  const initialType = sp.type; // može biti npr. "Studio", "Rođendan"...

  return (
    <>
      <Navbar />
      <main>
        <section className="pb-20 pt-16 md:pb-28 md:pt-24">
          <Container className="!max-w-[1480px] md:!px-8">
            {/* Header — levo poravnat, editorial */}
            <Reveal>
              <div className="grid gap-6 md:grid-cols-12 md:items-end">
                <div className="md:col-span-7">
                  <span className="eyebrow">Ponude</span>
                  <h1 className="display-2 mt-4 max-w-[16ch]">
                    Izaberite paket i{" "}
                    <em className="serif-italic">prilagodite</em> ga
                  </h1>
                </div>
                <div className="md:col-span-5 md:pb-2">
                  <p className="lead max-w-md text-[15px] leading-relaxed md:ml-auto">
                    Cene su orijentacione. Nakon što pošaljete detalje (datum,
                    lokacija, trajanje), javimo se sa preciznom ponudom i
                    raspoloživošću.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Konfigurator */}
            <Reveal delay={120}>
              <div className="mt-14 border-t border-[var(--border)] pt-12 md:mt-20 md:pt-14">
                <PricingConfigurator initialPlan={plan} initialType={initialType} />
              </div>
            </Reveal>
          </Container>
        </section>
      </main>
      <Footer cta={false} />
    </>
  );
}

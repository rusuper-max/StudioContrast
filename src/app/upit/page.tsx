// src/app/upit/page.tsx
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import InquiryForm from "@/components/InquiryForm";
import QuickInquiry from "@/components/QuickInquiry";
import Reveal from "@/components/Reveal";
import { testimonials } from "@/data/testimonials";
import type { PlanSlug } from "@/data/packages";

export const metadata = {
  title: "Pošaljite upit | Studio Contrast",
  description:
    "Pošaljite detaljan upit: paket, dodaci, datum, lokacija i kontakt. Odgovaramo u roku od 24 časa.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchParams = {
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  location?: string;
  start?: string;
  end?: string;
  type?: string;
  message?: string;

  plan?: string;
  extraHours?: string;
  price?: string;

  secondPhotog?: string;
  thirdPhotog?: string;
  secondVideographer?: string;
  video?: string;
  video4k?: string;
  drone?: string;
  album?: string;
  express?: string;
  raw?: string;
  printOnSite?: string;
  usb?: string;
  dontPublish?: string;
};

function getStr(v: string | string[] | undefined) {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}
function toNum(v: string | undefined, def = 0) {
  const n = Number(getStr(v));
  return Number.isFinite(n) ? n : def;
}
function toBool(v: string | undefined) {
  const s = getStr(v).toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}
function normalizePlan(v: string | undefined): PlanSlug | undefined {
  const s = getStr(v);
  return (["basic", "classic", "signature"] as const).includes(s as any) ? (s as PlanSlug) : undefined;
}

const DISPLAY_PLAN_NAME: Record<PlanSlug, string> = {
  basic: "Standard",
  classic: "Premium",
  signature: "Signature",
};

/** Boje po paketu — svetla editorial paleta (samo za malu tačku/akcent) */
const PLAN_COLORS: Record<PlanSlug, { dot: string }> = {
  basic: { dot: "#9A938A" },
  classic: { dot: "#B89B5E" },
  signature: { dot: "#2B2925" },
};

function prettyLabel(key: string) {
  const k = key.toLowerCase();
  if (k === "secondphotog") return "Drugi fotograf";
  if (k === "thirdphotog") return "Treći fotograf";
  if (k === "secondvideographer") return "Dodatni kamerman";
  if (k === "video") return "Video";
  if (k === "video4k") return "4K video";
  if (k === "drone") return "Dron";
  if (k === "album") return "Album (premium)";
  if (k === "express") return "Ekspres obrada";
  if (k === "raw") return "RAW fajlovi";
  if (k === "printonsite") return "Izrada fotografija na licu mesta";
  if (k === "usb") return "USB";
  if (k === "dontpublish") return "Ne objavljuj u portfoliju / na mrežama";
  return key;
}

/** Aside pored forme — pravi utisak mladenaca ili činjenice o studiju */
function StudioAside() {
  const quote = testimonials[0] ?? null;

  return (
    <aside
      className="hidden lg:sticky lg:top-28 lg:block lg:border-l lg:border-[var(--border)] lg:pl-10"
      aria-label="O studiju"
    >
      {quote ? (
        <figure>
          <blockquote className="font-serif text-xl italic leading-relaxed text-[var(--fg)]">
            „{quote.quote}“
          </blockquote>
          <figcaption className="mt-5 meta-caps">{quote.attribution}</figcaption>
        </figure>
      ) : (
        <div>
          <p className="eyebrow">Studio Contrast</p>
          <p className="lead mt-5 text-[15px] leading-relaxed">
            Carinska 4, Užice — radimo širom Srbije i regiona.
          </p>
          <div className="mt-8 border-t border-[var(--border)] pt-6">
            <p className="meta-caps">Odgovor</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Na upite odgovaramo u roku od 24 časa.
            </p>
          </div>
          <Link href="/kontakt" className="btn-text mt-8">
            Svi kontakti
          </Link>
        </div>
      )}
    </aside>
  );
}

export default async function InquiryPage({
  searchParams: searchParamsPromise,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const searchParams = (await searchParamsPromise) ?? {};
  // Prefill iz query stringa (dolazi iz konfiguratora)
  const prefill = {
    name: getStr(searchParams.name),
    email: getStr(searchParams.email),
    phone: getStr(searchParams.phone),
    date: getStr(searchParams.date),
    location: getStr(searchParams.location),
    start: getStr(searchParams.start),
    end: getStr(searchParams.end),
    type: getStr(searchParams.type),
    message: getStr(searchParams.message),

    plan: normalizePlan(searchParams.plan),
    extraHours: toNum(searchParams.extraHours),
    priceHint: toNum(searchParams.price) || undefined,

    secondPhotog: toBool(searchParams.secondPhotog),
    thirdPhotog: toBool(searchParams.thirdPhotog),
    secondVideographer: toBool(searchParams.secondVideographer),
    video: toBool(searchParams.video),
    video4k: toBool(searchParams.video4k),
    drone: toBool(searchParams.drone),
    album: toBool(searchParams.album),
    express: toBool(searchParams.express),
    raw: toBool(searchParams.raw),
    printOnSite: toBool(searchParams.printOnSite),
    usb: toBool(searchParams.usb),
    dontPublish: toBool(searchParams.dontPublish),
  };

  const hasPlan = !!prefill.plan;

  const selectedAddons = Object.entries({
    secondPhotog: prefill.secondPhotog,
    thirdPhotog: prefill.thirdPhotog,
    secondVideographer: prefill.secondVideographer,
    video: prefill.video,
    video4k: prefill.video4k,
    drone: prefill.drone,
    album: prefill.album,
    express: prefill.express,
    raw: prefill.raw,
    printOnSite: prefill.printOnSite,
    usb: prefill.usb,
    dontPublish: prefill.dontPublish,
  })
    .filter(([, v]) => !!v)
    .map(([k]) => k);

  // link nazad na konfigurator — prenesi sve izabrano
  const backQs = new URLSearchParams();
  if (prefill.plan) backQs.set("plan", prefill.plan);
  if (prefill.type) backQs.set("type", prefill.type);
  if (prefill.extraHours) backQs.set("extraHours", String(prefill.extraHours));
  if (prefill.priceHint) backQs.set("price", String(prefill.priceHint));
  for (const key of selectedAddons) backQs.set(key, "1");
  const backToConfiguratorHref = `/ponude${backQs.toString() ? `?${backQs.toString()}` : ""}`;

  return (
    <>
      <Navbar />
      <main>
        {/* 1. Zaglavlje stranice */}
        <section className="pb-12 pt-16 md:pb-16 md:pt-24">
          <Container className="!max-w-[1480px] md:!px-8">
            <Reveal>
              <span className="eyebrow">Upit</span>
              <h1 className="display-2 mt-4 max-w-[16ch]">
                Pošaljite <em className="serif-italic">upit</em>
              </h1>
              <p className="lead mt-6 max-w-xl">
                Odgovaramo u roku od 24 časa. Ako ste došli iz konfiguratora,
                vaša podešavanja su već popunjena — dodajte još datum, lokaciju
                i kontakt.
              </p>
            </Reveal>
          </Container>
        </section>

        {/* 2. Rezime konfiguracije — samo ako postoji plan */}
        {hasPlan && prefill.plan && (
          <section className="border-t border-[var(--border)]">
            <Container className="!max-w-[1480px] md:!px-8">
              <Reveal>
                <div className="grid gap-10 py-10 md:grid-cols-12 md:gap-8 md:py-12">
                  <div className="md:col-span-4">
                    <p className="meta-caps">Odabrali ste</p>
                    <p className="mt-3 flex items-baseline gap-3 font-serif text-3xl md:text-4xl">
                      <span
                        aria-hidden
                        className="inline-block h-2 w-2 shrink-0 self-center rounded-full"
                        style={{ background: PLAN_COLORS[prefill.plan].dot }}
                      />
                      {DISPLAY_PLAN_NAME[prefill.plan]}
                      {prefill.type ? (
                        <em className="serif-italic text-2xl text-[var(--muted)] md:text-3xl">
                          {prefill.type}
                        </em>
                      ) : null}
                    </p>
                    <a href={backToConfiguratorHref} className="btn-text mt-6">
                      Vratite se na konfigurator
                    </a>
                  </div>

                  <div className="border-t border-[var(--border)] pt-8 md:col-span-3 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                    <p className="meta-caps">Orijentaciona cena</p>
                    <p className="mt-3 font-serif text-3xl md:text-4xl">
                      {prefill.priceHint ? `${prefill.priceHint.toLocaleString("sr-RS")} €` : "—"}
                    </p>
                    {!!prefill.extraHours && (
                      <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                        + {prefill.extraHours}h posle ponoći (obračun se vrši po ceni
                        iz konfiguratora)
                      </p>
                    )}
                  </div>

                  <div className="border-t border-[var(--border)] pt-8 md:col-span-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                    <p className="meta-caps">Dodatne opcije</p>
                    {selectedAddons.length === 0 ? (
                      <p className="mt-3 text-sm text-[var(--muted)]">Bez dodatnih opcija</p>
                    ) : (
                      <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                        {selectedAddons.map((k) => (
                          <li key={k} className="flex items-baseline gap-2.5">
                            <span
                              aria-hidden
                              className="inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--accent-strong)]"
                            />
                            {prettyLabel(k)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Reveal>
            </Container>
          </section>
        )}

        {/* 3. Forma + aside */}
        <section className="border-t border-[var(--border)] pb-20 pt-14 md:pb-28 md:pt-20">
          <Container className="!max-w-[1480px] md:!px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-7">
                {hasPlan ? (
                  <Reveal>
                    <InquiryForm prefill={prefill as any} />
                  </Reveal>
                ) : (
                  <>
                    {/* Napomena: potpuna forma traži izabran paket */}
                    <Reveal>
                      <span className="eyebrow">Napomena</span>
                      <h2 className="mt-4 font-serif text-2xl md:text-3xl">
                        Niste odabrali paket
                      </h2>
                      <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
                        Potpuna forma se otključava kada u konfiguratoru izaberete
                        paket i opcije. Ako imate kratko pitanje, pošaljite brzi
                        upit ispod.
                      </p>
                      <Link href="/ponude" className="btn btn-outline mt-6">
                        Otvorite konfigurator
                      </Link>
                    </Reveal>

                    {/* Brzi upit */}
                    <Reveal>
                      <div className="mt-14 border-t border-[var(--border)] pt-12">
                        <span className="eyebrow">Brzi upit</span>
                        <h3 className="mt-4 font-serif text-2xl">
                          Provera termina — bez konfiguratora
                        </h3>
                        <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
                          Kratko pitanje ili provera termina? Pošaljite nam poruku,
                          javljamo se uskoro.
                        </p>
                        <div className="mt-10">
                          <QuickInquiry />
                        </div>
                      </div>
                    </Reveal>
                  </>
                )}
              </div>

              <Reveal delay={120} className="lg:col-span-4 lg:col-start-9">
                <StudioAside />
              </Reveal>
            </div>

            <Reveal>
              <p className="mt-16 border-t border-[var(--border)] pt-8 text-center text-xs tracking-wide text-[var(--muted)] md:mt-20">
                Radimo širom Srbije i regiona. U sezoni se termini brzo popunjavaju —
                javite se na vreme.
              </p>
            </Reveal>
          </Container>
        </section>
      </main>
      <Footer cta={false} />
    </>
  );
}

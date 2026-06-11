// src/app/upit/page.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import InquiryForm from "@/components/InquiryForm";
import QuickInquiry from "@/components/QuickInquiry";
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

export default function InquiryPage({ searchParams = {} }: { searchParams?: SearchParams }) {
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

  // jedan citat mladenaca za aside pored forme
  const quote = testimonials[0];

  return (
    <>
      <Navbar />
      <main className="section">
        <Container>
          <div className="text-center">
            <div className="kicker">Upit</div>
            <h1 className="mt-3 font-serif text-4xl md:text-5xl">Pošaljite upit</h1>
            <p className="lead mx-auto mt-4 max-w-2xl">
              Odgovorićemo u roku od 24 časa. Ako ste došli iz ponuda, vaša podešavanja su
              već popunjena — dodajte datum, lokaciju i kontakt.
            </p>
          </div>

          {/* ——— REZIME ——— (samo ako postoji plan) */}
          {hasPlan && prefill.plan && (
            <div className="card mt-10 p-5 md:p-6">
              <div className="text-sm text-[var(--muted)]">Odabrali ste</div>
              <div className="mt-1 flex items-center gap-2 text-lg font-medium text-[var(--fg)]">
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: PLAN_COLORS[prefill.plan].dot }}
                />
                {DISPLAY_PLAN_NAME[prefill.plan]}{prefill.type ? ` · ${prefill.type}` : ""}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[10px] border border-[var(--border)] p-3">
                  <div className="text-xs text-[var(--muted)]">Orijentaciona cena</div>
                  <div className="mt-1 font-serif text-2xl text-[var(--fg)]">
                    {prefill.priceHint ? `${prefill.priceHint.toLocaleString("sr-RS")} €` : "—"}
                  </div>
                  {!!prefill.extraHours && (
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      + {prefill.extraHours}h posle ponoći (obračun se vrši po ceni iz konfiguratora)
                    </div>
                  )}
                </div>

                <div className="rounded-[10px] border border-[var(--border)] p-3">
                  <div className="text-xs text-[var(--muted)]">Dodatne opcije</div>
                  {selectedAddons.length === 0 ? (
                    <div className="mt-1 text-sm text-[var(--fg)]">Bez dodatnih opcija</div>
                  ) : (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {selectedAddons.map((k) => (
                        <li
                          key={k}
                          className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-sm text-[var(--fg)]"
                          title={prettyLabel(k)}
                        >
                          {prettyLabel(k)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <a href={backToConfiguratorHref} className="link text-sm">
                  ← Vratite se na konfigurator
                </a>
              </div>
            </div>
          )}

          {/* ——— FORMA + aside citat ——— */}
          {hasPlan ? (
            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
              <InquiryForm prefill={prefill as any} />

              {/* PLACEHOLDER — zameniti pravim sadržajem */}
              <aside className="hidden lg:sticky lg:top-24 lg:block" aria-label="Utisak mladenaca">
                <figure className="card p-6">
                  <blockquote className="font-serif text-xl italic leading-relaxed text-[var(--fg)]">
                    „{quote.quote}“
                  </blockquote>
                  <figcaption className="mt-4 text-sm text-[var(--muted)]">
                    {quote.names} · {quote.location}, {quote.dateLabel}
                  </figcaption>
                </figure>
              </aside>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
              <div>
                {/* Napomena: potpuna forma traži izabran paket */}
                <div className="rounded-xl border border-[var(--accent)] bg-[var(--surface)] p-5 md:p-6">
                  <h2 className="font-serif text-xl">Niste odabrali paket</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Potpuna forma se otključava kada u konfiguratoru izaberete paket i opcije.
                    Ako imate kratko pitanje, pošaljite brzi upit ispod.
                  </p>
                  <div className="mt-4">
                    <a href="/ponude" className="btn btn-primary">Otvorite konfigurator</a>
                  </div>
                </div>

                {/* Brzi upit */}
                <div className="card mt-6 p-5 md:p-6">
                  <h3 className="font-serif text-lg">Brzi upit (bez konfiguratora)</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Kratko pitanje ili provera termina? Pošaljite nam poruku, javljamo se uskoro.
                  </p>
                  <div className="mt-4">
                    <QuickInquiry />
                  </div>
                </div>
              </div>

              {/* PLACEHOLDER — zameniti pravim sadržajem */}
              <aside className="hidden lg:sticky lg:top-24 lg:block" aria-label="Utisak mladenaca">
                <figure className="card p-6">
                  <blockquote className="font-serif text-xl italic leading-relaxed text-[var(--fg)]">
                    „{quote.quote}“
                  </blockquote>
                  <figcaption className="mt-4 text-sm text-[var(--muted)]">
                    {quote.names} · {quote.location}, {quote.dateLabel}
                  </figcaption>
                </figure>
              </aside>
            </div>
          )}

          <p className="mt-10 text-center text-xs text-[var(--muted)]">
            Radimo širom Srbije i regiona. U sezoni se termini brzo popunjavaju — javite se na vreme.
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}

// src/app/portfolio/[cat]/page.tsx
// Stranica kategorije — editorial zaglavlje (eyebrow + display naslov + lead)
// i masonry galerija prirodnih proporcija. Lightbox i flipbook ostaju.
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import FlipbookPageClient from "@/components/FlipbookPageClient";
import { notFound } from "next/navigation";
import { CAT_LABEL, isCatSlug, type CatSlug } from "@/data/portfolio";
import { listPublicImagesIn, listPortfolioCats } from "@/lib/listPublicImages";
import { altForImage } from "@/lib/alt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/* PLACEHOLDER — zameniti pravim sadržajem */
const CAT_INTRO: Record<CatSlug, string> = {
  vencanje:
    "Od jutarnjih priprema do poslednjeg plesa — pratimo vaš dan onako kako se zaista dogodio. Tiho, strpljivo i bez nameštenih scena.",
  svadbe:
    "Puna sala dragih ljudi, muzika i trenuci koji se kasnije najviše prepričavaju. Beležimo atmosferu, ne samo protokol.",
  krstenja:
    "Veliki dan za najmlađe i miran, porodični trenutak za sve ostale. Fotografišemo nenametljivo, da obred ostane obred.",
  rodjendani:
    "Torta, baloni i iskren dečji osmeh. Hvatamo radost onako kako je deca žive — u pokretu.",
  studio:
    "Portreti u kontrolisanom svetlu — parovi, porodice i pojedinci. Dovoljno vremena i mirna atmosfera da fotografija ispadne prirodna.",
  "crno-belo":
    "Kada sklonimo boju, ostanu svetlo i emocija. Izbor fotografija koje u crno-beloj verziji dobijaju novu težinu.",
};

type Props = {
  params: Promise<{ cat: string }>;
  searchParams: Promise<{ from?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { cat: raw } = await params;
  const cat = isCatSlug(raw) ? (raw as CatSlug) : null;
  const label = cat ? CAT_LABEL[cat] : null;

  return label
    ? {
        title: `${label} — Priče | Studio Contrast`,
        description: `${label}: izbor fotografija Studija Contrast. Pregledajte galeriju ili je prelistajte kao album.`,
      }
    : { title: "Priče | Studio Contrast" };
}

/* Prirodne proporcije za masonry — umesto podrazumevanog transforma
   ograničimo širinu isporuke (isti Cloudinary tok, samo drugi parametri). */
const naturalThumb = (src: string) =>
  src.replace("/upload/f_auto,q_auto,dpr_auto/", "/upload/f_auto,q_auto,c_limit,w_1100/");

export default async function CategoryStoryPage({ params, searchParams }: Props) {
  const { cat: raw } = await params;
  if (!isCatSlug(raw)) return notFound();
  const cat = raw as CatSlug;
  const label = CAT_LABEL[cat];

  const gridItems = listPublicImagesIn(cat).map((it, i) => ({
    src: naturalThumb(it.src),
    alt: altForImage(it.src, label, i),
  }));
  if (!gridItems.length) return notFound();

  const flipItems = listPublicImagesIn(cat, { transform: "flipbook" }).map((it, i) => ({
    src: it.src,
    alt: altForImage(it.src, label, i),
  }));
  const lightboxItems = listPublicImagesIn(cat).map((it, i) => ({
    src: it.src,
    alt: altForImage(it.src, label, i),
  }));

  const fromHome = (await searchParams)?.from === "home";
  const homeHref = fromHome ? "/?restore=1" : "/";

  // Sledeća kategorija — tihi editorial tok kroz portfolio
  const order = listPortfolioCats();
  const nextCat = order[(order.indexOf(cat) + 1) % order.length];

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Priče", item: `${SITE_URL}/portfolio` },
      { "@type": "ListItem", position: 3, name: label, item: `${SITE_URL}/portfolio/${cat}` },
    ],
  };

  return (
    <>
      <Navbar />
      <main>
        <section className="pb-20 pt-14 md:pb-28 md:pt-20">
          <Container className="!max-w-[1480px] md:!px-8">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />

            <Reveal>
              <nav aria-label="Putanja" className="meta-caps">
                <Link href={homeHref} className="link">Početna</Link>
                <span aria-hidden="true" className="mx-2 text-[var(--border-strong)]">/</span>
                <Link href="/portfolio" className="link">Priče</Link>
                <span aria-hidden="true" className="mx-2 text-[var(--border-strong)]">/</span>
                <span aria-current="page" className="text-[var(--fg)]">{label}</span>
              </nav>

              {/* Editorial zaglavlje: naslov levo, uvod desno */}
              <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end">
                <div className="md:col-span-7">
                  <span className="eyebrow">Priče</span>
                  <h1 className="display-2 mt-4">
                    <em className="serif-italic">{label}</em>
                  </h1>
                </div>
                <div className="md:col-span-5 md:pb-2">
                  <p className="lead max-w-md leading-relaxed md:ml-auto">
                    {CAT_INTRO[cat]}
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="mt-12 md:mt-16">
              <FlipbookPageClient
                gridItems={gridItems}
                flipItems={flipItems}
                lightboxItems={lightboxItems}
                label={label}
              />
            </div>

            {/* Tihi tok dalje — nazad na indeks ili sledeća kategorija */}
            <Reveal>
              <div className="mt-16 flex flex-wrap items-baseline justify-between gap-6 border-t border-[var(--border)] pt-8 md:mt-24 md:pt-10">
                <Link href="/portfolio" className="btn-text">
                  ← Sve priče
                </Link>
                <Link href={`/portfolio/${nextCat}`} className="btn-text">
                  Sledeća priča: {CAT_LABEL[nextCat]} →
                </Link>
              </div>
            </Reveal>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

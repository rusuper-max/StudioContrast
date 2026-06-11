import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Link from "next/link";
import FlipbookPageClient from "@/components/FlipbookPageClient";
import { notFound } from "next/navigation";
import { CAT_LABEL, isCatSlug, type CatSlug } from "@/data/portfolio";
import { listPublicImagesIn } from "@/lib/listPublicImages";
import { altForImage, photoCountLabel } from "@/lib/alt";

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

type Props = { params: { cat: string }, searchParams: { from?: string } };

export function generateMetadata({ params }: Props) {
  const raw = params.cat;
  const cat = isCatSlug(raw) ? (raw as CatSlug) : null;
  const label = cat ? CAT_LABEL[cat] : null;

  return label
    ? {
        title: `${label} — Priče | Studio Contrast`,
        description: `${label}: izbor fotografija Studija Contrast. Pregledajte galeriju ili je prelistajte kao album.`,
      }
    : { title: "Priče | Studio Contrast" };
}

export default function CategoryStoryPage({ params, searchParams }: Props) {
  const raw = params.cat;
  if (!isCatSlug(raw)) return notFound();
  const cat = raw as CatSlug;
  const label = CAT_LABEL[cat];

  const gridItems = listPublicImagesIn(cat, { transform: "card" }).map((it, i) => ({
    src: it.src,
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

  const fromHome = searchParams?.from === "home";
  const homeHref = fromHome ? "/?restore=1" : "/";

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
      <main className="section">
        <Container>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
          />

          <nav aria-label="Putanja" className="text-sm text-[var(--muted)]">
            <Link href={homeHref} className="link">Početna</Link>
            <span aria-hidden="true" className="mx-2 text-[var(--border-strong)]">/</span>
            <Link href="/portfolio" className="link">Priče</Link>
            <span aria-hidden="true" className="mx-2 text-[var(--border-strong)]">/</span>
            <span aria-current="page" className="text-[var(--fg)]">{label}</span>
          </nav>

          <div className="mt-6 max-w-2xl">
            <h1>{label}</h1>
            <p className="lead mt-4">{CAT_INTRO[cat]}</p>
            <p className="mt-3 text-sm text-[var(--muted)]">{photoCountLabel(gridItems.length)}</p>
          </div>

          <div className="mt-10">
            <FlipbookPageClient
              gridItems={gridItems}
              flipItems={flipItems}
              lightboxItems={lightboxItems}
              label={label}
            />
          </div>

          <div className="divider mt-16 pt-12 text-center md:mt-24">
            <p className="mx-auto max-w-xl font-serif text-2xl md:text-3xl">
              Zamišljate ovakve fotografije sa svog slavlja?
            </p>
            <Link href="/kontakt" className="btn btn-primary mt-6">
              Proverite svoj datum
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

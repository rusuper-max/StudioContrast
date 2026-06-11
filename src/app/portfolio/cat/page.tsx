import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Link from "next/link";
import FlipbookPageClient from "@/components/FlipbookPageClient";
import { notFound } from "next/navigation";
import { CAT_LABEL, type CatSlug } from "@/data/portfolio";
import { listPublicImagesIn } from "@/lib/listPublicImages";
import { altForImage } from "@/lib/alt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: { cat: CatSlug }, searchParams: { from?: string } };

export function generateMetadata({ params }: Props) {
  const label = CAT_LABEL[params.cat];
  if (!label) return { title: "Priče | Studio Contrast" };
  return {
    title: `${label} — Priče | Studio Contrast`,
    description: `${label}: izbor fotografija Studija Contrast.`,
  };
}

export default function CategoryAlbumPage({ params }: Props) {
  const cat = params.cat;
  const label = CAT_LABEL[cat];
  if (!label) return notFound();

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

  return (
    <>
      <Navbar />
      <main className="section">
        <Container>
          <nav aria-label="Putanja" className="text-sm text-[var(--muted)]">
            <Link href="/portfolio" className="link">Priče</Link>
            <span aria-hidden="true" className="mx-2 text-[var(--border-strong)]">/</span>
            <span aria-current="page" className="text-[var(--fg)]">{label}</span>
          </nav>

          <h1 className="mt-6">{label}</h1>

          <div className="mt-10">
            <FlipbookPageClient
              gridItems={gridItems}
              flipItems={flipItems}
              lightboxItems={lightboxItems}
              label={label}
            />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

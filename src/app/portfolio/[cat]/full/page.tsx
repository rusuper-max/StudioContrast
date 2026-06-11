import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Link from "next/link";
import GalleryGrid from "@/components/GalleryGrid";
import { notFound } from "next/navigation";
import { CAT_LABEL, isCatSlug, type CatSlug } from "@/data/portfolio";
import { listPublicImagesIn } from "@/lib/listPublicImages";
import { altForImage } from "@/lib/alt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: { cat: string }, searchParams: { from?: string } };

export function generateMetadata({ params }: Props) {
  const cat = isCatSlug(params.cat) ? (params.cat as CatSlug) : null;
  const label = cat ? CAT_LABEL[cat] : null;
  return label
    ? {
        title: `${label} — sve fotografije | Studio Contrast`,
        description: `${label}: sve fotografije iz kategorije, sa uvećanim prikazom.`,
      }
    : { title: "Priče | Studio Contrast" };
}

export default function FullCategoryPage({ params, searchParams }: Props) {
  if (!isCatSlug(params.cat)) return notFound();
  const cat = params.cat as CatSlug;
  const label = CAT_LABEL[cat];

  const items = listPublicImagesIn(cat).map((it, i) => ({
    src: it.src,
    alt: altForImage(it.src, label, i),
  }));
  if (!items.length) return notFound();

  const fromHome = searchParams?.from === "home";
  const backToStory = `/portfolio/${cat}${fromHome ? "?from=home" : ""}`;

  return (
    <>
      <Navbar />
      <main className="section">
        <Container>
          <nav aria-label="Putanja" className="text-sm text-[var(--muted)]">
            <Link href="/portfolio" className="link">Priče</Link>
            <span aria-hidden="true" className="mx-2 text-[var(--border-strong)]">/</span>
            <Link href={backToStory} className="link">{label}</Link>
            <span aria-hidden="true" className="mx-2 text-[var(--border-strong)]">/</span>
            <span aria-current="page" className="text-[var(--fg)]">Sve fotografije</span>
          </nav>

          <h1 className="mt-6 font-serif text-3xl md:text-5xl">{label} — sve fotografije</h1>
          <p className="lead mt-3 max-w-2xl">
            Kliknite na fotografiju za uvećan prikaz. U pregledu koristite strelice na tastaturi
            ili ESC za izlaz.
          </p>

          <div className="mt-8">
            <GalleryGrid items={items} />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

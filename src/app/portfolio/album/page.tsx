import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AlbumClient from "@/components/AlbumClient";

// Pomoćni prikaz albuma bez sopstvenog sadržaja — nije ulazna stranica
// iz pretrage i ne sme da se takmiči sa /portfolio.
export const metadata = {
  title: "Album",
  robots: { index: false, follow: true },
  alternates: { canonical: "/portfolio" },
};

export default function AlbumPage() {
  return (
    <>
      <Navbar />
      <AlbumClient />
      <Footer />
    </>
  );
}
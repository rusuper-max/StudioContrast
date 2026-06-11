import type { Metadata } from "next";
import "./globals.css";
import TurnstileLoader from "@/components/TurnstileLoader";
import { playfair, inter } from "@/lib/fonts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "Studio Contrast";
const ICON_VER = "20251024b";

const SITE_DESCRIPTION =
  "Fotografija i film venčanja — Užice, Zlatibor i cela Srbija. Prirodni trenuci i istinite emocije.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  keywords: [
    "fotografisanje Užice",
    "fotograf Užice",
    "wedding photographer Serbia",
    "portraits Zlatibor",
    "fotograf Srbija",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: `/icon.png?v=${ICON_VER}`, type: "image/png", sizes: "any" }],
    shortcut: [{ url: `/icon.png?v=${ICON_VER}` }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/og.jpg`,
    description:
      "Fotografija i film venčanja — prirodni trenuci i istinite emocije. Užice, Zlatibor i cela Srbija.",
    areaServed: ["Užice", "Zlatibor", "Srbija", "Serbia"],
    priceRange: "€€",
    // PLACEHOLDER — telephone: dodati pravi broj telefona studija, npr. "+381 6x xxx xxxx"
    address: {
      "@type": "PostalAddress",
      streetAddress: "Carinska 4",
      addressCountry: "RS",
      addressLocality: "Užice",
      postalCode: "31000",
    },
    sameAs: [],
  };

  return (
    <html lang="sr" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <link rel="icon" href={`/icon.png?v=${ICON_VER}`} sizes="any" type="image/png" />
        <link rel="shortcut icon" href={`/icon.png?v=${ICON_VER}`} />
      </head>
      <body>
        {/* Učita Turnstile skriptu jednom, globalno */}
        <TurnstileLoader />
        {children}
      </body>
    </html>
  );
}

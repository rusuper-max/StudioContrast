import type { Metadata } from "next";
import "./globals.css";
import TurnstileLoader from "@/components/TurnstileLoader";
import { fraunces, sans } from "@/lib/fonts";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL, siteJsonLd } from "@/lib/seo";

const ICON_VER = "20251024b";

/** Naslov početne — root segment ne primenjuje sopstveni template,
 *  pa ovde stoji pun naslov sa lokalnim ključnim rečima. */
const HOME_TITLE = "Svadbeni fotograf Užice i Zlatibor | Studio Contrast";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: `${SITE_URL}/onama` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Fotografija",
  keywords: [
    "svadbeni fotograf Užice",
    "fotograf Užice",
    "fotograf Zlatibor",
    "snimanje venčanja",
    "fotografisanje venčanja Srbija",
    "foto i video studio Užice",
  ],
  openGraph: {
    type: "website",
    locale: "sr_RS",
    url: `${SITE_URL}/`,
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Fotografski sajt — velike sličice u Google Images/Discover su ključne.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: `/icon.png?v=${ICON_VER}`, type: "image/png", sizes: "any" }],
    shortcut: [{ url: `/icon.png?v=${ICON_VER}` }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = siteJsonLd();

  return (
    // data-scroll-behavior: Next 15 traži eksplicitnu potvrdu za
    // `scroll-behavior:smooth` na <html> (inače upozorenje u konzoli).
    <html
      // sr-Latn-RS: sajt je na srpskom, latiničnim pismom — precizniji
      // signal za Google od golog "sr" (koje ne razlikuje ćirilicu/latinicu).
      lang="sr-Latn-RS"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${sans.variable}`}
    >
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

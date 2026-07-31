// src/lib/seo.ts
// Jedinstven izvor istine za SEO: kanonski domen, NAP podaci studija,
// pomoćne funkcije za per-stranicu metapodatke i JSON-LD graf.
//
// VAŽNO: ovde smeju da stoje samo podaci koji stvarno postoje na sajtu
// (kontakt stranica, footer, o nama). Bez izmišljenih ocena, nagrada i cena.

import type { Metadata } from "next";

/** Kanonski domen. Fallback je produkcija — nikada localhost,
 *  da nedostajuća env promenljiva ne procuri u canonical/OG tagove. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://studiocontrast.rs"
).replace(/\/+$/, "");

export const SITE_NAME = "Studio Contrast";

export const SITE_DESCRIPTION =
  "Fotografisanje i snimanje venčanja u Užicu, na Zlatiboru i širom Srbije. Prirodni kadrovi bez nameštanja — 10+ godina iskustva i preko 300 zabeleženih događaja.";

/** NAP (Name–Address–Phone) — izvor: /kontakt i footer. */
export const STUDIO = {
  street: "Carinska 4",
  city: "Užice",
  postalCode: "31000",
  country: "RS",
  lat: 43.861671,
  lng: 19.858566,
  email: "studio.contrast031@gmail.com",
  phones: ["+381659869105", "+381628068268"],
  instagram: "https://www.instagram.com/studio_contrast_031/",
  /** Radno vreme sa /kontakt: Pon–sub 10–18h */
  opens: "10:00",
  closes: "18:00",
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
} as const;

/** Apsolutni URL iz putanje ("/faq" → "https://studiocontrast.rs/faq"). */
export const absUrl = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`.replace(/\/$/, "") || SITE_URL;

export const OG_IMAGE = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "Studio Contrast — fotografija i film venčanja, Užice i Zlatibor",
};

type PageMetaInput = {
  /** Bez brenda — šablon iz root layout-a dodaje " | Studio Contrast". */
  title: string;
  description: string;
  /** Putanja za canonical, npr. "/portfolio/vencanje". */
  path: string;
  /** Pun naslov za OpenGraph (društvene mreže ne primenjuju šablon). */
  ogTitle?: string;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  robots?: Metadata["robots"];
};

/**
 * Gradi kompletne metapodatke za jednu stranicu: canonical + OpenGraph +
 * Twitter card. Bez ovoga stranice nasleđuju canonical "/" iz root layout-a
 * i sve pokazuju na početnu.
 */
export function pageMeta({
  title,
  description,
  path,
  ogTitle,
  images,
  robots,
}: PageMetaInput): Metadata {
  const url = absUrl(path);
  const fullTitle = ogTitle ?? `${title} | ${SITE_NAME}`;
  const ogImages = images ?? [OG_IMAGE];

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "sr_RS",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ogImages.map((i) => i.url),
    },
    ...(robots ? { robots } : null),
  };
}

/* ------------------------------------------------------------------ *
 * JSON-LD graf — LocalBusiness + WebSite, povezani preko @id.
 * ------------------------------------------------------------------ */

export const STUDIO_ID = `${SITE_URL}/#studio`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Usluge koje studio stvarno nudi (odgovaraju kategorijama portfolija). */
const SERVICES = [
  "Fotografisanje venčanja",
  "Snimanje venčanja (video)",
  "Fotografisanje svadbi i proslava",
  "Fotografisanje krštenja",
  "Fotografisanje rođendana",
  "Studijski portreti",
];

export function siteJsonLd() {
  const studio = {
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": STUDIO_ID,
    name: SITE_NAME,
    alternateName: "Studio Contrast Užice",
    url: `${SITE_URL}/`,
    image: absUrl(OG_IMAGE.url),
    logo: absUrl("/icon.png"),
    description:
      "Foto i video studio iz Užica. Fotografišemo i snimamo venčanja, svadbe, krštenja, rođendane i studijske portrete — u Užicu, na Zlatiboru i širom Srbije.",
    slogan: "Priče koje ostaju zauvek.",
    email: STUDIO.email,
    telephone: STUDIO.phones[0],
    address: {
      "@type": "PostalAddress",
      streetAddress: STUDIO.street,
      addressLocality: STUDIO.city,
      postalCode: STUDIO.postalCode,
      addressRegion: "Zlatiborski okrug",
      addressCountry: STUDIO.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: STUDIO.lat,
      longitude: STUDIO.lng,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${STUDIO.lat},${STUDIO.lng}`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [...STUDIO.days],
        opens: STUDIO.opens,
        closes: STUDIO.closes,
      },
    ],
    areaServed: [
      { "@type": "City", name: "Užice" },
      { "@type": "Place", name: "Zlatibor" },
      { "@type": "AdministrativeArea", name: "Zlatiborski okrug" },
      { "@type": "Country", name: "Srbija" },
    ],
    knowsLanguage: ["sr", "sr-RS"],
    priceRange: "€€",
    currenciesAccepted: "RSD, EUR",
    contactPoint: STUDIO.phones.map((tel) => ({
      "@type": "ContactPoint",
      telephone: tel,
      contactType: "customer service",
      email: STUDIO.email,
      areaServed: "RS",
      availableLanguage: ["sr", "Serbian"],
    })),
    sameAs: [STUDIO.instagram],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Usluge fotografisanja i snimanja",
      itemListElement: SERVICES.map((name) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name, serviceType: name },
      })),
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "sr-RS",
    publisher: { "@id": STUDIO_ID },
  };

  return { "@context": "https://schema.org", "@graph": [studio, website] };
}

/** BreadcrumbList helper — [{name, path}] redom od početne. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: absUrl(t.path),
    })),
  };
}

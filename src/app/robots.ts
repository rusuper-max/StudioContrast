// src/app/robots.ts
import type { MetadataRoute } from "next";
import { absUrl, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin, API i privatne klijentske galerije ne idu u indeks.
      // (/portfolio/album i /portfolio/*/full nisu ovde namerno — imaju
      //  noindex u <head>, a robot mora da ih poseti da bi ga video.)
      disallow: ["/admin", "/api/", "/g/"],
    },
    sitemap: absUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}

// src/app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://studio-contrast.rs";
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/ponude`, lastModified: new Date() },
    { url: `${base}/portfolio`, lastModified: new Date() },
    { url: `${base}/onama`, lastModified: new Date() },
    { url: `${base}/faq`, lastModified: new Date() },
    { url: `${base}/upit`, lastModified: new Date() },
    { url: `${base}/kontakt`, lastModified: new Date() },
  ];
}

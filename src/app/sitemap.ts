// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/seo";
import { CAT_ORDER } from "@/data/portfolio";

export default function sitemap(): MetadataRoute.Sitemap {
  // Sadržaj se menja retko i ručno — jedan datum izmene za ceo sajt je
  // iskreniji signal od new Date() koji bi svaki crawl prikazao kao "sveže".
  const lastModified = new Date("2026-07-31");

  const pages: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1.0, changeFrequency: "monthly" },
    { path: "/portfolio", priority: 0.9, changeFrequency: "monthly" },
    ...CAT_ORDER.map((cat) => ({
      path: `/portfolio/${cat}`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
    { path: "/ponude", priority: 0.9, changeFrequency: "monthly" },
    { path: "/onama", priority: 0.7, changeFrequency: "yearly" },
    { path: "/faq", priority: 0.6, changeFrequency: "yearly" },
    { path: "/kontakt", priority: 0.7, changeFrequency: "yearly" },
    { path: "/upit", priority: 0.5, changeFrequency: "yearly" },
  ];

  return pages.map((p) => ({
    url: absUrl(p.path),
    lastModified,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}

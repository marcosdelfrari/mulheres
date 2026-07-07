import type { MetadataRoute } from "next";
import { companions } from "@/lib/mock-data";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/minas-gerais/belo-horizonte"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/catalogo"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/catalogo?region=Minas%20Gerais"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/contato"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const profilePages: MetadataRoute.Sitemap = companions.map((c) => ({
    url: absoluteUrl(`/acompanhante/${c.id}`),
    lastModified: new Date(c.publishedAt),
    changeFrequency: "weekly" as const,
    priority: c.city === "Belo Horizonte" ? 0.8 : 0.6,
  }));

  return [...staticPages, ...profilePages];
}

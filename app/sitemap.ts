import type { MetadataRoute } from "next";
import { buildCompanionSlug } from "@/lib/companion-utils";
import {
  CITY_HUBS,
  cityHubPath,
  getNeighborhoodCompanions,
  neighborhoodHubPath,
} from "@/lib/location-hubs";
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
      url: absoluteUrl("/guias/como-funciona"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/guias/alternativas-em-bh"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/contato"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/privacidade"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/termos"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/mais-de-18"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const cityPages: MetadataRoute.Sitemap = CITY_HUBS.map((hub) => ({
    url: absoluteUrl(cityHubPath(hub)),
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: hub.city === "Belo Horizonte" ? 0.95 : 0.75,
  }));

  const neighborhoodPages: MetadataRoute.Sitemap = CITY_HUBS.flatMap((hub) =>
    hub.neighborhoods
      .filter((n) => getNeighborhoodCompanions(hub.city, n.name).length >= 1)
      .map((n) => ({
        url: absoluteUrl(neighborhoodHubPath(hub, n)),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.85,
      })),
  );

  const profilePages: MetadataRoute.Sitemap = companions
    .filter((c) => c.verified)
    .map((c) => ({
      url: absoluteUrl(`/acompanhante/${buildCompanionSlug(c)}`),
      lastModified: new Date(c.publishedAt),
      changeFrequency: "weekly" as const,
      priority: c.city === "Belo Horizonte" ? 0.7 : 0.55,
    }));

  return [
    ...staticPages,
    ...cityPages,
    ...neighborhoodPages,
    ...profilePages,
  ];
}

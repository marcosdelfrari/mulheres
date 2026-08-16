import { Suspense } from "react";
import { CatalogInteractive } from "@/components/CatalogInteractive";
import { JsonLd } from "@/components/JsonLd";
import {
  filterCompanions,
  getCatalogHeading,
  parseCatalogSearchParams,
} from "@/lib/catalog-filter";
import { getPublishedCompanions } from "@/lib/listings";
import {
  absoluteUrl,
  buildCatalogMetadata,
  buildCollectionPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams;
  return buildCatalogMetadata({
    region: typeof params.region === "string" ? params.region : undefined,
    search: typeof params.search === "string" ? params.search : undefined,
    city: typeof params.city === "string" ? params.city : undefined,
    neighborhood:
      typeof params.neighborhood === "string" ? params.neighborhood : undefined,
  });
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseCatalogSearchParams(params);
  const companions = await getPublishedCompanions();
  const items = filterCompanions(companions, filters);
  const heading = getCatalogHeading(filters);
  const canonicalPath = (() => {
    const qs = new URLSearchParams();
    if (filters.region !== "all") qs.set("region", filters.region);
    if (filters.search) qs.set("search", filters.search);
    if (filters.city) qs.set("city", filters.city);
    if (filters.neighborhood !== "all")
      qs.set("neighborhood", filters.neighborhood);
    const q = qs.toString();
    return q ? `/catalogo?${q}` : "/catalogo";
  })();

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: heading.title,
          description: heading.description,
          url: absoluteUrl(canonicalPath),
          companions: items.map((i) => i.companion),
        })}
      />

      <div
        id="catalogo"
        className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6"
      >
        <header>
          <h1 className="font-serif text-2xl font-bold italic tracking-tight text-gray-900 sm:text-3xl">
            {heading.title}
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-gray-600">
            {heading.description}
          </p>
        </header>

        <Suspense>
          <CatalogInteractive
            initialFilters={filters}
            companions={companions}
          />
        </Suspense>
      </div>
    </>
  );
}

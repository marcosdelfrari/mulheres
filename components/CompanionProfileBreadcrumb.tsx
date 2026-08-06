import Link from "next/link";
import type { Companion } from "@/lib/types";
import { CITY_HUBS, cityHubPath, neighborhoodHubPath } from "@/lib/location-hubs";

interface BreadcrumbItem {
  label: string;
  href: string;
}

function buildBreadcrumb(companion: Companion): BreadcrumbItem[] {
  const cityHub = CITY_HUBS.find(
    (h) => h.region === companion.region && h.city === companion.city,
  );

  const neighborhood = cityHub?.neighborhoods.find(
    (n) => n.name.toLowerCase() === companion.neighborhood.toLowerCase(),
  );

  const items: BreadcrumbItem[] = [
    { label: "Início", href: "/" },
    { label: "Catálogo", href: "/catalogo" },
  ];

  const citySameAsRegion =
    companion.city.trim().toLowerCase() === companion.region.trim().toLowerCase();

  if (!citySameAsRegion) {
    items.push({
      label: companion.region,
      href: `/catalogo?region=${encodeURIComponent(companion.region)}`,
    });
  }

  items.push({
    label: companion.city,
    href: cityHub
      ? cityHubPath(cityHub)
      : `/catalogo?region=${encodeURIComponent(companion.region)}&search=${encodeURIComponent(companion.city)}`,
  });

  if (companion.neighborhood) {
    const hoodHref =
      cityHub && neighborhood
        ? neighborhoodHubPath(cityHub, neighborhood)
        : `/catalogo?region=${encodeURIComponent(companion.region)}&city=${encodeURIComponent(companion.city)}&neighborhood=${encodeURIComponent(companion.neighborhood)}`;

    items.push({
      label: companion.neighborhood,
      href: hoodHref,
    });
  }

  return items;
}

function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface CompanionProfileBreadcrumbProps {
  companion: Companion;
}

export function CompanionProfileBreadcrumb({
  companion,
}: CompanionProfileBreadcrumbProps) {
  const items = buildBreadcrumb(companion);
  const verifiedDate = companion.verifiedAt
    ? formatShortDate(companion.verifiedAt)
    : null;

  return (
    <div className="space-y-3 border-b border-gray-100 pb-4">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar
        </Link>

        <p className="truncate text-xs text-gray-400">
          {formatShortDate(companion.publishedAt)}
          {verifiedDate ? ` · verificado ${verifiedDate}` : ""}
        </p>
      </div>

      <nav aria-label="Breadcrumb" className="overflow-x-auto">
        <ol className="flex min-w-0 items-center gap-1.5 text-sm text-gray-500">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.href}-${item.label}`} className="flex min-w-0 items-center gap-1.5">
                {index > 0 && (
                  <span className="shrink-0 text-gray-300" aria-hidden>
                    /
                  </span>
                )}
                {isLast ? (
                  <span className="truncate font-medium text-gray-800">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="shrink-0 transition-colors hover:text-luxury-accent"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

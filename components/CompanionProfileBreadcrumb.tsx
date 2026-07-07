import Link from "next/link";
import type { Companion } from "@/lib/types";

const MONTHS = [
  "JANEIRO",
  "FEVEREIRO",
  "MARÇO",
  "ABRIL",
  "MAIO",
  "JUNHO",
  "JULHO",
  "AGOSTO",
  "SETEMBRO",
  "OUTUBRO",
  "NOVEMBRO",
  "DEZEMBRO",
];

function formatAdDate(isoDate: string): string {
  const date = new Date(isoDate);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function buildBreadcrumb(companion: Companion): BreadcrumbItem[] {
  const regionParam = encodeURIComponent(companion.region);
  const cityParam = encodeURIComponent(companion.city);
  const neighborhoodParam = encodeURIComponent(companion.neighborhood);

  return [
    { label: "Mulheres", href: "/" },
    { label: "Acompanhantes", href: "/catalogo" },
    {
      label: `Acompanhantes ${companion.region}`,
      href: `/catalogo?region=${regionParam}`,
    },
    {
      label: `Acompanhantes ${companion.city}`,
      href: `/catalogo?region=${regionParam}&search=${cityParam}`,
    },
    {
      label: `Acompanhantes ${companion.neighborhood}`,
      href: `/catalogo?region=${regionParam}&search=${neighborhoodParam}`,
    },
  ];
}

interface CompanionProfileBreadcrumbProps {
  companion: Companion;
}

export function CompanionProfileBreadcrumb({
  companion,
}: CompanionProfileBreadcrumbProps) {
  const items = buildBreadcrumb(companion);

  return (
    <div className="space-y-3">
      <Link
        href="/catalogo"
        className="text-base font-medium text-purple-700 hover:text-purple-900"
      >
        &lt; Voltar para a pesquisa
      </Link>

      <nav aria-label="Breadcrumb" className="text-sm leading-relaxed text-purple-700">
        {items.map((item, index) => (
          <span key={item.label}>
            {index > 0 && <span className="text-gray-400"> / </span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-purple-900">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        ))}
      </nav>

      <p className="text-sm text-gray-600">
        <span className="font-bold text-gray-900">
          {formatAdDate(companion.publishedAt)}
        </span>
        <span> — Id anúncio: {companion.adId}</span>
      </p>
    </div>
  );
}

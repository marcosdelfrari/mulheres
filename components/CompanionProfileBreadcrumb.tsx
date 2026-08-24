import Link from "next/link";
import type { Companion } from "@/lib/types";
import { buildCompanionBreadcrumb } from "@/lib/companion-breadcrumb";

/** No mobile: Início / … / penúltimo / último — evita truncar no meio. */
function compactForMobile(
  items: ReturnType<typeof buildCompanionBreadcrumb>,
) {
  if (items.length <= 3) return items;
  return [
    items[0]!,
    { label: "…", href: "" },
    items[items.length - 2]!,
    items[items.length - 1]!,
  ];
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
  const items = buildCompanionBreadcrumb(companion);
  const mobileItems = compactForMobile(items);
  const verifiedDate = companion.verifiedAt
    ? formatShortDate(companion.verifiedAt)
    : null;

  return (
    <div className="space-y-3 border-b border-gray-100 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <Link
          href="/acompanhantes"
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

        <p className="text-xs text-gray-400">
          {formatShortDate(companion.publishedAt)}
          {verifiedDate ? ` · verificado ${verifiedDate}` : ""}
        </p>
      </div>

      <nav aria-label="Breadcrumb">
        {/* Mobile compacto */}
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-gray-500 sm:hidden">
          {mobileItems.map((item, index) => {
            const isLast = index === mobileItems.length - 1;
            const isEllipsis = item.label === "…" && !item.href;
            return (
              <li
                key={`m-${item.href}-${item.label}-${index}`}
                className="flex items-center gap-1"
              >
                {index > 0 && (
                  <span className="text-gray-300" aria-hidden>
                    /
                  </span>
                )}
                {isEllipsis ? (
                  <span className="text-gray-400" aria-hidden>
                    …
                  </span>
                ) : isLast ? (
                  <span className="font-medium text-gray-800">{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-luxury-accent"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        {/* Desktop completo */}
        <ol className="hidden flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-gray-500 sm:flex">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li
                key={`d-${item.href}-${item.label}`}
                className="flex items-center gap-1.5"
              >
                {index > 0 && (
                  <span className="text-gray-300" aria-hidden>
                    /
                  </span>
                )}
                {isLast ? (
                  <span className="font-medium text-gray-800">{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-luxury-accent"
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

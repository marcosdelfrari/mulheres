import { CompanionCard } from "@/components/CompanionCard";
import { SponsoredSection } from "@/components/SponsoredSection";
import type { Companion } from "@/lib/types";

interface CatalogGridProps {
  items: { companion: Companion; distanceKm?: number }[];
  locationMode?: "city" | "neighborhood";
}

export function CatalogGrid({ items, locationMode }: CatalogGridProps) {
  const sponsored = items.filter(({ companion }) => companion.sponsored);
  const regular = items.filter(({ companion }) => !companion.sponsored);

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-gray-100 bg-gray-50/50 py-16 text-center">
        <p className="text-xl font-bold text-gray-900">Nenhum resultado.</p>
        <p className="mt-2 text-base text-gray-500">
          Tente mudar a região ou os filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sponsored.length > 0 && (
        <SponsoredSection
          companions={sponsored.map((s) => s.companion)}
          locationMode={locationMode}
          subtitle="Perfis em destaque para esta busca."
        />
      )}

      {regular.length > 0 && (
        <div>
          {sponsored.length > 0 && (
            <h2 className="mb-4 text-lg font-light tracking-wide text-gray-900">
              Todas as acompanhantes
            </h2>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regular.map(({ companion, distanceKm }) => (
              <CompanionCard
                key={companion.id}
                companion={companion}
                distanceKm={distanceKm}
                locationMode={locationMode}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

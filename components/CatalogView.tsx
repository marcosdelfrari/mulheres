"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { companions } from "@/lib/mock-data";
import { getDistanceKm } from "@/lib/geo";
import { useUserLocation } from "@/lib/use-user-location";
import type { CatalogFilters, Region } from "@/lib/types";
import { DEFAULT_CATALOG_FILTERS } from "@/lib/types";
import { CompanionCard } from "./CompanionCard";
import { CatalogFiltersBar } from "./CatalogFilters";
import { SponsoredSection } from "./SponsoredSection";

function matchesAnySelected(selected: string[], values: string[]): boolean {
  if (selected.length === 0) return true;
  return selected.some((item) => values.includes(item));
}

export function CatalogView() {
  const searchParams = useSearchParams();
  const catalogRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<CatalogFilters>(
    DEFAULT_CATALOG_FILTERS,
  );
  const {
    location: userLocation,
    loading: locationLoading,
    error: locationError,
    requestLocation,
  } = useUserLocation();

  useEffect(() => {
    const search = searchParams.get("search");
    const region = searchParams.get("region");
    setFilters((prev) => ({
      ...prev,
      ...(search ? { search } : {}),
      ...(region && region !== "all" ? { region: region as Region } : {}),
    }));
  }, [searchParams]);

  useEffect(() => {
    if (userLocation) {
      setFilters((prev) =>
        prev.sortBy === "price-asc" ? { ...prev, sortBy: "distance" } : prev,
      );
    }
  }, [userLocation]);

  const handleRequestLocation = useCallback(() => {
    requestLocation();
    setFilters((prev) => ({ ...prev, sortBy: "distance" }));
  }, [requestLocation]);

  const filteredCompanions = useMemo(() => {
    const result = companions.filter((c) => {
      if (filters.region !== "all" && c.region !== filters.region) return false;
      if (filters.city && c.city !== filters.city) return false;
      if (
        filters.neighborhood !== "all" &&
        c.neighborhood !== filters.neighborhood
      )
        return false;
      if (filters.verifiedOnly && !c.verified) return false;
      if (filters.maxPrice && c.pricePerHour > filters.maxPrice) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const haystack =
          `${c.name} ${c.city} ${c.neighborhood} ${c.region}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (!matchesAnySelected(filters.selectedServices, c.services))
        return false;
      if (!matchesAnySelected(filters.selectedServicesFor, c.servicesFor))
        return false;
      if (!matchesAnySelected(filters.selectedLocations, c.serviceLocations))
        return false;
      return true;
    });

    const withDistance = result.map((c) => ({
      companion: c,
      distanceKm: userLocation
        ? getDistanceKm(userLocation, {
            latitude: c.latitude,
            longitude: c.longitude,
          })
        : undefined,
    }));

    withDistance.sort((a, b) => {
      switch (filters.sortBy) {
        case "distance":
          if (!userLocation) return 0;
          return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
        case "price-asc":
          return a.companion.pricePerHour - b.companion.pricePerHour;
        case "price-desc":
          return b.companion.pricePerHour - a.companion.pricePerHour;
        case "rating":
          return a.companion.pricePerHour - b.companion.pricePerHour;
        default:
          return 0;
      }
    });

    return withDistance;
  }, [filters, userLocation]);

  const sponsored = useMemo(
    () => filteredCompanions.filter(({ companion }) => companion.sponsored),
    [filteredCompanions],
  );

  const regular = useMemo(
    () => filteredCompanions.filter(({ companion }) => !companion.sponsored),
    [filteredCompanions],
  );

  const locationMode =
    filters.neighborhood !== "all"
      ? "neighborhood"
      : filters.city || filters.region !== "all"
        ? "city"
        : undefined;

  return (
    <div
      id="catalogo"
      ref={catalogRef}
      className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6"
    >
      <h1 className="font-serif text-2xl font-bold italic tracking-tight text-gray-900">
        Encontre Mulheres para o seu momento
      </h1>

      <CatalogFiltersBar
        filters={filters}
        onChange={setFilters}
        resultCount={filteredCompanions.length}
        locationEnabled={!!userLocation}
        onRequestLocation={handleRequestLocation}
        locationLoading={locationLoading}
        locationError={locationError}
      />

      {filteredCompanions.length === 0 ? (
        <div className="rounded-[2rem] border border-gray-100 bg-gray-50/50 py-16 text-center">
          <p className="text-xl font-bold text-gray-900">Nenhum resultado.</p>
          <p className="mt-2 text-base text-gray-500">
            Tente mudar a região ou os filtros.
          </p>
        </div>
      ) : (
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
                <h2 className="mb-4 font-serif text-lg font-bold italic tracking-tight text-gray-900">
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
      )}
    </div>
  );
}

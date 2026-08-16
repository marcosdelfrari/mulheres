"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  catalogFiltersToSearchParams,
  filterCompanions,
} from "@/lib/catalog-filter";
import { useUserLocation } from "@/lib/use-user-location";
import type { CatalogFilters, Companion } from "@/lib/types";
import { CatalogFiltersBar } from "./CatalogFilters";
import { CatalogGrid } from "./CatalogGrid";

interface CatalogInteractiveProps {
  initialFilters: CatalogFilters;
  companions: Companion[];
}

function urlRelevantFilters(filters: CatalogFilters) {
  return {
    region: filters.region,
    search: filters.search,
    city: filters.city,
    neighborhood: filters.neighborhood,
    verifiedOnly: filters.verifiedOnly,
  };
}

function urlFiltersEqual(a: CatalogFilters, b: CatalogFilters) {
  const keys = urlRelevantFilters(a);
  const other = urlRelevantFilters(b);
  return JSON.stringify(keys) === JSON.stringify(other);
}

export function CatalogInteractive({
  initialFilters,
  companions,
}: CatalogInteractiveProps) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);
  const {
    location: userLocation,
    loading: locationLoading,
    error: locationError,
    requestLocation,
  } = useUserLocation();

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

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

  const handleFiltersChange = useCallback(
    (next: CatalogFilters) => {
      setFilters(next);
      if (!urlFiltersEqual(next, initialFilters)) {
        const params = catalogFiltersToSearchParams(next);
        const query = params.toString();
        router.push(query ? `/catalogo?${query}` : "/catalogo");
      }
    },
    [router, initialFilters],
  );

  const items = useMemo(
    () => filterCompanions(companions, filters, userLocation),
    [companions, filters, userLocation],
  );

  const locationMode =
    filters.neighborhood !== "all"
      ? "neighborhood"
      : filters.city || filters.region !== "all"
        ? "city"
        : undefined;

  return (
    <>
      <CatalogFiltersBar
        filters={filters}
        onChange={handleFiltersChange}
        resultCount={items.length}
        locationEnabled={!!userLocation}
        onRequestLocation={handleRequestLocation}
        locationLoading={locationLoading}
        locationError={locationError}
        companions={companions}
      />

      <CatalogGrid items={items} locationMode={locationMode} />
    </>
  );
}

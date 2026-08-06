"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { CatalogFilters, Region } from "@/lib/types";
import { DEFAULT_CATALOG_FILTERS } from "@/lib/types";
import { REGIONS } from "@/lib/mock-data";
import {
  FILTER_GENDERS,
  FILTER_LOCATIONS,
  FILTER_SERVICES,
  FILTER_SERVICES_FOR,
  getCitiesByRegion,
  getNeighborhoodsByCity,
} from "@/lib/catalog-locations";

interface CatalogFiltersProps {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  resultCount: number;
  locationEnabled: boolean;
  onRequestLocation: () => void;
  locationLoading: boolean;
  locationError: string | null;
}

const MAX_PRICE = 500;

const selectClass =
  "w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-800 focus:border-purple-800 focus:outline-none focus:ring-1 focus:ring-luxury-accent/30";

function getLocationLabel(filters: CatalogFilters): string {
  if (filters.region !== "all" && filters.city) {
    return `${filters.region} - ${filters.city}`;
  }
  if (filters.region !== "all") {
    return filters.region;
  }
  if (filters.city) {
    return filters.city;
  }
  return "Brasil — Todas as regiões";
}

function hasActiveFilters(filters: CatalogFilters): boolean {
  return JSON.stringify(filters) !== JSON.stringify(DEFAULT_CATALOG_FILTERS);
}

function toggleItem(list: string[], item: string): string[] {
  return list.includes(item)
    ? list.filter((i) => i !== item)
    : [...list, item];
}

interface FilterAccordionProps {
  icon: ReactNode;
  title: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

function FilterAccordion({
  icon,
  title,
  options,
  selected,
  onChange,
}: FilterAccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 py-4 text-left"
      >
        <span className="text-purple-800">{icon}</span>
        <span className="flex-1 text-base font-medium text-gray-800">{title}</span>
        {selected.length > 0 && (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
            {selected.length}
          </span>
        )}
        <svg
          className={`h-4 w-4 text-purple-800 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {open && (
        <div className="flex flex-wrap gap-2 pb-4">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(toggleItem(selected, option))}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                selected.includes(option)
                  ? "border-[#0c0414] bg-[#0c0414] text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-luxury-accent/50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CatalogFiltersBar({
  filters,
  onChange,
  resultCount,
  locationEnabled,
  onRequestLocation,
  locationLoading,
  locationError,
}: CatalogFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CatalogFilters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const cities = useMemo(
    () => (draft.region !== "all" ? getCitiesByRegion(draft.region) : []),
    [draft.region]
  );

  const neighborhoods = useMemo(
    () =>
      draft.region !== "all" && draft.city
        ? getNeighborhoodsByCity(draft.region, draft.city)
        : [],
    [draft.region, draft.city]
  );

  const updateDraft = (partial: Partial<CatalogFilters>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const handleRegionChange = (region: Region | "all") => {
    updateDraft({ region, city: "", neighborhood: "all" });
  };

  const handleCityChange = (city: string) => {
    updateDraft({ city, neighborhood: "all" });
  };

  const applyFilters = () => {
    onChange(draft);
    if (draft.sortBy === "distance" && !locationEnabled) {
      onRequestLocation();
    }
    setOpen(false);
  };

  const clearFilters = () => {
    const cleared: CatalogFilters = {
      ...DEFAULT_CATALOG_FILTERS,
      sortBy: locationEnabled ? "distance" : "price-asc",
    };
    setDraft(cleared);
    onChange(cleared);
    setOpen(false);
  };

  return (
    <>
      <section className="space-y-2">
        <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 sm:px-5 sm:py-3.5">
          <svg className="h-5 w-5 shrink-0 text-purple-800" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
          </svg>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="min-w-0 flex-1 truncate text-left text-base font-medium text-purple-900 hover:text-purple-800 sm:text-lg"
          >
            {getLocationLabel(filters)}
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0c0414] text-white hover:bg-purple-900"
            aria-label="Abrir filtros"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500">
          <strong className="text-gray-800">{resultCount}</strong> resultado{resultCount !== 1 ? "s" : ""}
          {hasActiveFilters(filters) && <span className="ml-2 text-luxury-accent">· Filtros ativos</span>}
        </p>

        {locationEnabled && (
          <p className="text-sm font-medium text-purple-800">Distâncias calculadas a partir da sua localização.</p>
        )}

        {locationError && (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{locationError}</p>
        )}
      </section>

      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="flex h-full w-full max-w-md flex-col bg-white sm:max-h-[100vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto px-5 pt-5">
              <div className="space-y-3">
                <select
                  value={draft.category}
                  onChange={(e) => updateDraft({ category: e.target.value })}
                  className={selectClass}
                >
                  <option value="acompanhantes">Acompanhantes</option>
                </select>

                <input
                  type="text"
                  placeholder="pesquise aqui..."
                  value={draft.search}
                  onChange={(e) => updateDraft({ search: e.target.value })}
                  className={selectClass}
                />

                <select
                  value={draft.region}
                  onChange={(e) => handleRegionChange(e.target.value as Region | "all")}
                  className={selectClass}
                >
                  <option value="all">Todos os estados</option>
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>

                <select
                  value={draft.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={draft.region === "all"}
                  className={`${selectClass} disabled:bg-gray-50 disabled:text-gray-400`}
                >
                  <option value="">Todas as cidades</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                <select
                  value={draft.neighborhood}
                  onChange={(e) => updateDraft({ neighborhood: e.target.value })}
                  disabled={!draft.city}
                  className={`${selectClass} disabled:bg-gray-50 disabled:text-gray-400`}
                >
                  <option value="all">Todas as zonas</option>
                  {neighborhoods.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                <svg className="h-5 w-5 text-purple-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900">Filtros</h3>
              </div>

              <FilterAccordion
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                title="Gênero"
                options={FILTER_GENDERS}
                selected={draft.selectedGenders}
                onChange={(v) => updateDraft({ selectedGenders: v })}
              />
              <FilterAccordion
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                }
                title="Serviços"
                options={FILTER_SERVICES}
                selected={draft.selectedServices}
                onChange={(v) => updateDraft({ selectedServices: v })}
              />
              <FilterAccordion
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                title="Atende"
                options={FILTER_SERVICES_FOR}
                selected={draft.selectedServicesFor}
                onChange={(v) => updateDraft({ selectedServicesFor: v })}
              />
              <FilterAccordion
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                }
                title="Local de atendimento"
                options={FILTER_LOCATIONS}
                selected={draft.selectedLocations}
                onChange={(v) => updateDraft({ selectedLocations: v })}
              />

              <div className="space-y-4 border-t border-gray-100 py-4">
                <label className="flex items-center gap-3 text-base font-medium text-gray-800">
                  <input
                    type="checkbox"
                    checked={draft.verifiedOnly}
                    onChange={(e) => updateDraft({ verifiedOnly: e.target.checked })}
                    className="h-5 w-5 rounded text-purple-800"
                  />
                  Só verificadas
                </label>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-500">
                    Preço até: R$ {draft.maxPrice ?? MAX_PRICE}
                  </label>
                  <input
                    type="range"
                    min={150}
                    max={MAX_PRICE}
                    step={50}
                    value={draft.maxPrice ?? MAX_PRICE}
                    onChange={(e) =>
                      updateDraft({
                        maxPrice: Number(e.target.value) === MAX_PRICE ? null : Number(e.target.value),
                      })
                    }
                    className="w-full accent-luxury-accent"
                  />
                </div>

                <select
                  value={draft.sortBy}
                  onChange={(e) => updateDraft({ sortBy: e.target.value as CatalogFilters["sortBy"] })}
                  className={selectClass}
                >
                  <option value="distance" disabled={!locationEnabled}>Mais perto</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                </select>

                <button
                  type="button"
                  onClick={onRequestLocation}
                  disabled={locationLoading}
                  className={`w-full rounded-lg border px-4 py-3 text-sm font-bold ${
                    locationEnabled
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-luxury-accent/30 bg-[#faf6ef] text-purple-900"
                  }`}
                >
                  {locationLoading ? "Buscando..." : locationEnabled ? "✓ Perto de mim ativo" : "Usar minha localização"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-black uppercase tracking-wide text-purple-800 hover:text-luxury-accent"
              >
                Excluir tudo
              </button>

              <button
                type="button"
                onClick={applyFilters}
                className="flex items-center gap-2 rounded-full bg-[#0c0414] px-6 py-3 text-sm font-black uppercase tracking-wide text-white hover:bg-purple-900"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Pesquisar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

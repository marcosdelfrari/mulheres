"use client";

import { useMemo } from "react";
import { getSponsoredCompanions } from "@/lib/mock-data";
import { getDistanceKm } from "@/lib/geo";
import { useUserLocation } from "@/lib/use-user-location";
import type { Companion } from "@/lib/types";
import { SponsoredCompanionCard } from "./SponsoredCompanionCard";

interface SponsoredSectionProps {
  companions?: Companion[];
  locationMode?: "city" | "neighborhood";
  title?: string;
  subtitle?: string;
}

export function SponsoredSection({
  companions: companionsProp,
  locationMode,
  title = "Super Tops",
  subtitle = "Perfis em destaque na plataforma.",
}: SponsoredSectionProps) {
  const { location } = useUserLocation();

  const items = useMemo(() => {
    const list = companionsProp ?? getSponsoredCompanions();
    return list.map((companion) => ({
      companion,
      distanceKm: location
        ? getDistanceKm(location, {
            latitude: companion.latitude,
            longitude: companion.longitude,
          })
        : undefined,
    }));
  }, [companionsProp, location]);

  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-serif text-xl font-bold italic tracking-tight text-gray-900 sm:text-2xl">
          {title}{" "}
          <span className="text-luxury-accent">em Destaque</span>
        </h2>
        <p className="mt-1 text-sm text-gray-600 sm:text-base">{subtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map(({ companion, distanceKm }) => (
          <SponsoredCompanionCard
            key={companion.id}
            companion={companion}
            distanceKm={distanceKm}
            locationMode={locationMode}
          />
        ))}
      </div>
    </section>
  );
}

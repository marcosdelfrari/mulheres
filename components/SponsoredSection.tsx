"use client";

import { useMemo } from "react";
import { getDistanceKm } from "@/lib/geo";
import { useUserLocation } from "@/lib/use-user-location";
import type { Companion } from "@/lib/types";
import { SponsoredCompanionCard } from "./SponsoredCompanionCard";

interface SponsoredSectionProps {
  companions: Companion[];
  locationMode?: "city" | "neighborhood";
  title?: string;
  subtitle?: string;
}

export function SponsoredSection({
  companions,
  locationMode,
  title = "Super Tops",
  subtitle = "Perfis em destaque na plataforma.",
}: SponsoredSectionProps) {
  const { location } = useUserLocation();

  const items = useMemo(() => {
    return companions.map((companion) => ({
      companion,
      distanceKm: location
        ? getDistanceKm(location, {
            latitude: companion.latitude,
            longitude: companion.longitude,
          })
        : undefined,
    }));
  }, [companions, location]);

  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-light tracking-wide text-gray-900 sm:text-2xl">
          {title}{" "}
          <span className="text-luxury-accent">em Destaque</span>
        </h2>
        <p className="mt-1 text-sm font-light text-gray-600 sm:text-base">
          {subtitle}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map(({ companion, distanceKm }, index) => (
          <SponsoredCompanionCard
            key={companion.id}
            companion={companion}
            distanceKm={distanceKm}
            locationMode={locationMode}
            priority={index === 0}
          />
        ))}
      </div>
    </section>
  );
}

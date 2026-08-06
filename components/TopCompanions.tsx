"use client";

import { useMemo } from "react";
import Link from "next/link";
import { companions } from "@/lib/mock-data";
import { getDistanceKm } from "@/lib/geo";
import { useUserLocation } from "@/lib/use-user-location";
import { CompanionCard } from "./CompanionCard";
import { SponsoredSection } from "./SponsoredSection";

export function TopCompanions() {
  const { location } = useUserLocation();

  const tops = useMemo(() => {
    return companions
      .filter((c) => c.verified && !c.sponsored)
      .slice(0, 6)
      .map((companion) => ({
        companion,
        distanceKm: location
          ? getDistanceKm(location, {
              latitude: companion.latitude,
              longitude: companion.longitude,
            })
          : undefined,
      }));
  }, [location]);

  return (
    <section className="mx-auto max-w-6xl space-y-12 bg-white px-4 py-12 sm:px-6">
      <SponsoredSection />

      <div>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold italic tracking-tight text-gray-900">
              Acompanhantes <span className="text-luxury-accent">Tops</span>
            </h2>
            <p className="mt-2 text-lg font-medium text-gray-600">
              As profissionais verificadas em destaque.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="hidden text-sm font-black uppercase tracking-widest text-purple-800 hover:text-luxury-accent sm:block"
          >
            Ver todas →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tops.map(({ companion, distanceKm }) => (
            <CompanionCard
              key={companion.id}
              companion={companion}
              distanceKm={distanceKm}
            />
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/catalogo"
            className="inline-block rounded-full bg-gray-900 px-8 py-4 text-base font-bold text-white hover:bg-black"
          >
            Ver catálogo completo
          </Link>
        </div>
      </div>
    </section>
  );
}

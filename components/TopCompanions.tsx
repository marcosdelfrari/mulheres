"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getDistanceKm } from "@/lib/geo";
import { useUserLocation } from "@/lib/use-user-location";
import type { Companion } from "@/lib/types";
import { CompanionCard } from "./CompanionCard";
import { SponsoredSection } from "./SponsoredSection";

interface TopCompanionsProps {
  tops: Companion[];
  sponsored: Companion[];
}

export function TopCompanions({ tops, sponsored }: TopCompanionsProps) {
  const { location } = useUserLocation();

  const items = useMemo(() => {
    return tops.map((companion) => ({
      companion,
      distanceKm: location
        ? getDistanceKm(location, {
            latitude: companion.latitude,
            longitude: companion.longitude,
          })
        : undefined,
    }));
  }, [tops, location]);

  return (
    <section className="mx-auto max-w-6xl space-y-12 bg-white px-4 py-12 sm:px-6">
      <SponsoredSection companions={sponsored} />

      <div>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-light tracking-wide text-gray-900">
              Acompanhantes <span className="text-luxury-accent">Tops</span>
            </h2>
            <p className="mt-2 text-lg font-light text-gray-600">
              As profissionais verificadas em destaque.
            </p>
          </div>
          <Link
            href="/acompanhantes"
            className="hidden text-sm font-black uppercase tracking-widest text-purple-800 hover:text-luxury-accent sm:block"
          >
            Ver as modelos →
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-8 text-center text-gray-600">
            Nenhum perfil publicado no momento. Volte em breve.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ companion, distanceKm }) => (
              <CompanionCard
                key={companion.id}
                companion={companion}
                distanceKm={distanceKm}
              />
            ))}
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/acompanhantes"
            className="inline-block rounded-full bg-gray-900 px-8 py-4 text-base font-bold text-white hover:bg-black"
          >
            Ver todas as modelos
          </Link>
        </div>
      </div>
    </section>
  );
}

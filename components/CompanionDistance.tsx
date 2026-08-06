"use client";

import { useEffect, useState } from "react";
import { getDistanceKm, formatDistance } from "@/lib/geo";
import type { Companion } from "@/lib/types";

export function CompanionDistance({ companion }: { companion: Companion }) {
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("mulheres-location");
      if (!stored) return;
      const coords = JSON.parse(stored) as {
        latitude: number;
        longitude: number;
      };
      setDistanceKm(
        getDistanceKm(coords, {
          latitude: companion.latitude,
          longitude: companion.longitude,
        })
      );
    } catch {
      /* ignore */
    }
  }, [companion.latitude, companion.longitude]);

  if (distanceKm === null) return null;

  return (
    <span className="inline-block rounded-lg bg-purple-50 px-2 py-0.5 text-xs font-bold text-luxury-accent">
      {formatDistance(distanceKm)} de você
    </span>
  );
}

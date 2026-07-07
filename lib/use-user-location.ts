"use client";

import { useCallback, useEffect, useState } from "react";
import type { Coordinates } from "./types";

const STORAGE_KEY = "mulheres-location";

function readStoredLocation(): Coordinates | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Coordinates;
    if (
      typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number"
    ) {
      return parsed;
    }
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

export function useUserLocation() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocation(readStoredLocation());
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Seu navegador não suporta localização.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
        setLocation(coords);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        const messages: Record<number, string> = {
          1: "Permissão negada. Ative a localização no navegador.",
          2: "Não foi possível obter sua localização.",
          3: "Tempo esgotado. Tente novamente.",
        };
        setError(messages[err.code] ?? "Erro ao obter localização.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { location, loading, error, requestLocation };
}

import type { Coordinates } from "./types";

/** Centro aproximado das cidades usadas no catálogo (distância). */
const CITY_COORDS: Record<string, Coordinates> = {
  "São Paulo": { latitude: -23.5505, longitude: -46.6333 },
  "Rio de Janeiro": { latitude: -22.9068, longitude: -43.1729 },
  "Belo Horizonte": { latitude: -19.9167, longitude: -43.9345 },
  Curitiba: { latitude: -25.4284, longitude: -49.2733 },
  Brasília: { latitude: -15.8267, longitude: -47.9218 },
  Salvador: { latitude: -12.9777, longitude: -38.5016 },
  Campinas: { latitude: -22.9056, longitude: -47.0608 },
};

const DEFAULT_COORDS: Coordinates = {
  latitude: -19.9167,
  longitude: -43.9345,
};

export function coordsForCity(city: string): Coordinates {
  return CITY_COORDS[city] ?? DEFAULT_COORDS;
}

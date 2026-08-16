import type { Companion, Region } from "./types";

export function getCitiesByRegion(
  companions: Companion[],
  region: Region,
): string[] {
  return [
    ...new Set(
      companions.filter((c) => c.region === region).map((c) => c.city),
    ),
  ].sort();
}

export function getNeighborhoodsByCity(
  companions: Companion[],
  region: Region,
  city: string,
): string[] {
  return [
    ...new Set(
      companions
        .filter((c) => c.region === region && c.city === city)
        .map((c) => c.neighborhood),
    ),
  ].sort();
}

export const FILTER_SERVICES = [
  "Oral",
  "Anal",
  "Tratamento de namorados",
  "Massagem erótica",
  "Massagem tântrica",
  "Fetiches",
  "Videochamada",
];

export const FILTER_SERVICES_FOR = [
  "Homens",
  "Mulheres",
  "Casais",
  "Pessoas com deficiência",
];

export const FILTER_LOCATIONS = [
  "Em casa",
  "Hotel / Motel",
  "Eventos e festas",
];

export const FILTER_GENDERS = ["Mulher", "Travesti", "Trans"];

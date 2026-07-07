import type { Region } from "./types";
import { companions } from "./mock-data";

export function getCitiesByRegion(region: Region): string[] {
  return [
    ...new Set(
      companions.filter((c) => c.region === region).map((c) => c.city)
    ),
  ].sort();
}

export function getNeighborhoodsByCity(region: Region, city: string): string[] {
  return [
    ...new Set(
      companions
        .filter((c) => c.region === region && c.city === city)
        .map((c) => c.neighborhood)
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

export const FILTER_NATIONALITIES = [
  "Brasileira",
  "Argentina",
  "Colombiana",
  "Paraguaia",
];

export const FILTER_BREAST_TYPES = ["Naturais", "Siliconados"];

export const FILTER_HAIR_TYPES = ["Loiro", "Moreno", "Ruivo", "Preto"];

export const FILTER_BODY_TYPES = ["Magra", "Atlética", "Curvilínea", "Plus size"];

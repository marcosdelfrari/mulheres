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
];

export const FILTER_LOCATIONS = [
  "Em casa",
  "Hotel / Motel",
  "Eventos e festas",
];

export const FILTER_GENDERS = ["Mulher", "Travesti", "Trans"];

export const CITIES_BY_REGION: Record<Region, string[]> = {
  "São Paulo": [
    "São Paulo",
    "Campinas",
    "Guarulhos",
    "Santos",
    "São José dos Campos",
    "Ribeirão Preto",
    "Sorocaba",
    "Osasco",
    "Santo André",
    "São Bernardo do Campo",
  ],
  "Rio de Janeiro": [
    "Rio de Janeiro",
    "Niterói",
    "Duque de Caxias",
    "Nova Iguaçu",
    "Petrópolis",
    "Cabo Frio",
    "Campos dos Goytacazes",
  ],
  "Minas Gerais": [
    "Belo Horizonte",
    "Contagem",
    "Betim",
    "Uberlândia",
    "Juiz de Fora",
    "Montes Claros",
    "Uberaba",
    "Governador Valadares",
  ],
  Paraná: [
    "Curitiba",
    "Londrina",
    "Maringá",
    "Ponta Grossa",
    "Cascavel",
    "Foz do Iguaçu",
  ],
  Bahia: [
    "Salvador",
    "Feira de Santana",
    "Vitória da Conquista",
    "Porto Seguro",
    "Lauro de Freitas",
    "Camaçari",
  ],
  "Distrito Federal": ["Brasília"],
};

export function citiesForRegion(region: string): string[] {
  if (region in CITIES_BY_REGION) {
    return CITIES_BY_REGION[region as Region];
  }
  return [];
}

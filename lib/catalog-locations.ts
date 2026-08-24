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

export const FILTER_TYPE_TAGS = [
  "Gordinha",
  "Alternativa",
  "Emo",
  "Egirl",
  "Peitão",
  "Cavala",
  "Rabuda",
  "Bundão",
];

export const FILTER_GENDERS = ["Mulher", "Travesti", "Trans"];

export const CITIES_BY_REGION: Record<Region, string[]> = {
  "São Paulo": [
    "São Paulo",
    "Campinas",
    "Guarulhos",
    "Marília",
    "Mogi Guaçu",
    "Presidente Prudente",
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
    "Volta Redonda",
  ],
  "Minas Gerais": [
    "Belo Horizonte",
    "Contagem",
    "Betim",
    "Divinópolis",
    "Governador Valadares",
    "Ipatinga",
    "Juiz de Fora",
    "Montes Claros",
    "Patos de Minas",
    "Pouso Alegre",
    "Sete Lagoas",
    "Uberlândia",
    "Uberaba",
  ],
  Paraná: [
    "Curitiba",
    "Londrina",
    "Maringá",
    "Ponta Grossa",
    "Cascavel",
    "Foz do Iguaçu",
    "Toledo",
  ],
  Bahia: [
    "Salvador",
    "Barreiras",
    "Feira de Santana",
    "Vitória da Conquista",
    "Porto Seguro",
    "Lauro de Freitas",
    "Camaçari",
  ],
  "Distrito Federal": ["Brasília"],
  "Espírito Santo": ["Linhares", "Vitória"],
  Goiás: ["Itumbiara", "Goiânia"],
  Tocantins: ["Araguaína", "Palmas"],
};

export function citiesForRegion(region: string): string[] {
  if (region in CITIES_BY_REGION) {
    return CITIES_BY_REGION[region as Region];
  }
  return [];
}

export type UserRole = "cliente" | "acompanhante";

export type Region =
  | "São Paulo"
  | "Rio de Janeiro"
  | "Minas Gerais"
  | "Paraná"
  | "Bahia"
  | "Distrito Federal";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Companion {
  id: string;
  name: string;
  age: number;
  region: Region;
  city: string;
  neighborhood: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  services: string[];
  servicesFor: string[];
  serviceLocations: string[];
  payments: string[];
  bio: string;
  phone: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  online: boolean;
  avatarColor: string;
  coverPhoto: string;
  photos: string[];
  adId: string;
  publishedAt: string;
  sponsored: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CatalogFilters {
  category: string;
  region: Region | "all";
  city: string;
  neighborhood: string;
  search: string;
  verifiedOnly: boolean;
  maxPrice: number | null;
  sortBy: "distance" | "rating" | "price-asc" | "price-desc";
  selectedServices: string[];
  selectedServicesFor: string[];
  selectedLocations: string[];
  selectedNationalities: string[];
  selectedBreastTypes: string[];
  selectedHairTypes: string[];
  selectedBodyTypes: string[];
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  category: "acompanhantes",
  region: "all",
  city: "",
  neighborhood: "all",
  search: "",
  verifiedOnly: false,
  maxPrice: null,
  sortBy: "price-asc",
  selectedServices: [],
  selectedServicesFor: [],
  selectedLocations: [],
  selectedNationalities: [],
  selectedBreastTypes: [],
  selectedHairTypes: [],
  selectedBodyTypes: [],
};

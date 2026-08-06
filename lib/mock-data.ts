import type { Companion, Region } from "./types";

function buildPhotos(id: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `https://picsum.photos/seed/mulheres-${id}-${i + 1}/600/800`
  );
}

function buildCoverPhoto(id: string): string {
  return `https://picsum.photos/seed/mulheres-cover-${id}/1200/420`;
}

type ProfileExtras = Pick<
  Companion,
  "services" | "servicesFor" | "serviceLocations" | "payments"
>;

const PROFILE_EXTRAS: Record<string, ProfileExtras> = {
  "1": {
    services: ["Oral", "Tratamento de namorados", "Massagem erótica", "Videochamada"],
    servicesFor: ["Homens"],
    serviceLocations: ["Em casa", "Hotel / Motel", "Eventos e festas"],
    payments: ["Efetivo", "Pix", "Cards"],
  },
  "2": {
    services: ["Oral", "Massagem erótica", "Massagem tântrica", "Videochamada"],
    servicesFor: ["Homens", "Pessoas com deficiência"],
    serviceLocations: ["Em casa", "Hotel / Motel"],
    payments: ["Efetivo", "Pix"],
  },
  "3": {
    services: ["Oral", "Tratamento de namorados", "Videochamada"],
    servicesFor: ["Homens"],
    serviceLocations: ["Em casa", "Eventos e festas"],
    payments: ["Pix"],
  },
  "4": {
    services: ["Oral", "Anal", "Tratamento de namorados", "Ejaculação corporal", "Fetiches"],
    servicesFor: ["Homens"],
    serviceLocations: ["Em casa", "Hotel / Motel", "Eventos e festas"],
    payments: ["Efetivo", "Pix", "Cards"],
  },
  "5": {
    services: ["Oral", "Massagem erótica", "Videochamada"],
    servicesFor: ["Homens"],
    serviceLocations: ["Hotel / Motel", "Eventos e festas"],
    payments: ["Efetivo", "Pix"],
  },
  "6": {
    services: ["Oral", "Tratamento de namorados", "Massagem erótica", "Fetiches"],
    servicesFor: ["Homens", "Pessoas com deficiência"],
    serviceLocations: ["Em casa", "Eventos e festas", "Hotel / Motel"],
    payments: ["Efetivo", "Cards", "Pix"],
  },
  "7": {
    services: ["Oral", "Massagem tântrica", "Massagem erótica"],
    servicesFor: ["Homens"],
    serviceLocations: ["Em casa", "Hotel / Motel"],
    payments: ["Pix", "Cards"],
  },
  "8": {
    services: ["Oral", "Tratamento de namorados", "Videochamada"],
    servicesFor: ["Homens"],
    serviceLocations: ["Em casa", "Hotel / Motel"],
    payments: ["Efetivo", "Pix"],
  },
  "9": {
    services: ["Oral", "Tratamento de namorados", "Massagem erótica", "Fetiches", "Videochamada"],
    servicesFor: ["Homens", "Pessoas com deficiência"],
    serviceLocations: ["Em casa", "Eventos e festas", "Hotel / Motel"],
    payments: ["Efetivo", "Pix", "Cards"],
  },
  "10": {
    services: ["Oral", "Massagem erótica", "Videochamada"],
    servicesFor: ["Homens"],
    serviceLocations: ["Em casa", "Eventos e festas"],
    payments: ["Pix"],
  },
  "11": {
    services: ["Oral", "Tratamento de namorados", "Massagem erótica"],
    servicesFor: ["Homens"],
    serviceLocations: ["Em casa", "Hotel / Motel"],
    payments: ["Efetivo", "Pix"],
  },
  "12": {
    services: ["Oral", "Massagem tântrica", "Fetiches"],
    servicesFor: ["Homens", "Casais"],
    serviceLocations: ["Em casa", "Hotel / Motel", "Eventos e festas"],
    payments: ["Pix", "Cards"],
  },
  "13": {
    services: ["Oral", "Tratamento de namorados", "Videochamada"],
    servicesFor: ["Homens"],
    serviceLocations: ["Em casa", "Eventos e festas"],
    payments: ["Efetivo", "Pix"],
  },
  "14": {
    services: ["Oral", "Massagem erótica", "Tratamento de namorados"],
    servicesFor: ["Homens", "Pessoas com deficiência"],
    serviceLocations: ["Em casa", "Hotel / Motel"],
    payments: ["Pix", "Cards"],
  },
};

const DEFAULT_EXTRAS: ProfileExtras = {
  services: ["Oral", "Tratamento de namorados", "Videochamada"],
  servicesFor: ["Homens"],
  serviceLocations: ["Em casa", "Hotel / Motel"],
  payments: ["Efetivo", "Pix"],
};

function buildAdMeta(
  id: string,
  name: string,
  verified: boolean,
): Pick<Companion, "adId" | "publishedAt" | "verifiedAt"> {
  const slug = name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 3);
  const day = Math.max(1, 12 - Number(id));
  const publishedAt = `2026-07-${String(day).padStart(2, "0")}T10:00:00.000Z`;
  return {
    adId: `br${id}zb${slug}${Number(id) * 2}`,
    publishedAt,
    verifiedAt: verified
      ? `2026-06-${String(Math.max(1, 20 - Number(id))).padStart(2, "0")}T14:00:00.000Z`
      : undefined,
  };
}

const SPONSORED_IDS = new Set(["1", "4", "6", "9", "11"]);

type RawCompanion = Omit<
  Companion,
  | "services"
  | "servicesFor"
  | "serviceLocations"
  | "payments"
  | "adId"
  | "publishedAt"
  | "verifiedAt"
  | "sponsored"
  | "coverPhoto"
>;

function withProfileExtras(companion: RawCompanion): Companion {
  const extras = PROFILE_EXTRAS[companion.id] ?? DEFAULT_EXTRAS;
  const adMeta = buildAdMeta(companion.id, companion.name, companion.verified);
  return {
    ...companion,
    ...extras,
    ...adMeta,
    coverPhoto: buildCoverPhoto(companion.id),
    sponsored: SPONSORED_IDS.has(companion.id),
  };
}

export const REGIONS: Region[] = [
  "São Paulo",
  "Rio de Janeiro",
  "Minas Gerais",
  "Paraná",
  "Bahia",
  "Distrito Federal",
];

const rawCompanions: RawCompanion[] = [
  {
    id: "1",
    name: "Larissa",
    age: 26,
    region: "São Paulo",
    city: "São Paulo",
    neighborhood: "Pinheiros",
    verified: true,
    rating: 4.9,
    reviewCount: 47,
    pricePerHour: 400,
    bio: "Acompanhante discreta e elegante para ocasiões especiais na capital paulista.",
    phone: "(11) 98765-4321",
    whatsapp: "5511987654321",
    latitude: -23.5614,
    longitude: -46.689,
    online: true,
    avatarColor: "#9333ea",
    photos: buildPhotos("1", 5),
  },
  {
    id: "2",
    name: "Camila",
    age: 24,
    region: "São Paulo",
    city: "São Paulo",
    neighborhood: "Moema",
    verified: true,
    rating: 4.8,
    reviewCount: 32,
    pricePerHour: 350,
    bio: "Experiência premium com atendimento personalizado.",
    phone: "(11) 97654-3210",
    whatsapp: "5511976543210",
    latitude: -23.6012,
    longitude: -46.6645,
    online: false,
    avatarColor: "#3d1a5c",
    photos: buildPhotos("2", 4),
  },
  {
    id: "3",
    name: "Bianca",
    age: 28,
    region: "São Paulo",
    city: "Campinas",
    neighborhood: "Cambuí",
    verified: false,
    rating: 4.5,
    reviewCount: 18,
    pricePerHour: 280,
    bio: "Nova na plataforma, atendimento em Campinas e região.",
    phone: "(19) 99876-5432",
    whatsapp: "5519998765432",
    latitude: -22.8984,
    longitude: -47.0551,
    online: true,
    avatarColor: "#a855f7",
    photos: buildPhotos("3", 3),
  },
  {
    id: "4",
    name: "Valentina",
    age: 27,
    region: "Rio de Janeiro",
    city: "Rio de Janeiro",
    neighborhood: "Copacabana",
    verified: true,
    rating: 4.9,
    reviewCount: 61,
    pricePerHour: 450,
    bio: "Carioca autêntica, perfeita para conhecer o melhor do Rio.",
    phone: "(21) 98765-1234",
    whatsapp: "5521987651234",
    latitude: -22.9711,
    longitude: -43.1822,
    online: true,
    avatarColor: "#2a1140",
    photos: buildPhotos("4", 6),
  },
  {
    id: "5",
    name: "Isabela",
    age: 25,
    region: "Rio de Janeiro",
    city: "Rio de Janeiro",
    neighborhood: "Barra da Tijuca",
    verified: false,
    rating: 4.3,
    reviewCount: 9,
    pricePerHour: 320,
    bio: "Atendimento na Zona Oeste com flexibilidade de horários.",
    phone: "(21) 97654-9876",
    whatsapp: "5521976549876",
    latitude: -23.0004,
    longitude: -43.3659,
    online: false,
    avatarColor: "#8b5cf6",
    photos: buildPhotos("5", 4),
  },
  {
    id: "6",
    name: "Fernanda",
    age: 29,
    region: "Minas Gerais",
    city: "Belo Horizonte",
    neighborhood: "Savassi",
    verified: true,
    rating: 4.7,
    reviewCount: 28,
    pricePerHour: 300,
    bio: "Mineira charmosa, especialista em eventos corporativos.",
    phone: "(31) 99887-6655",
    whatsapp: "5531998876655",
    latitude: -19.9386,
    longitude: -43.9378,
    online: true,
    avatarColor: "#5b21b6",
    photos: buildPhotos("6", 5),
  },
  {
    id: "7",
    name: "Juliana",
    age: 23,
    region: "Paraná",
    city: "Curitiba",
    neighborhood: "Batel",
    verified: true,
    rating: 4.6,
    reviewCount: 22,
    pricePerHour: 290,
    bio: "Atendimento sofisticado no coração de Curitiba.",
    phone: "(41) 98765-7788",
    whatsapp: "5541987657788",
    latitude: -25.4419,
    longitude: -49.2769,
    online: false,
    avatarColor: "#c084fc",
    photos: buildPhotos("7", 4),
  },
  {
    id: "8",
    name: "Amanda",
    age: 26,
    region: "Bahia",
    city: "Salvador",
    neighborhood: "Barra",
    verified: false,
    rating: 4.4,
    reviewCount: 14,
    pricePerHour: 250,
    bio: "Salvador com todo charme baiano para momentos inesquecíveis.",
    phone: "(71) 99876-1122",
    whatsapp: "5571998761122",
    latitude: -13.0094,
    longitude: -38.5316,
    online: true,
    avatarColor: "#7e22ce",
    photos: buildPhotos("8", 3),
  },
  {
    id: "9",
    name: "Natália",
    age: 30,
    region: "Distrito Federal",
    city: "Brasília",
    neighborhood: "Asa Sul",
    verified: true,
    rating: 4.8,
    reviewCount: 35,
    pricePerHour: 380,
    bio: "Experiência em eventos diplomáticos e corporativos em Brasília.",
    phone: "(61) 98765-3344",
    whatsapp: "5561987653344",
    latitude: -15.8267,
    longitude: -47.9218,
    online: true,
    avatarColor: "#9333ea",
    photos: buildPhotos("9", 5),
  },
  {
    id: "10",
    name: "Priscila",
    age: 27,
    region: "São Paulo",
    city: "São Paulo",
    neighborhood: "Vila Madalena",
    verified: false,
    rating: 4.2,
    reviewCount: 7,
    pricePerHour: 310,
    bio: "Perfil novo aguardando verificação. Atendimento na zona oeste.",
    phone: "(11) 96543-2109",
    whatsapp: "5511965432109",
    latitude: -23.5535,
    longitude: -46.6917,
    online: true,
    avatarColor: "#a78bfa",
    photos: buildPhotos("10", 4),
  },
  {
    id: "11",
    name: "Mariana",
    age: 25,
    region: "Minas Gerais",
    city: "Belo Horizonte",
    neighborhood: "Lourdes",
    verified: true,
    rating: 4.8,
    reviewCount: 41,
    pricePerHour: 320,
    bio: "Acompanhante no Lourdes, BH. Atendimento discreto e elegante para jantares e eventos.",
    phone: "(31) 99123-4567",
    whatsapp: "5531991234567",
    latitude: -19.9334,
    longitude: -43.9382,
    online: true,
    avatarColor: "#9333ea",
    photos: buildPhotos("11", 5),
  },
  {
    id: "12",
    name: "Carolina",
    age: 28,
    region: "Minas Gerais",
    city: "Belo Horizonte",
    neighborhood: "Funcionários",
    verified: true,
    rating: 4.6,
    reviewCount: 19,
    pricePerHour: 280,
    bio: "Mineira autêntica no Funcionários. Especialista em massagem tântrica e encontros reservados.",
    phone: "(31) 99234-5678",
    whatsapp: "5531992345678",
    latitude: -19.9356,
    longitude: -43.9256,
    online: false,
    avatarColor: "#3d1a5c",
    photos: buildPhotos("12", 4),
  },
  {
    id: "13",
    name: "Beatriz",
    age: 24,
    region: "Minas Gerais",
    city: "Belo Horizonte",
    neighborhood: "Pampulha",
    verified: false,
    rating: 4.4,
    reviewCount: 11,
    pricePerHour: 260,
    bio: "Nova na região da Pampulha. Atendimento com flexibilidade de horários.",
    phone: "(31) 99345-6789",
    whatsapp: "5531993456789",
    latitude: -19.8512,
    longitude: -43.9708,
    online: true,
    avatarColor: "#a855f7",
    photos: buildPhotos("13", 3),
  },
  {
    id: "14",
    name: "Renata",
    age: 30,
    region: "Minas Gerais",
    city: "Belo Horizonte",
    neighborhood: "Centro",
    verified: true,
    rating: 4.9,
    reviewCount: 53,
    pricePerHour: 350,
    bio: "Referência no Centro de BH. Experiência em eventos corporativos e viagens.",
    phone: "(31) 99456-7890",
    whatsapp: "5531994567890",
    latitude: -19.9167,
    longitude: -43.9345,
    online: true,
    avatarColor: "#2a1140",
    photos: buildPhotos("14", 6),
  },
];

export const companions: Companion[] = rawCompanions.map(withProfileExtras);

export function getCompanionById(id: string): Companion | undefined {
  return companions.find((c) => c.id === id);
}

export function getCompanionsByCity(city: string): Companion[] {
  return companions.filter((c) => c.city === city);
}

export function getSponsoredCompanions(): Companion[] {
  return companions.filter((c) => c.sponsored);
}

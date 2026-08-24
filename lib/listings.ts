import { isOnlineFromLastLogin } from "@/lib/online";
import { normalizePriceDisplayUnit } from "@/lib/price-display";
import { coordsForCity } from "@/lib/city-coords";
import { buildCompanionSlug } from "@/lib/companion-utils";
import { extractPublicCodeFromSlug } from "@/lib/listing-public-code";
import { digitsOnly, normalizeBrazilPhone } from "@/lib/phone";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import type { Companion, Region } from "@/lib/types";
import { REGIONS } from "@/lib/regions";
import type { Listing, User } from "@/lib/generated/prisma/client";

type ListingWithUser = Listing & {
  user?: Pick<
    User,
    "verificationStatus" | "verifiedAt" | "phone" | "lastLoginAt"
  > | null;
};

const AVATAR_COLORS = [
  "#9333ea",
  "#3d1a5c",
  "#7c3aed",
  "#6b21a8",
  "#a855f7",
  "#581c87",
  "#c026d3",
  "#4c1d95",
];

const listingUserSelect = {
  verificationStatus: true,
  verifiedAt: true,
  phone: true,
  lastLoginAt: true,
} as const;

/** Anúncios públicos: publicados e conta não banida. */
const publishedWhere = {
  status: "published" as const,
  user: { bannedAt: null },
};

function avatarColorFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]!;
}

function asRegion(value: string): Region {
  return (REGIONS as string[]).includes(value)
    ? (value as Region)
    : "Minas Gerais";
}

function isLuxoActive(listing: Pick<Listing, "isLuxo" | "luxoUntil">) {
  if (!listing.isLuxo) return false;
  if (!listing.luxoUntil) return true;
  return listing.luxoUntil.getTime() > Date.now();
}

export function listingToCompanion(listing: ListingWithUser): Companion {
  const photos =
    listing.photos?.length > 0
      ? listing.photos
      : listing.photoUrl
        ? [listing.photoUrl]
        : [];
  const coverPhoto = listing.photoUrl ?? photos[0] ?? "";
  const contact = normalizeBrazilPhone(
    listing.whatsapp || listing.phone || listing.user?.phone || "",
  );
  const phone = contact;
  const whatsappRaw = contact;
  const coords = coordsForCity(listing.city);
  const verified = listing.user?.verificationStatus === "verified";
  const online = listing.user
    ? isOnlineFromLastLogin(listing.user.lastLoginAt)
    : listing.online;

  return {
    id: listing.id,
    name: listing.title,
    age: listing.age,
    region: asRegion(listing.region),
    city: listing.city,
    neighborhood: listing.neighborhood,
    verified,
    rating: 0,
    reviewCount: 0,
    pricePerHour: listing.pricePerHour,
    priceDisplayUnit: normalizePriceDisplayUnit(listing.priceDisplayUnit),
    services: listing.services ?? [],
    servicesFor: listing.servicesFor ?? [],
    serviceLocations: listing.serviceLocations ?? [],
    typeTags: listing.typeTags ?? [],
    payments: ["Pix"],
    bio: listing.description,
    phone,
    whatsapp: digitsOnly(whatsappRaw) || digitsOnly(phone),
    latitude: coords.latitude,
    longitude: coords.longitude,
    online,
    avatarColor: avatarColorFromId(listing.id),
    coverPhoto,
    photos,
    nsfwPhotos: listing.nsfwPhotos ?? [],
    adId: listing.publicCode,
    publicCode: listing.publicCode,
    publishedAt: listing.createdAt.toISOString(),
    verifiedAt: listing.user?.verifiedAt?.toISOString(),
    sponsored: isLuxoActive(listing),
    gender: listing.gender,
  };
}

export async function getPublishedCompanions(): Promise<Companion[]> {
  if (!hasDatabaseUrl()) return [];

  const listings = await prisma.listing.findMany({
    where: publishedWhere,
    include: { user: { select: listingUserSelect } },
    orderBy: [{ isLuxo: "desc" }, { updatedAt: "desc" }],
  });

  return listings.map(listingToCompanion);
}

export async function getPublishedCompanionById(
  id: string,
): Promise<Companion | undefined> {
  if (!hasDatabaseUrl()) return undefined;

  const listing = await prisma.listing.findFirst({
    where: { id, ...publishedWhere },
    include: { user: { select: listingUserSelect } },
  });
  return listing ? listingToCompanion(listing) : undefined;
}

export async function getCompanionsByCity(city: string): Promise<Companion[]> {
  if (!hasDatabaseUrl()) return [];

  const listings = await prisma.listing.findMany({
    where: {
      ...publishedWhere,
      city: { equals: city, mode: "insensitive" },
    },
    include: { user: { select: listingUserSelect } },
    orderBy: [{ isLuxo: "desc" }, { updatedAt: "desc" }],
  });
  return listings.map(listingToCompanion);
}

export async function getCompanionsByRegion(
  region: string,
): Promise<Companion[]> {
  if (!hasDatabaseUrl()) return [];

  const listings = await prisma.listing.findMany({
    where: {
      ...publishedWhere,
      region: { equals: region, mode: "insensitive" },
    },
    include: { user: { select: listingUserSelect } },
    orderBy: [{ isLuxo: "desc" }, { updatedAt: "desc" }],
  });
  return listings.map(listingToCompanion);
}

export async function getSponsoredCompanions(): Promise<Companion[]> {
  if (!hasDatabaseUrl()) return [];

  const now = new Date();
  const listings = await prisma.listing.findMany({
    where: {
      ...publishedWhere,
      isLuxo: true,
      OR: [{ luxoUntil: null }, { luxoUntil: { gt: now } }],
    },
    include: { user: { select: listingUserSelect } },
    orderBy: [{ luxoUntil: "desc" }, { updatedAt: "desc" }],
  });
  return listings.map(listingToCompanion);
}

export async function getTopCompanions(limit = 8): Promise<Companion[]> {
  if (!hasDatabaseUrl()) return [];

  const listings = await prisma.listing.findMany({
    where: {
      ...publishedWhere,
      user: { bannedAt: null, verificationStatus: "verified" },
      NOT: {
        AND: [
          { isLuxo: true },
          { OR: [{ luxoUntil: null }, { luxoUntil: { gt: new Date() } }] },
        ],
      },
    },
    include: { user: { select: listingUserSelect } },
    orderBy: [{ updatedAt: "desc" }],
    take: limit,
  });
  return listings.map(listingToCompanion);
}

export async function getPublishedCompanionByPublicCode(
  publicCode: string,
): Promise<Companion | undefined> {
  if (!hasDatabaseUrl()) return undefined;

  const listing = await prisma.listing.findFirst({
    where: { publicCode, ...publishedWhere },
    include: { user: { select: listingUserSelect } },
  });
  return listing ? listingToCompanion(listing) : undefined;
}

export async function getCompanionBySlugOrId(
  slugOrId: string,
): Promise<Companion | undefined> {
  if (!hasDatabaseUrl()) return undefined;

  const byId = await getPublishedCompanionById(slugOrId);
  if (byId) return byId;

  const publicCode = extractPublicCodeFromSlug(slugOrId);
  if (publicCode) {
    const byCode = await getPublishedCompanionByPublicCode(publicCode);
    if (byCode) return byCode;
  }

  const companions = await getPublishedCompanions();
  const bySlug = companions.find((c) => buildCompanionSlug(c) === slugOrId);
  if (bySlug) return bySlug;

  const lastDash = slugOrId.lastIndexOf("-");
  if (lastDash >= 0) {
    const possibleId = slugOrId.slice(lastDash + 1);
    if (possibleId && possibleId !== slugOrId) {
      return getPublishedCompanionById(possibleId);
    }
  }

  return undefined;
}

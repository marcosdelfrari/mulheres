import { prisma } from "@/lib/prisma";

/** Máximo de anúncios publicados (ativos) por usuária. */
export const MAX_ACTIVE_LISTINGS = 2;

/** Intervalo mínimo entre criações de novos anúncios. */
export const CREATE_COOLDOWN_MS = 8 * 60 * 60 * 1000;

export type ListingLimits = {
  maxActive: number;
  activeCount: number;
  canCreate: boolean;
  canPublishMore: boolean;
  nextCreateAt: string | null;
  cooldownHours: number;
};

function formatRemaining(ms: number) {
  const totalMin = Math.ceil(ms / 60_000);
  if (totalMin < 60) return `${totalMin} min`;
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

export async function countActiveListings(
  userId: string,
  excludeId?: string,
) {
  return prisma.listing.count({
    where: {
      userId,
      status: "published",
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function getCreateCooldown(userId: string) {
  const latest = await prisma.listing.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (!latest) {
    return { allowed: true as const, nextCreateAt: null as Date | null, waitMs: 0 };
  }

  const next = new Date(latest.createdAt.getTime() + CREATE_COOLDOWN_MS);
  const waitMs = next.getTime() - Date.now();
  if (waitMs <= 0) {
    return { allowed: true as const, nextCreateAt: null as Date | null, waitMs: 0 };
  }

  return { allowed: false as const, nextCreateAt: next, waitMs };
}

export async function getListingLimits(userId: string): Promise<ListingLimits> {
  const [activeCount, cooldown] = await Promise.all([
    countActiveListings(userId),
    getCreateCooldown(userId),
  ]);

  return {
    maxActive: MAX_ACTIVE_LISTINGS,
    activeCount,
    canCreate: cooldown.allowed,
    canPublishMore: activeCount < MAX_ACTIVE_LISTINGS,
    nextCreateAt: cooldown.nextCreateAt?.toISOString() ?? null,
    cooldownHours: CREATE_COOLDOWN_MS / (60 * 60 * 1000),
  };
}

export async function assertCanCreateListing(userId: string) {
  const cooldown = await getCreateCooldown(userId);
  if (!cooldown.allowed) {
    throw new Error(
      `Você pode criar 1 anúncio a cada 8 horas. Aguarde ${formatRemaining(cooldown.waitMs)}.`,
    );
  }
}

export async function assertCanPublishListing(
  userId: string,
  options?: { excludeId?: string; nextStatus?: string },
) {
  const nextStatus = options?.nextStatus ?? "published";
  if (nextStatus !== "published") return;

  const active = await countActiveListings(userId, options?.excludeId);
  if (active >= MAX_ACTIVE_LISTINGS) {
    throw new Error(
      `Você pode ter no máximo ${MAX_ACTIVE_LISTINGS} anúncios ativos. Pause ou exclua um para reativar/publicar outro.`,
    );
  }
}

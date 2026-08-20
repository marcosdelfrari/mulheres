import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { AuthUser, ListingSummary } from "@/lib/auth-types";
import type { Listing, User } from "@/lib/generated/prisma/client";
import { isOnlineFromLastLogin } from "@/lib/online";

export type { AuthUser, ListingSummary } from "@/lib/auth-types";

export const SESSION_COOKIE = "mulheres_session";
export const SESSION_DAYS = 30;
export const LUXO_PRICE_CENTS = 1990;
/** Duração do destaque após pagamento confirmado. */
export const LUXO_HOURS = 4;
export const PIX_KEY = process.env.PIX_KEY ?? "contato@mulheresdeluxo.com.br";

export {
  ONLINE_WINDOW_MS,
  isOnlineFromLastLogin,
} from "@/lib/online";

export async function markUserLogin(userId: string) {
  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: now },
    }),
    prisma.listing.updateMany({
      where: { userId },
      data: { online: true },
    }),
  ]);
  return now;
}

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    verificationStatus: user.verificationStatus,
    verificationMethod: user.verificationMethod,
    documentPhotoUrl: user.documentPhotoUrl,
    profilePhotoUrl: user.profilePhotoUrl,
    verifiedAt: user.verifiedAt?.toISOString() ?? null,
    bannedAt: user.bannedAt?.toISOString() ?? null,
  };
}

export function toListingSummary(
  listing: Listing & { user?: { lastLoginAt?: Date | null } | null },
): ListingSummary {
  const online = listing.user
    ? isOnlineFromLastLogin(listing.user.lastLoginAt)
    : listing.online;

  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    pricePerHour: listing.pricePerHour,
    age: listing.age,
    gender: listing.gender,
    region: listing.region,
    city: listing.city,
    neighborhood: listing.neighborhood,
    phone: listing.phone,
    whatsapp: listing.whatsapp,
    services: listing.services ?? [],
    servicesFor: listing.servicesFor ?? [],
    serviceLocations: listing.serviceLocations ?? [],
    status: listing.status,
    isLuxo: listing.isLuxo,
    luxoUntil: listing.luxoUntil?.toISOString() ?? null,
    online,
    photoUrl: listing.photoUrl,
    photos: listing.photos ?? [],
    nsfwPhotos: listing.nsfwPhotos ?? [],
    createdAt: listing.createdAt.toISOString(),
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionExpiryDate(days = SESSION_DAYS) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function createSession(userId: string) {
  const token = createToken();
  const expiresAt = sessionExpiryDate();

  await prisma.$transaction([
    prisma.session.create({
      data: {
        token: hashToken(token),
        userId,
        expiresAt,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    }),
    prisma.listing.updateMany({
      where: { userId },
      data: { online: true },
    }),
  ]);

  return { token, expiresAt };
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  await prisma.session.deleteMany({
    where: { token: hashToken(token) },
  });
}

export async function getUserFromToken(token: string | undefined) {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session
        .delete({ where: { id: session.id } })
        .catch(() => {});
    }
    return null;
  }

  if (session.user.bannedAt) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.user;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return getUserFromToken(token);
}

export function buildPixPayload(amountCents: number, txid: string) {
  const amount = (amountCents / 100).toFixed(2);
  const merchant = "Mulheres de Luxo".slice(0, 25);
  return [
    `000201`,
    `26${String(14 + PIX_KEY.length).padStart(2, "0")}0014BR.GOV.BCB.PIX01${String(PIX_KEY.length).padStart(2, "0")}${PIX_KEY}`,
    `52040000`,
    `5303986`,
    `54${String(amount.length).padStart(2, "0")}${amount}`,
    `5802BR`,
    `59${String(merchant.length).padStart(2, "0")}${merchant}`,
    `6009SAO PAULO`,
    `62${String(4 + txid.length).padStart(2, "0")}05${String(txid.length).padStart(2, "0")}${txid}`,
    `6304ABCD`,
  ].join("");
}

export function jsonError(message: string, status = 400) {
  if (status === 401) {
    const site =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      "https://mulheresdeluxo.com.br";
    const metadata = `${site}/.well-known/oauth-protected-resource`;
    return Response.json(
      { error: message, error_description: message },
      {
        status,
        headers: {
          "WWW-Authenticate": `Bearer realm="mulheres", resource_metadata="${metadata}", error="invalid_token", error_description="${message.replaceAll('"', "'")}"`,
          "Cache-Control": "no-store",
        },
      },
    );
  }
  return Response.json({ error: message }, { status });
}

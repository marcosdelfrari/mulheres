import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";

export const LISTING_PUBLIC_CODE_LENGTH = 6;
const MAX_GENERATION_ATTEMPTS = 25;

export function formatListingPublicCode(value: number): string {
  return String(value).padStart(LISTING_PUBLIC_CODE_LENGTH, "0");
}

export function randomListingPublicCode(): string {
  return formatListingPublicCode(randomInt(0, 1_000_000));
}

export function extractPublicCodeFromSlug(slug: string): string | null {
  const lastDash = slug.lastIndexOf("-");
  if (lastDash < 0) return null;
  const suffix = slug.slice(lastDash + 1);
  if (!/^\d{1,6}$/.test(suffix)) return null;
  return suffix.padStart(LISTING_PUBLIC_CODE_LENGTH, "0");
}

export async function generateUniqueListingPublicCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const code = randomListingPublicCode();
    const existing = await prisma.listing.findUnique({
      where: { publicCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }

  throw new Error("Não foi possível gerar um código único para o anúncio.");
}

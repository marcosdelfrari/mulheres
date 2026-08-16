import type { Companion } from "@/lib/types";
import { cityShortSlug, slugify } from "./slug";

export function buildCompanionSlug(companion: Companion): string {
  return `${slugify(companion.name)}-${slugify(companion.neighborhood)}-${cityShortSlug(companion.city)}-${companion.id}`;
}

export function companionProfilePath(companion: Companion): string {
  return `/acompanhante/${buildCompanionSlug(companion)}`;
}

export function formatVerifiedDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Indica se a URL está marcada como nudez (blur + gate). */
export function isNsfwPhoto(
  nsfwPhotos: string[] | undefined,
  photoUrl: string | undefined | null,
) {
  if (!photoUrl || !nsfwPhotos?.length) return false;
  return nsfwPhotos.includes(photoUrl);
}

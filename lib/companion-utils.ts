import type { Companion } from "@/lib/types";
import { cityShortSlug, slugify } from "./slug";

export function buildCompanionSlug(companion: Companion): string {
  return `${slugify(companion.name)}-${slugify(companion.neighborhood)}-${cityShortSlug(companion.city)}-${companion.id}`;
}

export function companionProfilePath(companion: Companion): string {
  return `/acompanhante/${buildCompanionSlug(companion)}`;
}

type PhotoAltCompanion = Pick<
  Companion,
  "name" | "age" | "gender" | "neighborhood" | "city"
>;

/** Alt descritivo das fotos do anúncio (catálogo, avatar e galeria). */
export function companionPhotoAlt(
  companion: PhotoAltCompanion,
  options: { index?: number; total?: number; role?: "avatar" } = {},
): string {
  const gender = (companion.gender || "Mulher").trim().toLowerCase();
  const place = [companion.neighborhood, companion.city]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

  let alt = `Acompanhante ${gender} ${companion.name}`;
  if (companion.age) alt += `, ${companion.age} anos`;
  if (place) alt += `, em ${place}`;

  if (options.role === "avatar") {
    return `${alt} — foto de perfil`;
  }

  const { index, total } = options;
  if (typeof index === "number" && typeof total === "number" && total > 1) {
    return `${alt} — foto ${index} de ${total}`;
  }

  return alt;
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

import { companions, getCompanionById } from "./mock-data";
import type { Companion } from "./types";
import { cityShortSlug, slugify } from "./slug";

export function buildCompanionSlug(companion: Companion): string {
  return `${slugify(companion.name)}-${slugify(companion.neighborhood)}-${cityShortSlug(companion.city)}-${companion.id}`;
}

export function companionProfilePath(companion: Companion): string {
  return `/acompanhante/${buildCompanionSlug(companion)}`;
}

export function getCompanionBySlugOrId(slugOrId: string): Companion | undefined {
  const byId = getCompanionById(slugOrId);
  if (byId) return byId;

  const bySuffix = companions.find((c) => buildCompanionSlug(c) === slugOrId);
  if (bySuffix) return bySuffix;

  const idMatch = slugOrId.match(/-(\d+)$/);
  if (idMatch) return getCompanionById(idMatch[1]);

  return undefined;
}

export function formatVerifiedDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

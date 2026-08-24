import { notFound } from "next/navigation";
import { TypeTagHubPage } from "@/components/LocationHubPages";
import {
  buildPublishedLocationIndex,
  resolveCityHubFromData,
  typeTagFromSlug,
  typeTagSlug,
} from "@/lib/dynamic-location-hubs";
import { getPublishedCompanions } from "@/lib/listings";
import { buildTypeTagCityMetadata } from "@/lib/seo";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ estado: string; cidade: string; tag: string }>;
}

export async function generateStaticParams() {
  const companions = await getPublishedCompanions().catch(() => []);
  const index = buildPublishedLocationIndex(companions);
  return index.cities.flatMap((city) =>
    city.typeTags.map((tag) => ({
      estado: city.stateSlug,
      cidade: city.citySlug,
      tag: typeTagSlug(tag),
    })),
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { estado, cidade, tag } = await params;
  const typeTag = typeTagFromSlug(tag);
  if (!typeTag) return { title: "Página não encontrada" };

  const companions = await getPublishedCompanions().catch(() => []);
  const hub = resolveCityHubFromData(estado, cidade, companions);
  if (!hub) return { title: "Página não encontrada" };
  return buildTypeTagCityMetadata(hub, typeTag);
}

export default async function TypeTagCityPage({ params }: PageProps) {
  const { estado, cidade, tag } = await params;
  const typeTag = typeTagFromSlug(tag);
  if (!typeTag) notFound();

  const companions = await getPublishedCompanions().catch(() => []);
  const hub = resolveCityHubFromData(estado, cidade, companions);
  if (!hub) notFound();

  return <TypeTagHubPage hub={hub} typeTag={typeTag} />;
}

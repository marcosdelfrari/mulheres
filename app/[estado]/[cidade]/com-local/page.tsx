import { notFound } from "next/navigation";
import { ComLocalHubPage } from "@/components/LocationHubPages";
import {
  buildPublishedLocationIndex,
  resolveCityHubFromData,
} from "@/lib/dynamic-location-hubs";
import { getPublishedCompanions } from "@/lib/listings";
import { buildComLocalCityMetadata } from "@/lib/seo";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ estado: string; cidade: string }>;
}

export async function generateStaticParams() {
  const companions = await getPublishedCompanions().catch(() => []);
  const index = buildPublishedLocationIndex(companions);
  return index.cities
    .filter((city) => city.withLocalCount > 0)
    .map((city) => ({
      estado: city.stateSlug,
      cidade: city.citySlug,
    }));
}

export async function generateMetadata({ params }: PageProps) {
  const { estado, cidade } = await params;
  const companions = await getPublishedCompanions().catch(() => []);
  const hub = resolveCityHubFromData(estado, cidade, companions);
  if (!hub) return { title: "Página não encontrada" };
  return buildComLocalCityMetadata(hub);
}

export default async function ComLocalCityPage({ params }: PageProps) {
  const { estado, cidade } = await params;
  const companions = await getPublishedCompanions().catch(() => []);
  const hub = resolveCityHubFromData(estado, cidade, companions);
  if (!hub) notFound();
  return <ComLocalHubPage hub={hub} />;
}

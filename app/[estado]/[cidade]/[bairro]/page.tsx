import { notFound } from "next/navigation";
import { NeighborhoodHubPage } from "@/components/LocationHubPages";
import {
  buildPublishedLocationIndex,
  resolveCityHubFromData,
  resolveNeighborhoodHubFromData,
} from "@/lib/dynamic-location-hubs";
import { getNeighborhoodCompanions } from "@/lib/location-hubs";
import { getPublishedCompanions } from "@/lib/listings";
import { buildNeighborhoodMetadata } from "@/lib/seo";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ estado: string; cidade: string; bairro: string }>;
}

export async function generateStaticParams() {
  const companions = await getPublishedCompanions().catch(() => []);
  const index = buildPublishedLocationIndex(companions);
  return index.cities.flatMap((city) =>
    city.neighborhoods.map((neighborhood) => ({
      estado: city.stateSlug,
      cidade: city.citySlug,
      bairro: neighborhood.slug,
    })),
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { estado, cidade, bairro } = await params;
  const companions = await getPublishedCompanions().catch(() => []);
  const hub = resolveCityHubFromData(estado, cidade, companions);
  const neighborhood = hub
    ? resolveNeighborhoodHubFromData(hub, bairro, companions)
    : undefined;
  if (!hub || !neighborhood) return { title: "Página não encontrada" };

  const cityCompanions = companions.filter(
    (c) => c.city.toLowerCase() === hub.city.toLowerCase(),
  );
  const neighborhoodCompanions = getNeighborhoodCompanions(
    cityCompanions,
    hub.city,
    neighborhood.name,
  );
  const metadata = buildNeighborhoodMetadata(hub, neighborhood);

  if (neighborhoodCompanions.length === 0) {
    return {
      ...metadata,
      robots: { index: false, follow: true },
    };
  }

  return metadata;
}

export default async function DynamicNeighborhoodPage({ params }: PageProps) {
  const { estado, cidade, bairro } = await params;
  const companions = await getPublishedCompanions().catch(() => []);
  const hub = resolveCityHubFromData(estado, cidade, companions);
  const neighborhood = hub
    ? resolveNeighborhoodHubFromData(hub, bairro, companions)
    : undefined;
  if (!hub || !neighborhood) notFound();
  return <NeighborhoodHubPage hub={hub} neighborhood={neighborhood} />;
}

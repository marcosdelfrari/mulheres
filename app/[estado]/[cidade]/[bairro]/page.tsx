import { notFound } from "next/navigation";
import { NeighborhoodHubPage } from "@/components/LocationHubPages";
import { getCompanionsByCity } from "@/lib/listings";
import {
  CITY_HUBS,
  getCityHub,
  getNeighborhoodCompanions,
  getNeighborhoodHub,
} from "@/lib/location-hubs";
import { buildNeighborhoodMetadata } from "@/lib/seo";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ estado: string; cidade: string; bairro: string }>;
}

export function generateStaticParams() {
  return CITY_HUBS.flatMap((hub) =>
    hub.neighborhoods.map((n) => ({
      estado: hub.stateSlug,
      cidade: hub.citySlug,
      bairro: n.slug,
    })),
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { estado, cidade, bairro } = await params;
  const hub = getCityHub(estado, cidade);
  const neighborhood = hub
    ? getNeighborhoodHub(estado, cidade, bairro)
    : undefined;
  if (!hub || !neighborhood) return { title: "Página não encontrada" };

  const cityCompanions = await getCompanionsByCity(hub.city);
  const companions = getNeighborhoodCompanions(
    cityCompanions,
    hub.city,
    neighborhood.name,
  );
  const metadata = buildNeighborhoodMetadata(hub, neighborhood);

  if (companions.length === 0) {
    return {
      ...metadata,
      robots: { index: false, follow: true },
    };
  }

  return metadata;
}

export default async function DynamicNeighborhoodPage({ params }: PageProps) {
  const { estado, cidade, bairro } = await params;
  const hub = getCityHub(estado, cidade);
  const neighborhood = hub
    ? getNeighborhoodHub(estado, cidade, bairro)
    : undefined;
  if (!hub || !neighborhood) notFound();
  return <NeighborhoodHubPage hub={hub} neighborhood={neighborhood} />;
}

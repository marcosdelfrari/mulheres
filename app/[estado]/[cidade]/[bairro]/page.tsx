import { notFound } from "next/navigation";
import { NeighborhoodHubPage } from "@/components/LocationHubPages";
import {
  CITY_HUBS,
  getCityHub,
  getNeighborhoodHub,
} from "@/lib/location-hubs";
import { buildNeighborhoodMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

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
  return buildNeighborhoodMetadata(hub, neighborhood);
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

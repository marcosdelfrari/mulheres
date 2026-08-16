import { notFound } from "next/navigation";
import { CityHubPage } from "@/components/LocationHubPages";
import {
  CITY_HUBS,
  getCityHub,
} from "@/lib/location-hubs";
import { buildCityHubMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ estado: string; cidade: string }>;
}

export function generateStaticParams() {
  return CITY_HUBS.map((hub) => ({
    estado: hub.stateSlug,
    cidade: hub.citySlug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { estado, cidade } = await params;
  const hub = getCityHub(estado, cidade);
  if (!hub) return { title: "Página não encontrada" };
  return buildCityHubMetadata(hub);
}

export default async function DynamicCityPage({ params }: PageProps) {
  const { estado, cidade } = await params;
  const hub = getCityHub(estado, cidade);
  if (!hub) notFound();
  return <CityHubPage hub={hub} />;
}

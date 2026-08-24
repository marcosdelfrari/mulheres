import { notFound } from "next/navigation";
import { StateHubPage } from "@/components/LocationHubPages";
import { getActiveLocationLinks } from "@/lib/active-locations";
import { getStateHub } from "@/lib/location-hubs";
import { buildStateHubMetadata } from "@/lib/seo";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ estado: string }>;
}

export async function generateStaticParams() {
  const { states } = await getActiveLocationLinks();
  return states.map((hub) => ({
    estado: hub.stateSlug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { estado } = await params;
  const hub = getStateHub(estado);
  if (!hub) return { title: "Página não encontrada" };
  return buildStateHubMetadata(hub);
}

export default async function DynamicStatePage({ params }: PageProps) {
  const { estado } = await params;
  const hub = getStateHub(estado);
  if (!hub) notFound();
  return <StateHubPage hub={hub} />;
}

import { CITY_HUBS, getCityHub } from "@/lib/location-hubs";
import {
  allCityHubKeys,
  buildPublishedLocationIndex,
  resolveCityHubFromData,
} from "@/lib/dynamic-location-hubs";
import { getPublishedCompanions } from "@/lib/listings";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderLocationOgImage,
} from "@/lib/og-location-image";

export const alt = "Mulheres de Luxo — Acompanhantes por cidade";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

interface ImageProps {
  params: Promise<{ estado: string; cidade: string }>;
}

export async function generateStaticParams() {
  const companions = await getPublishedCompanions().catch(() => []);
  const index = buildPublishedLocationIndex(companions);
  return allCityHubKeys(index);
}

export default async function OpenGraphImage({ params }: ImageProps) {
  const { estado, cidade } = await params;
  const staticHub = getCityHub(estado, cidade);
  const companions = await getPublishedCompanions().catch(() => []);
  const hub =
    staticHub ?? resolveCityHubFromData(estado, cidade, companions);

  if (!hub) {
    return renderLocationOgImage({
      headline: "Mulheres de Luxo",
      subtitle: "Acompanhantes de luxo em todo o Brasil",
    });
  }

  return renderLocationOgImage({
    eyebrow: hub.eyebrow,
    headline: `Acompanhantes em ${hub.heroLocation}`,
    subtitle: hub.heroSub.slice(0, 120),
  });
}

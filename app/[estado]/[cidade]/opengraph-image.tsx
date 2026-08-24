import { CITY_HUBS, getCityHub } from "@/lib/location-hubs";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderLocationOgImage,
} from "@/lib/og-location-image";

export const alt = "Mulheres — Acompanhantes por cidade";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

interface ImageProps {
  params: Promise<{ estado: string; cidade: string }>;
}

export function generateStaticParams() {
  return CITY_HUBS.map((hub) => ({
    estado: hub.stateSlug,
    cidade: hub.citySlug,
  }));
}

export default async function OpenGraphImage({ params }: ImageProps) {
  const { estado, cidade } = await params;
  const hub = getCityHub(estado, cidade);

  if (!hub) {
    return renderLocationOgImage({
      headline: "Mulheres",
      subtitle: "Acompanhantes de luxo em todo o Brasil",
    });
  }

  return renderLocationOgImage({
    eyebrow: hub.eyebrow,
    headline: `Acompanhantes em ${hub.heroLocation}`,
    subtitle: hub.heroSub.slice(0, 120),
  });
}

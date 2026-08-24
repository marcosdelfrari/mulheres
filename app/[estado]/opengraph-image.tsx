import {
  getStateHub,
  STATE_HUBS,
} from "@/lib/location-hubs";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderLocationOgImage,
} from "@/lib/og-location-image";

export const alt = "Mulheres de Luxo — Acompanhantes por estado";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

interface ImageProps {
  params: Promise<{ estado: string }>;
}

export function generateStaticParams() {
  return STATE_HUBS.map((hub) => ({ estado: hub.stateSlug }));
}

export default async function OpenGraphImage({ params }: ImageProps) {
  const { estado } = await params;
  const hub = getStateHub(estado);

  if (!hub) {
    return renderLocationOgImage({
      headline: "Mulheres de Luxo",
      subtitle: "Acompanhantes de luxo em todo o Brasil",
    });
  }

  return renderLocationOgImage({
    eyebrow: hub.eyebrow,
    headline: `Acompanhantes em ${hub.heroLocation}`,
    subtitle: "Perfis verificados · WhatsApp direto",
  });
}

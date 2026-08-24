import {
  CITY_HUBS,
  getCityHub,
  getNeighborhoodHub,
} from "@/lib/location-hubs";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderLocationOgImage,
} from "@/lib/og-location-image";

export const alt = "Mulheres de Luxo — Acompanhantes por bairro";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

interface ImageProps {
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

export default async function OpenGraphImage({ params }: ImageProps) {
  const { estado, cidade, bairro } = await params;
  const hub = getCityHub(estado, cidade);
  const neighborhood = hub
    ? getNeighborhoodHub(estado, cidade, bairro)
    : undefined;

  if (!hub || !neighborhood) {
    return renderLocationOgImage({
      headline: "Mulheres de Luxo",
      subtitle: "Acompanhantes de luxo em todo o Brasil",
    });
  }

  return renderLocationOgImage({
    eyebrow: `${hub.city} · ${hub.region}`,
    headline: `Acompanhantes em ${neighborhood.name}`,
    subtitle: "Com local · Perfis verificados · WhatsApp direto",
  });
}

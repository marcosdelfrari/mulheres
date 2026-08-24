import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderLocationOgImage,
} from "@/lib/og-location-image";

export const runtime = "edge";
export const alt = "Mulheres de Luxo — Acompanhantes de luxo em todo o Brasil";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpenGraphImage() {
  return renderLocationOgImage({
    headline: "Mulheres de Luxo",
    subtitle: "Acompanhantes de luxo em todo o Brasil",
  });
}

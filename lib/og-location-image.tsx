import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

interface LocationOgOptions {
  eyebrow?: string;
  headline: string;
  subtitle: string;
}

export function renderLocationOgImage({ eyebrow, headline, subtitle }: LocationOgOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background:
            "linear-gradient(135deg, #5b21b6 0%, #9333ea 50%, #c084fc 100%)",
          color: "white",
        }}
      >
        {eyebrow ? (
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            fontSize: eyebrow ? 64 : 72,
            fontWeight: 700,
            fontStyle: "italic",
            marginTop: eyebrow ? 16 : 0,
            lineHeight: 1.1,
            maxWidth: 1000,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontSize: 32,
            marginTop: 28,
            opacity: 0.95,
            maxWidth: 900,
            lineHeight: 1.25,
          }}
        >
          {subtitle}
        </div>
        <div style={{ fontSize: 22, marginTop: 36, opacity: 0.85 }}>
          Mulheres de Luxo · Perfis verificados · WhatsApp direto
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}

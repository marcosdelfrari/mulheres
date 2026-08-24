import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

interface LocationOgOptions {
  eyebrow?: string;
  headline: string;
  subtitle: string;
}

async function loadBrandLogo(): Promise<string> {
  const bytes = await readFile(join(process.cwd(), "public/thumb.png"));
  return `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
}

export async function renderLocationOgImage({
  eyebrow,
  headline,
  subtitle,
}: LocationOgOptions) {
  const logoSrc = await loadBrandLogo();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "56px 72px",
          background: "linear-gradient(145deg, #07040f 0%, #140a1f 55%, #1a0f28 100%)",
          color: "#f5ebe0",
        }}
      >
        <img
          src={logoSrc}
          width={420}
          height={420}
          alt=""
          style={{
            borderRadius: 210,
            flexShrink: 0,
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 56,
            maxWidth: 580,
            flex: 1,
          }}
        >
          {eyebrow ? (
            <div
              style={{
                fontSize: 24,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#c4a574",
                marginBottom: 14,
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          <div
            style={{
              fontSize: eyebrow ? 52 : 60,
              fontWeight: 700,
              lineHeight: 1.12,
              color: "#f8f1e7",
            }}
          >
            {headline}
          </div>
          <div
            style={{
              fontSize: 28,
              marginTop: 22,
              lineHeight: 1.35,
              color: "rgba(245, 235, 224, 0.82)",
            }}
          >
            {subtitle}
          </div>
          <div
            style={{
              fontSize: 22,
              marginTop: 28,
              color: "#c4a574",
              letterSpacing: "0.04em",
            }}
          >
            Mulheres de Luxo · Verificados · WhatsApp
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}

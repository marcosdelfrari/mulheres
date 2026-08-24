import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-location-image";

export const alt = "Mulheres de Luxo — Acompanhantes de luxo em todo o Brasil";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OpenGraphImage() {
  const bytes = await readFile(join(process.cwd(), "public/thumb.png"));
  const logoSrc = `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050308",
        }}
      >
        {/* Faixa central ~630px: WhatsApp corta o quadrado do meio e fica só o logo. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 630,
            height: 630,
          }}
        >
          <img
            src={logoSrc}
            width={560}
            height={560}
            alt=""
            style={{ borderRadius: 280 }}
          />
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}

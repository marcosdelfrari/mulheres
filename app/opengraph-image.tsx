import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mulheres — Acompanhantes de luxo em todo o Brasil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background: "linear-gradient(135deg, #5b21b6 0%, #9333ea 50%, #c084fc 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, fontStyle: "italic" }}>
          Mulheres
        </div>
        <div style={{ fontSize: 36, marginTop: 24, opacity: 0.95, maxWidth: 900 }}>
          Acompanhantes de luxo em todo o Brasil
        </div>
        <div style={{ fontSize: 24, marginTop: 32, opacity: 0.85 }}>
          Perfis verificados · Capitais e bairros · WhatsApp direto
        </div>
      </div>
    ),
    { ...size },
  );
}

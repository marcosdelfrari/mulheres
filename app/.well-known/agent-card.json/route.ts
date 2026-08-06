import { buildAgentCard, agentCardSha256Base64Url } from "@/lib/agent-discovery";

export async function GET() {
  const card = buildAgentCard();
  return Response.json(card, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Cap-SHA256": agentCardSha256Base64Url(),
      Link: [
        `</.well-known/api-catalog>; rel="api-catalog"`,
        `</openapi.json>; rel="service-desc"`,
        `</guias/como-funciona>; rel="service-doc"`,
      ].join(", "),
    },
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Cap-SHA256": agentCardSha256Base64Url(),
    },
  });
}

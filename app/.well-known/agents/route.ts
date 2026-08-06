import { buildAgentIndex } from "@/lib/agent-discovery";

export async function GET() {
  return Response.json(buildAgentIndex(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      Link: `</.well-known/agent-card.json>; rel="alternate"; type="application/json"`,
    },
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

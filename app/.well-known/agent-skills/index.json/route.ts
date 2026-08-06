import {
  AGENT_SKILLS_INDEX_PATH,
  buildAgentSkillsIndex,
} from "@/lib/agent-skills";

export const runtime = "nodejs";

function headers() {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=300",
    "Access-Control-Allow-Origin": "*",
    Link: [
      `<${AGENT_SKILLS_INDEX_PATH}>; rel="index"; type="application/json"`,
      `</.well-known/mcp/server-card.json>; rel="mcp-server-card"`,
      `</auth.md>; rel="describedby"; type="text/markdown"`,
      `</llms.txt>; rel="describedby"; type="text/plain"`,
    ].join(", "),
  };
}

export async function GET() {
  const index = await buildAgentSkillsIndex();
  return Response.json(index, { headers: headers() });
}

export async function HEAD() {
  return new Response(null, { status: 200, headers: headers() });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Accept, Content-Type",
    },
  });
}

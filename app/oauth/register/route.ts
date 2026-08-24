import { OAUTH_CLIENT_ID } from "@/lib/oauth";
import { absoluteUrl } from "@/lib/seo";

export const runtime = "nodejs";

/**
 * Minimal dynamic client registration (RFC 7591) for agent discovery.
 * Returns the preconfigured public agent client.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const redirectUris = Array.isArray(body.redirect_uris)
    ? body.redirect_uris
    : [absoluteUrl("/oauth/callback")];

  return Response.json(
    {
      client_id: OAUTH_CLIENT_ID,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_secret_expires_at: 0,
      redirect_uris: redirectUris,
      grant_types: ["authorization_code", "password", "client_credentials"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
      client_name: body.client_name ?? "Mulheres de Luxo Agent",
    },
    { status: 201 },
  );
}

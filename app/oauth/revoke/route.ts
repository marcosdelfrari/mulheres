import { parseBasicAuth, validateClient } from "@/lib/oauth";

export const runtime = "nodejs";

/**
 * RFC 7009 token revocation — JWT access tokens are short-lived;
 * revocation is acknowledged to satisfy Auth.md discovery.
 */
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let params: URLSearchParams;

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, string>;
    params = new URLSearchParams(body);
  } else {
    params = new URLSearchParams(await request.text());
  }

  const basic = parseBasicAuth(request.headers.get("authorization"));
  const clientId = basic?.clientId ?? params.get("client_id") ?? "";
  const clientSecret = basic?.clientSecret ?? params.get("client_secret");
  const token = params.get("token") ?? "";

  if (!token) {
    return Response.json(
      { error: "invalid_request", error_description: "token is required." },
      { status: 400 },
    );
  }

  if (clientId && clientSecret) {
    if (!validateClient(clientId, clientSecret, "secret")) {
      return Response.json(
        { error: "invalid_client", error_description: "Client authentication failed." },
        { status: 401 },
      );
    }
  }

  // Stateless JWT: acknowledge revocation (clients must discard the token).
  return new Response(null, { status: 200 });
}

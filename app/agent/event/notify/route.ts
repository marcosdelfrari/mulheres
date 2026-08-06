export const runtime = "nodejs";

/**
 * RFC 8935 / SET push receiver for agent identity events (revocation, etc.).
 */
export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  return Response.json(
    {
      received: true,
      events_supported: [
        "https://schemas.workos.com/events/agent/auth/identity/assertion/revoked",
      ],
      body: body ?? undefined,
    },
    { status: 202 },
  );
}

export async function GET() {
  return Response.json({
    events_supported: [
      "https://schemas.workos.com/events/agent/auth/identity/assertion/revoked",
    ],
    delivery: "push",
  });
}

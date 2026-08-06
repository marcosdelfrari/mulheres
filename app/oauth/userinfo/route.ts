import { verifyAccessToken } from "@/lib/oauth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return Response.json(
      { error: "invalid_token", error_description: "Bearer token required." },
      {
        status: 401,
        headers: {
          "WWW-Authenticate":
            'Bearer realm="mulheres", error="invalid_token"',
        },
      },
    );
  }

  try {
    const payload = await verifyAccessToken(header.slice(7));
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    if (!sub) {
      return Response.json({ error: "invalid_token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: sub } });
    if (!user) {
      return Response.json({ error: "invalid_token" }, { status: 401 });
    }

    return Response.json({
      sub: user.id,
      email: user.email,
      name: user.name,
      preferred_username: user.email,
      role: user.role,
    });
  } catch {
    return Response.json({ error: "invalid_token" }, { status: 401 });
  }
}

import { requireAdmin } from "@/lib/admin";
import { jsonError, toAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const users = await prisma.user.findMany({
      include: {
        _count: { select: { listings: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({
      users: users.map((user) => ({
        ...toAuthUser(user),
        listingsCount: user._count.listings,
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        bannedAt: user.bannedAt?.toISOString() ?? null,
      })),
      count: users.length,
    });
  } catch (error) {
    console.error(error);
    return jsonError("Falha ao carregar contas.", 500);
  }
}

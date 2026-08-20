import { requireAdmin } from "@/lib/admin";
import { jsonError, toListingSummary } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const listings = await prisma.listing.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            verificationStatus: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return Response.json({
      listings: listings.map((listing) => ({
        ...toListingSummary(listing),
        user: {
          id: listing.user.id,
          email: listing.user.email,
          name: listing.user.name,
          verificationStatus: listing.user.verificationStatus,
        },
      })),
      count: listings.length,
    });
  } catch (error) {
    console.error(error);
    return jsonError("Falha ao carregar anúncios.", 500);
  }
}

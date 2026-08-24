import { requireAdmin } from "@/lib/admin";
import { jsonError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const reports = await prisma.listingReport.findMany({
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            status: true,
            city: true,
            neighborhood: true,
            publicCode: true,
            photoUrl: true,
            user: { select: { email: true, name: true } },
          },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    return Response.json({
      reports: reports.map((report) => ({
        id: report.id,
        listingId: report.listingId,
        listingTitle: report.listingTitle,
        reason: report.reason,
        details: report.details,
        status: report.status,
        reviewedAt: report.reviewedAt?.toISOString() ?? null,
        createdAt: report.createdAt.toISOString(),
        listing: report.listing
          ? {
              id: report.listing.id,
              title: report.listing.title,
              status: report.listing.status,
              city: report.listing.city,
              neighborhood: report.listing.neighborhood,
              publicCode: report.listing.publicCode,
              photoUrl: report.listing.photoUrl,
              userName: report.listing.user.name,
              userEmail: report.listing.user.email,
            }
          : null,
      })),
      count: reports.length,
      pendingCount: reports.filter((r) => r.status === "pending").length,
    });
  } catch (error) {
    console.error(error);
    return jsonError("Falha ao carregar denúncias.", 500);
  }
}

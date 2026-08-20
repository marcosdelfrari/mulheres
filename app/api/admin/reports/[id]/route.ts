import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { jsonError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const { id } = await context.params;
    const body = patchSchema.parse(await request.json());

    const report = await prisma.listingReport.findUnique({ where: { id } });
    if (!report) {
      return jsonError("Denúncia não encontrada.", 404);
    }

    if (report.status !== "pending") {
      return jsonError("Esta denúncia já foi analisada.");
    }

    const reviewedAt = new Date();

    if (body.action === "reject") {
      const updated = await prisma.listingReport.update({
        where: { id },
        data: { status: "rejected", reviewedAt },
      });
      return Response.json({
        report: {
          id: updated.id,
          status: updated.status,
          reviewedAt: updated.reviewedAt?.toISOString() ?? null,
        },
      });
    }

    // Aprovar remoção: tira o anúncio do ar e fecha denúncias pendentes do mesmo.
    await prisma.$transaction(async (tx) => {
      if (report.listingId) {
        await tx.listing.updateMany({
          where: { id: report.listingId },
          data: { status: "paused" },
        });
        await tx.listingReport.updateMany({
          where: { listingId: report.listingId, status: "pending" },
          data: { status: "approved", reviewedAt },
        });
      } else {
        await tx.listingReport.update({
          where: { id },
          data: { status: "approved", reviewedAt },
        });
      }
    });

    return Response.json({
      report: {
        id: report.id,
        status: "approved",
        reviewedAt: reviewedAt.toISOString(),
      },
      listingRemoved: Boolean(report.listingId),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Dados inválidos.");
    }
    console.error(error);
    return jsonError("Não foi possível analisar a denúncia.", 500);
  }
}

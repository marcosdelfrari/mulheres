import { z } from "zod";
import { REPORT_REASONS } from "@/lib/reports";
import { jsonError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  listingId: z.string().min(1),
  reason: z.enum(REPORT_REASONS),
  details: z
    .string()
    .trim()
    .max(1000, "Detalhes com no máximo 1000 caracteres.")
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = createSchema.parse(await request.json());

    const listing = await prisma.listing.findFirst({
      where: { id: body.listingId, status: "published" },
      select: { id: true, title: true },
    });

    if (!listing) {
      return jsonError("Anúncio não encontrado.", 404);
    }

    const pending = await prisma.listingReport.count({
      where: {
        listingId: listing.id,
        status: "pending",
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (pending >= 5) {
      return jsonError(
        "Já recebemos várias denúncias deste anúncio. Nossa equipe vai analisar.",
        429,
      );
    }

    const report = await prisma.listingReport.create({
      data: {
        listingId: listing.id,
        listingTitle: listing.title,
        reason: body.reason,
        details: body.details || null,
      },
    });

    return Response.json({
      ok: true,
      id: report.id,
      message: "Denúncia enviada. Vamos analisar em breve.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Dados inválidos.");
    }
    console.error(error);
    return jsonError("Não foi possível enviar a denúncia.", 500);
  }
}

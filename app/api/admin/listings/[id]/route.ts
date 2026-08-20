import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { jsonError, toListingSummary } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  status: z.enum(["draft", "published", "paused"]).optional(),
  isLuxo: z.boolean().optional(),
  /** Horas de destaque a partir de agora (quando isLuxo = true). */
  luxoHours: z.coerce.number().int().min(1).max(720).optional(),
  nsfwPhotos: z.array(z.string().min(1)).optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const { id } = await context.params;
    const existing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: { select: { lastLoginAt: true } },
      },
    });

    if (!existing) {
      return jsonError("Anúncio não encontrado.", 404);
    }

    const body = patchSchema.parse(await request.json());
    const data: {
      status?: "draft" | "published" | "paused";
      isLuxo?: boolean;
      luxoUntil?: Date | null;
      nsfwPhotos?: string[];
    } = {};

    if (body.status !== undefined) {
      data.status = body.status;
    }

    if (body.isLuxo !== undefined) {
      data.isLuxo = body.isLuxo;
      if (!body.isLuxo) {
        data.luxoUntil = null;
      } else {
        const hours = body.luxoHours ?? 4;
        data.luxoUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
      }
    } else if (body.luxoHours !== undefined && existing.isLuxo) {
      data.luxoUntil = new Date(Date.now() + body.luxoHours * 60 * 60 * 1000);
    }

    if (body.nsfwPhotos !== undefined) {
      const allowed = new Set(existing.photos);
      data.nsfwPhotos = body.nsfwPhotos.filter((url) => allowed.has(url));
    }

    if (Object.keys(data).length === 0) {
      return jsonError("Nenhuma alteração informada.");
    }

    const listing = await prisma.listing.update({
      where: { id },
      data,
      include: {
        user: { select: { lastLoginAt: true } },
      },
    });

    return Response.json({
      listing: toListingSummary(listing),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Dados inválidos.");
    }
    console.error(error);
    return jsonError("Não foi possível atualizar o anúncio.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const { id } = await context.params;
    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return jsonError("Anúncio não encontrado.", 404);
    }

    await prisma.listing.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Não foi possível excluir o anúncio.", 500);
  }
}

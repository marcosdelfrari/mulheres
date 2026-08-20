import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { jsonError, toAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z
  .object({
    verificationStatus: z
      .enum(["pending", "submitted", "verified", "rejected"])
      .optional(),
    banned: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.verificationStatus !== undefined || value.banned !== undefined,
    { message: "Nenhuma alteração informada." },
  );

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const { id } = await context.params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Conta não encontrada.", 404);
    }

    const body = patchSchema.parse(await request.json());

    if (body.banned === true && existing.id === auth.user.id) {
      return jsonError("Você não pode banir a própria conta.");
    }

    const data: {
      verificationStatus?: "pending" | "submitted" | "verified" | "rejected";
      verifiedAt?: Date | null;
      bannedAt?: Date | null;
    } = {};

    if (body.verificationStatus !== undefined) {
      data.verificationStatus = body.verificationStatus;
      data.verifiedAt =
        body.verificationStatus === "verified"
          ? existing.verifiedAt ?? new Date()
          : null;
    }

    if (body.banned === true) {
      data.bannedAt = new Date();
    } else if (body.banned === false) {
      data.bannedAt = null;
    }

    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data,
      });

      if (body.banned === true) {
        await tx.session.deleteMany({ where: { userId: id } });
        await tx.listing.updateMany({
          where: { userId: id, status: "published" },
          data: { status: "paused" },
        });
      }

      return updated;
    });

    return Response.json({
      user: {
        ...toAuthUser(user),
        bannedAt: user.bannedAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Dados inválidos.");
    }
    console.error(error);
    return jsonError("Não foi possível atualizar a conta.", 500);
  }
}

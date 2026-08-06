import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, hashToken, jsonError } from "@/lib/auth";

const schema = z.object({
  token: z.string().min(10, "Token inválido."),
  password: z.string().min(6, "Senha com pelo menos 6 caracteres."),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const tokenHash = hashToken(body.token);

    const reset = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
    });

    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      return jsonError("Link inválido ou expirado. Solicite um novo.", 400);
    }

    const passwordHash = await hashPassword(body.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
      prisma.session.deleteMany({ where: { userId: reset.userId } }),
    ]);

    return Response.json({ message: "Senha atualizada. Faça login novamente." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Dados inválidos.");
    }
    console.error(error);
    return jsonError("Não foi possível redefinir a senha.", 500);
  }
}

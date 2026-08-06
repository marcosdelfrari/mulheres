import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createToken, hashToken, jsonError } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().email("E-mail inválido."),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    // Resposta genérica para não revelar se o e-mail existe
    const generic = {
      message:
        "Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.",
    };

    if (!user) {
      return Response.json(generic);
    }

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    const rawToken = createToken();
    await prisma.passwordResetToken.create({
      data: {
        token: hashToken(rawToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
      },
    });

    const origin = new URL(request.url).origin;
    const resetUrl = `${origin}/redefinir-senha?token=${rawToken}`;

    // Sem provedor de e-mail configurado: devolvemos o link para o fluxo funcionar.
    // Em produção, envie por e-mail e remova resetUrl da resposta.
    return Response.json({
      ...generic,
      resetUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Dados inválidos.");
    }
    console.error(error);
    return jsonError("Não foi possível processar a solicitação.", 500);
  }
}

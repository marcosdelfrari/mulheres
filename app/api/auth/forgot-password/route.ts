import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createToken, hashToken, jsonError } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

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

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      new URL(request.url).origin;
    const resetUrl = `${siteUrl}/redefinir-senha?token=${rawToken}`;

    await sendPasswordResetEmail({ to: email, resetUrl });

    return Response.json(generic);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Dados inválidos.");
    }
    console.error(error);
    return jsonError("Não foi possível processar a solicitação.", 500);
  }
}

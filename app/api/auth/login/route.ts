import { cookies } from "next/headers";
import { z } from "zod";
import { toAdminAuthUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  createSession,
  jsonError,
  verifyPassword,
} from "@/lib/auth";
import { assertRecaptcha } from "@/lib/recaptcha";

const schema = z.object({
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
  captchaToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    await assertRecaptcha(body.captchaToken, "login");

    const email = body.email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return jsonError("E-mail ou senha incorretos.", 401);
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      return jsonError("E-mail ou senha incorretos.", 401);
    }

    if (user.bannedAt) {
      return jsonError("Esta conta foi banida e não pode acessar o site.", 403);
    }

    const { token, expiresAt } = await createSession(user.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    });

    return Response.json({ user: toAdminAuthUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Dados inválidos.");
    }
    if (error instanceof Error && /anti-bot|reCAPTCHA|suspeita/i.test(error.message)) {
      return jsonError(error.message, 403);
    }
    console.error(error);
    return jsonError("Não foi possível entrar.", 500);
  }
}

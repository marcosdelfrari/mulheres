import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  createSession,
  hashPassword,
  jsonError,
  toAuthUser,
} from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(6, "Senha com pelo menos 6 caracteres."),
  role: z.enum(["cliente", "acompanhante"]).default("acompanhante"),
  phone: z.string().trim().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("Este e-mail já está cadastrado.", 409);
    }

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email,
        passwordHash,
        role: body.role,
        phone: body.phone || null,
        verificationStatus: body.role === "cliente" ? "verified" : "pending",
        verifiedAt: body.role === "cliente" ? new Date() : null,
      },
    });

    const { token, expiresAt } = await createSession(user.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    });

    return Response.json({ user: toAuthUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Dados inválidos.");
    }
    console.error(error);
    return jsonError("Não foi possível criar a conta.", 500);
  }
}

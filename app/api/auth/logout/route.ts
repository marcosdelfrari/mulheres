import { cookies } from "next/headers";
import { SESSION_COOKIE, destroySession, jsonError } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    await destroySession(token);
    cookieStore.set(SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Não foi possível sair.", 500);
  }
}

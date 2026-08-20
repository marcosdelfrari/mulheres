import { toAdminAuthUser } from "@/lib/admin";
import { getCurrentUser, jsonError } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ user: null });
    }
    return Response.json({ user: toAdminAuthUser(user) });
  } catch (error) {
    console.error(error);
    return jsonError("Falha ao carregar sessão.", 500);
  }
}

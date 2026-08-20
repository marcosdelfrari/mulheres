import { getCurrentUser, jsonError, toAuthUser } from "@/lib/auth";
import type { User as DbUser } from "@/lib/generated/prisma/client";

/** E-mails com acesso admin (`ADMIN_EMAILS`, separados por vírgula). */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export async function requireAdmin(): Promise<
  { user: DbUser } | { error: Response }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: jsonError("Faça login para continuar.", 401) };
  }
  if (!isAdminEmail(user.email)) {
    return { error: jsonError("Acesso restrito a administradores.", 403) };
  }
  return { user };
}

export function toAdminAuthUser(user: DbUser) {
  return {
    ...toAuthUser(user),
    isAdmin: isAdminEmail(user.email),
  };
}

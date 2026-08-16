/** Considerada online se o último login foi há menos deste intervalo. */
export const ONLINE_WINDOW_MS = 30 * 60 * 1000;

export function isOnlineFromLastLogin(
  lastLoginAt: Date | string | null | undefined,
) {
  if (!lastLoginAt) return false;
  const at =
    typeof lastLoginAt === "string" ? new Date(lastLoginAt) : lastLoginAt;
  if (Number.isNaN(at.getTime())) return false;
  return Date.now() - at.getTime() < ONLINE_WINDOW_MS;
}

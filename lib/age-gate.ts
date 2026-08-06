/** Cookie de verificação etária (cliente). Nome em EN; conteúdo/UX em PT. */
export const AGE_VERIFIED_COOKIE = "age_verified";
export const AGE_VERIFIED_VALUE = "1";
/** 1 ano */
export const AGE_VERIFIED_MAX_AGE_SEC = 60 * 60 * 24 * 365;
export const AGE_SCAN_MS = 3000;
export const AGE_MINIMUM = 18;

export function readAgeVerifiedCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .some(
      (part) =>
        part === `${AGE_VERIFIED_COOKIE}=${AGE_VERIFIED_VALUE}` ||
        part.startsWith(`${AGE_VERIFIED_COOKIE}=${AGE_VERIFIED_VALUE};`),
    );
}

export function writeAgeVerifiedCookie() {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${AGE_VERIFIED_COOKIE}=${AGE_VERIFIED_VALUE}; Path=/; Max-Age=${AGE_VERIFIED_MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

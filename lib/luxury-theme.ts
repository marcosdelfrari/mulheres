import { CITY_HUBS, isKnownStateSlug } from "@/lib/location-hubs";

export const LUXURY_PATHS = [
  "/",
  "/login",
  "/criar-conta",
  "/recuperar-senha",
  "/redefinir-senha",
] as const;

/**
 * ISR/prerender da rota raiz (Vercel) às vezes entrega pathname vazio em vez de "/".
 * Sem isso, Header/Footer caem no tema claro na home.
 */
export function normalizePathname(pathname: string | null | undefined): string {
  if (pathname == null || pathname === "") return "/";
  return pathname;
}

/** Header transparente (estilo home) em hubs de estado/cidade (não bairro). */
export function isLocationHubPath(pathname: string | null | undefined) {
  const path = normalizePathname(pathname);
  const parts = path.split("/").filter(Boolean);
  if (parts.length < 1 || parts.length > 2) return false;
  if (!isKnownStateSlug(parts[0])) return false;
  if (parts.length === 1) return true;
  return CITY_HUBS.some(
    (h) => h.stateSlug === parts[0] && h.citySlug === parts[1],
  );
}

/** Home ou hub com hero — nav absoluta/transparente sobre o roxo. */
export function isHomeLikePath(pathname: string | null | undefined) {
  const path = normalizePathname(pathname);
  return path === "/" || isLocationHubPath(path);
}

/** Header/footer roxo nestas rotas; hubs locais também usam o shell luxury. */
export function isLuxuryPath(pathname: string | null | undefined) {
  const path = normalizePathname(pathname);
  if (isLocationHubPath(path)) return true;
  return LUXURY_PATHS.some(
    (p) => path === p || (p !== "/" && path.startsWith(p)),
  );
}

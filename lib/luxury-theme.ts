import { CITY_HUBS, isKnownStateSlug } from "@/lib/location-hubs";

export const LUXURY_PATHS = [
  "/",
  "/login",
  "/criar-conta",
  "/recuperar-senha",
  "/redefinir-senha",
] as const;

/** Header transparente (estilo home) em hubs de estado/cidade (não bairro). */
export function isLocationHubPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 1 || parts.length > 2) return false;
  if (!isKnownStateSlug(parts[0])) return false;
  if (parts.length === 1) return true;
  return CITY_HUBS.some(
    (h) => h.stateSlug === parts[0] && h.citySlug === parts[1],
  );
}

/** Header/footer roxo nestas rotas; hubs locais também usam o shell luxury. */
export function isLuxuryPath(pathname: string) {
  if (isLocationHubPath(pathname)) return true;
  return LUXURY_PATHS.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(path)),
  );
}

export const LUXURY_PATHS = [
  "/",
  "/login",
  "/criar-conta",
  "/recuperar-senha",
  "/redefinir-senha",
] as const;

/** Header/footer roxo só nestas rotas; conteúdo da home abaixo do hero fica claro. */
export function isLuxuryPath(pathname: string) {
  return LUXURY_PATHS.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(path)),
  );
}

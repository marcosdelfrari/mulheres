"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isLocationHubPath, isLuxuryPath } from "@/lib/luxury-theme";

export function Header() {
  const { user } = useAuth();
  const pathname = usePathname();
  const luxury = isLuxuryPath(pathname);
  const homeLike = pathname === "/" || isLocationHubPath(pathname);

  return (
    <header
      className={
        homeLike
          ? "absolute inset-x-0 top-0 z-50 border-b border-transparent bg-transparent"
          : luxury
            ? "relative z-50 border-b border-white/5 bg-[#0c0414]/80 backdrop-blur-md"
            : "relative z-50 border-b border-gray-100 bg-white"
      }
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-serif leading-none">
          <span className="inline-flex items-baseline gap-1 sm:gap-1.5">
            <span
              className={`text-lg font-normal italic tracking-tight sm:text-2xl ${
                luxury ? "text-white" : "text-gray-900"
              }`}
            >
              Mulheres
            </span>
            <span className="text-base font-bold italic text-luxury-accent sm:text-lg">
              de
            </span>
            <span className="text-lg font-bold italic tracking-tight text-luxury-accent sm:text-[1.35rem]">
              Luxo
            </span>
          </span>
        </Link>

        <nav
          className={`hidden items-center gap-8 text-sm font-thin uppercase tracking-widest sm:flex ${
            luxury ? "text-white/60" : "text-gray-500"
          }`}
        >
          <Link
            href="/acompanhantes"
            className={
              luxury
                ? "hover:text-luxury-accent transition-colors"
                : "hover:text-purple-800 transition-colors"
            }
          >
            As modelos
          </Link>
          <Link
            href="/criar-conta?role=acompanhante"
            className={
              luxury
                ? "hover:text-luxury-accent transition-colors"
                : "hover:text-purple-800 transition-colors"
            }
          >
            Anunciar
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <>
              <span
                className={`hidden max-w-[10rem] truncate text-sm font-bold sm:block ${
                  luxury ? "text-white/80" : "text-gray-900"
                }`}
              >
                {user.name}
              </span>
              <Link
                href="/conta"
                aria-label="Meu perfil"
                title="Meu perfil"
                className={
                  luxury
                    ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/90 transition-all hover:border-white/25 hover:bg-white/5 hover:text-luxury-accent"
                    : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                }
              >
                <UserRound className="h-5 w-5" strokeWidth={2} aria-hidden />
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className={
                luxury
                  ? "rounded-full bg-luxury-accent px-5 py-2 text-sm font-semibold tracking-wide text-[#0c0414] transition-all hover:bg-luxury-accent-hover active:scale-[0.98]"
                  : "rounded-full bg-[#0c0414] px-5 py-2 text-sm font-semibold tracking-wide text-white transition-all hover:bg-purple-900 active:scale-[0.98]"
              }
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

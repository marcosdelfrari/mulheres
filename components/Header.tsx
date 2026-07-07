"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-serif leading-none">
          <span className="inline-flex items-baseline gap-1 sm:gap-1.5">
            <span className="text-lg font-normal italic tracking-tight text-gray-900 sm:text-2xl">
              Mulheres
            </span>
            <span className="text-base font-bold italic text-purple-700 sm:text-lg">de</span>
            <span className="text-lg font-bold italic tracking-tight text-purple-700 sm:text-[1.35rem]">
              Luxo
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-black uppercase tracking-widest text-gray-500 sm:flex">
          <Link href="/catalogo" className="hover:text-purple-700 transition-colors">
            Catálogo
          </Link>
          <Link href="/contato" className="hover:text-purple-700 transition-colors">
            Contato
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden text-sm font-bold text-gray-900 sm:block">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-purple-700 px-5 py-2 text-sm font-semibold tracking-wide text-white transition-all hover:bg-purple-800 active:scale-[0.98]"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

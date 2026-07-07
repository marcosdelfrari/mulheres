"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATS = [
  { value: "10+", label: "bairros em BH" },
  { value: "WhatsApp", label: "contato direto" },
  { value: "BH+", label: "região metropolitana" },
  { value: "100%", label: "perfis verificados" },
] as const;

export function HomeHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/catalogo?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/catalogo");
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-gray-100 bg-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      >
        <div className="absolute -right-16 top-8 h-72 w-72 rounded-full bg-purple-100 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-purple-50 blur-2xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50 px-4 py-1.5 text-sm font-bold text-purple-800">
            <span className="h-2 w-2 rounded-full bg-purple-600" aria-hidden />
            Lançamento em Minas Gerais
          </p>

          <h1 className="mt-5 font-serif text-3xl font-bold italic leading-[1.1] tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem]">
            Acompanhantes de{" "}
            <span className="text-purple-700">luxo</span> em Belo Horizonte
          </h1>

          <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-600">
            Estamos começando em BH e região metropolitana. Perfis verificados,
            busca por bairro e contato direto — com discrição e respeito.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5"
              >
                <dt className="text-xl font-black tracking-tight text-purple-700 sm:text-2xl">
                  {stat.value}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-gray-600">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login?role=acompanhante"
              className="rounded-2xl bg-purple-700 px-8 py-4 text-center text-base font-bold text-white hover:bg-purple-800 transition-all active:scale-95"
            >
              Anunciar como acompanhante
            </Link>
            <Link
              href="/login?role=cliente"
              className="rounded-2xl border-2 border-purple-700 px-8 py-4 text-center text-base font-bold text-purple-700 hover:bg-purple-50 transition-all active:scale-95"
            >
              Cadastrar como cliente
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="relative mt-10 max-w-lg">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por bairro em Belo Horizonte..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-4.5 pl-6 pr-16 text-base text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-600/5 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-700 text-white hover:bg-purple-800 transition-all"
              aria-label="Buscar"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </div>

        <div className="relative hidden justify-center lg:flex">
          <div className="absolute -right-4 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-purple-100" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-80 w-64 items-end justify-center overflow-hidden rounded-t-[5rem] bg-gradient-to-b from-purple-200 to-purple-50">
              <div className="mb-0 h-72 w-56 rounded-t-[4rem] bg-gradient-to-b from-purple-300 to-purple-400 opacity-80" />
            </div>
            <div className="relative -mt-8 rounded-3xl bg-white border border-gray-100 px-6 py-4 text-center">
              <p className="text-base font-black leading-snug text-purple-700">
                Respeito, Segurança
                <br />& Dignidade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

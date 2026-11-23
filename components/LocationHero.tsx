"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resolveCatalogSearch } from "@/lib/catalog-search-resolve";

export interface LocationHeroProps {
  eyebrow: string;
  /** Nome da localização no H1 (cidade ou estado) */
  locationName: string;
  subtitle: string;
  searchPlaceholder?: string;
  catalogHref?: string;
}

export function LocationHero({
  eyebrow,
  locationName,
  subtitle,
  searchPlaceholder = "Qual cidade ou bairro você procura?",
  catalogHref = "/acompanhantes",
}: LocationHeroProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (term) {
      const resolved = resolveCatalogSearch(term);
      if (resolved.kind === "neighborhood" || resolved.kind === "city") {
        router.push(resolved.hubPath);
        return;
      }
      router.push(`/acompanhantes?search=${encodeURIComponent(term)}`);
    } else {
      router.push(catalogHref);
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-white/5 pt-22 pb-9 sm:pt-32 sm:pb-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-20 sm:opacity-30"
        aria-hidden
      >
        <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-luxury-accent/10 blur-[100px] sm:h-96 sm:w-96 sm:blur-[120px]" />
        <div className="absolute bottom-0 -left-32 h-72 w-72 rounded-full bg-purple-900/20 blur-[100px] sm:h-96 sm:w-96 sm:blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-luxury-accent/90 sm:gap-2 sm:rounded-full sm:border sm:border-luxury-accent/20 sm:bg-luxury-accent/5 sm:px-4 sm:py-1.5 sm:text-xs sm:font-bold sm:tracking-widest sm:text-luxury-accent">
            <span
              className="h-px w-5 bg-luxury-accent/60 sm:h-1.5 sm:w-1.5 sm:rounded-full sm:bg-luxury-accent sm:animate-pulse"
              aria-hidden
            />
            {eyebrow}
          </p>

          <h1 className="mt-3.5 text-balance font-serif text-[2rem] font-normal italic leading-[1.14] tracking-tight text-white sm:mt-6 sm:text-5xl sm:font-bold sm:leading-[1.1] lg:text-[3.5rem]">
            Acompanhantes <br className="hidden sm:inline" />
            de <span className="text-luxury-accent">luxo</span> em{" "}
            <br className="hidden sm:inline" />
            {locationName}
          </h1>

          <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-white/55 sm:mt-6 sm:max-w-xl sm:text-lg sm:font-normal sm:text-white/60">
            {subtitle}
          </p>

          <form
            onSubmit={handleSubmit}
            className="relative mt-6 max-w-lg sm:mt-10"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-12 w-full rounded-full border border-white/12 bg-white/[0.04] pr-12 pl-5 text-base text-white placeholder:text-white/35 transition-all focus:border-luxury-accent/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-luxury-accent/5 focus:outline-none sm:h-auto sm:border-white/10 sm:bg-white/5 sm:py-5 sm:pr-16 sm:pl-8 sm:placeholder:text-white/30"
            />
            <button
              type="submit"
              className="absolute top-1.5 right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-luxury-accent text-[#0c0414] transition-all hover:bg-luxury-accent-hover active:scale-95 sm:top-2 sm:right-2 sm:h-12 sm:w-12"
              aria-label="Buscar"
            >
              <svg
                className="h-4 w-4 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.25}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3 pl-1 text-xs tracking-wide text-white/45 sm:mt-5 sm:max-w-lg sm:justify-center sm:pl-0 sm:text-base sm:text-white/50">
            <Link
              href={catalogHref}
              className="transition-colors hover:text-luxury-accent sm:hidden"
            >
              Ver modelos
            </Link>
            <span className="text-white/20 sm:hidden" aria-hidden>
              ·
            </span>
            <Link
              href="/criar-conta?role=acompanhante"
              className="transition-colors hover:text-white/75"
            >
              Crie seu anúncio
            </Link>
          </div>
        </div>

        <div className="relative hidden justify-center lg:flex">
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative h-[480px] w-72 overflow-hidden rounded-t-[140px] border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-1">
              <div className="h-full w-full rounded-t-[136px] bg-gradient-to-b from-luxury-accent/20 to-[#0c0414] opacity-80" />
            </div>

            <div className="relative -mt-16 rounded-3xl border border-white/10 bg-[#0c0414] px-8 py-6 text-center shadow-2xl shadow-black">
              <p className="font-serif text-lg italic leading-snug text-luxury-accent">
                &ldquo;Onde a sofisticação
                <br />
                encontra o desejo.&rdquo;
              </p>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-luxury-accent/5 opacity-50" />
        </div>
      </div>
    </section>
  );
}

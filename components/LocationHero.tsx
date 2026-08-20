"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    if (query.trim()) {
      router.push(`/acompanhantes?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(catalogHref);
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-white/5 pb-12 pt-28 sm:pb-20 sm:pt-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
      >
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-luxury-accent/10 blur-[120px]" />
        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-luxury-accent/20 bg-luxury-accent/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-luxury-accent">
            <span
              className="h-1.5 w-1.5 rounded-full bg-luxury-accent animate-pulse"
              aria-hidden
            />
            {eyebrow}
          </p>

          <h1 className="mt-6 font-serif text-4xl font-bold italic leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
            Acompanhantes <br />
            de <span className="text-luxury-accent">luxo</span> em <br />
            {locationName}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
            {subtitle}
          </p>

          <form onSubmit={handleSubmit} className="relative mt-10 max-w-lg">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-full border border-white/10 bg-white/5 py-5 pl-8 pr-16 text-base text-white placeholder:text-white/30 focus:border-luxury-accent/50 focus:outline-none focus:ring-4 focus:ring-luxury-accent/5 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 flex h-12 w-12 items-center justify-center rounded-full bg-luxury-accent text-[#0c0414] transition-all hover:bg-luxury-accent-hover active:scale-90"
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

          <p className="mt-5 max-w-lg text-center text-base text-white/50">
            <Link
              href="/criar-conta?role=acompanhante"
              className="transition-colors hover:text-white/70"
            >
              Anunciar perfil
            </Link>
          </p>
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

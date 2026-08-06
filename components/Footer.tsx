"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GENERIC_PLATFORMS_PHRASE } from "@/lib/brand-copy";
import { BH_NEIGHBORHOODS, SITE_NAME } from "@/lib/seo";
import { TrademarkDisclaimer } from "@/components/TrademarkDisclaimer";
import { neighborhoodHubPath, getCityHub } from "@/lib/location-hubs";
import { isLuxuryPath } from "@/lib/luxury-theme";

const bhHub = getCityHub("minas-gerais", "belo-horizonte");

export function Footer() {
  const pathname = usePathname();
  const luxury = isLuxuryPath(pathname);
  const platforms = GENERIC_PLATFORMS_PHRASE;

  return (
    <footer
      className={
        luxury
          ? "border-t border-white/5 bg-[#0c0414]"
          : "border-t border-gray-200 bg-gray-50"
      }
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-lg leading-none">
              <span
                className={`font-normal italic ${luxury ? "text-white" : "text-gray-900"}`}
              >
                Mulheres
              </span>{" "}
              <span className="font-bold italic text-luxury-accent">
                de Luxo
              </span>
            </p>
            <p
              className={`mt-2 text-sm leading-relaxed ${
                luxury ? "text-white/40" : "text-gray-600"
              }`}
            >
              Catálogo de acompanhantes em Belo Horizonte e todo o Brasil.
              Perfis verificados, filtros por bairro e contato direto.
              Opção para quem busca em {platforms}.
            </p>
          </div>

          <div>
            <h2
              className={`font-serif text-sm font-semibold italic tracking-tight ${
                luxury ? "text-white" : "text-gray-900"
              }`}
            >
              Belo Horizonte — MG
            </h2>
            <ul
              className={`mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-sm ${
                luxury ? "text-white/40" : "text-gray-600"
              }`}
            >
              <li>
                <Link
                  href="/minas-gerais/belo-horizonte"
                  className={
                    luxury
                      ? "font-semibold text-white/60 hover:text-luxury-accent hover:underline"
                      : "font-semibold text-purple-800 hover:text-luxury-accent hover:underline"
                  }
                >
                  Acompanhantes em BH
                </Link>
              </li>
              {bhHub &&
                BH_NEIGHBORHOODS.slice(0, 6).map((bairro) => {
                  const hood = bhHub.neighborhoods.find(
                    (n) => n.name === bairro,
                  );
                  const href = hood
                    ? neighborhoodHubPath(bhHub, hood)
                    : `/catalogo?region=Minas%20Gerais&search=${encodeURIComponent(bairro)}`;
                  return (
                    <li key={bairro}>
                      <Link
                        href={href}
                        className={
                          luxury
                            ? "hover:text-luxury-accent hover:underline"
                            : "hover:text-luxury-accent hover:underline"
                        }
                      >
                        {bairro}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>

          <div>
            <h2
              className={`font-serif text-sm font-semibold italic tracking-tight ${
                luxury ? "text-white" : "text-gray-900"
              }`}
            >
              Guias
            </h2>
            <ul
              className={`mt-3 space-y-1.5 text-sm ${
                luxury ? "text-white/40" : "text-gray-600"
              }`}
            >
              {[
                ["/guias/como-funciona", "Como funciona"],
                ["/guias/alternativas-em-bh", "Alternativas em BH"],
                ["/catalogo", "Catálogo completo"],
                ["/sao-paulo/sao-paulo", "Acompanhantes em SP"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={
                      luxury
                        ? "hover:text-luxury-accent hover:underline"
                        : "hover:text-luxury-accent hover:underline"
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2
              className={`font-serif text-sm font-semibold italic tracking-tight ${
                luxury ? "text-white" : "text-gray-900"
              }`}
            >
              Legal
            </h2>
            <ul
              className={`mt-3 space-y-1.5 text-sm ${
                luxury ? "text-white/40" : "text-gray-600"
              }`}
            >
              {[
                ["/contato", "Contato"],
                ["/privacidade", "Privacidade"],
                ["/termos", "Termos de uso"],
                ["/mais-de-18", "Conteúdo +18"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={
                      luxury
                        ? "hover:text-luxury-accent hover:underline"
                        : "hover:text-luxury-accent hover:underline"
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <TrademarkDisclaimer
          className={luxury ? "mt-6 text-white/20" : "mt-6 text-gray-400"}
        />

        <p
          className={`mt-4 border-t pt-6 text-center text-xs ${
            luxury
              ? "border-white/5 text-white/20"
              : "border-gray-200 text-gray-400"
          }`}
        >
          © 2026 {SITE_NAME}. Conteúdo destinado a maiores de 18 anos.
        </p>
      </div>
    </footer>
  );
}

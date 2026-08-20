"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GENERIC_PLATFORMS_PHRASE } from "@/lib/brand-copy";
import { SITE_NAME } from "@/lib/seo";
import { TrademarkDisclaimer } from "@/components/TrademarkDisclaimer";
import {
  CITY_HUBS,
  cityHubPath,
  STATE_HUBS,
  stateHubPath,
} from "@/lib/location-hubs";
import { isLuxuryPath } from "@/lib/luxury-theme";

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
              As modelos e acompanhantes em todo o Brasil. Perfis verificados,
              filtros por cidade e bairro e contato direto. Opção para quem
              busca em {platforms}.
            </p>
          </div>

          <div>
            <h2
              className={`font-serif text-sm font-semibold italic tracking-tight ${
                luxury ? "text-white" : "text-gray-900"
              }`}
            >
              Capitais
            </h2>
            <ul
              className={`mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-sm ${
                luxury ? "text-white/40" : "text-gray-600"
              }`}
            >
              {CITY_HUBS.map((hub) => (
                <li key={cityHubPath(hub)}>
                  <Link
                    href={cityHubPath(hub)}
                    className={
                      luxury
                        ? "hover:text-luxury-accent hover:underline"
                        : "hover:text-luxury-accent hover:underline"
                    }
                  >
                    {hub.shortName}
                  </Link>
                </li>
              ))}
            </ul>
            <h2
              className={`mt-5 font-serif text-sm font-semibold italic tracking-tight ${
                luxury ? "text-white" : "text-gray-900"
              }`}
            >
              Estados
            </h2>
            <ul
              className={`mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-sm ${
                luxury ? "text-white/40" : "text-gray-600"
              }`}
            >
              {STATE_HUBS.map((hub) => (
                <li key={hub.stateSlug}>
                  <Link
                    href={stateHubPath(hub)}
                    className={
                      luxury
                        ? "hover:text-luxury-accent hover:underline"
                        : "hover:text-luxury-accent hover:underline"
                    }
                  >
                    {hub.uf}
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
                ["/acompanhantes", "Todas as modelos"],
                ["/minas-gerais/belo-horizonte", "Acompanhantes em BH"],
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

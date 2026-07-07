import Link from "next/link";
import { BH_NEIGHBORHOODS, SEARCH_ALTERNATIVES, SITE_NAME } from "@/lib/seo";

export function Footer() {
  const alternatives = SEARCH_ALTERNATIVES.join(", ");

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-serif text-lg leading-none">
              <span className="font-normal italic text-gray-900">Mulheres</span>{" "}
              <span className="font-bold italic text-purple-700">de Luxo</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Catálogo de acompanhantes em Belo Horizonte e todo o Brasil.
              Perfis verificados, filtros por bairro e contato direto.
              Alternativa moderna ao {alternatives}.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-sm font-semibold italic tracking-tight text-gray-900">
              Belo Horizonte — MG
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-sm text-gray-600">
              <li>
                <Link
                  href="/minas-gerais/belo-horizonte"
                  className="font-semibold text-purple-700 hover:underline"
                >
                  Acompanhantes em BH
                </Link>
              </li>
              {BH_NEIGHBORHOODS.slice(0, 6).map((bairro) => (
                <li key={bairro}>
                  <Link
                    href={`/catalogo?region=Minas%20Gerais&search=${encodeURIComponent(bairro)}`}
                    className="hover:text-purple-700 hover:underline"
                  >
                    {bairro}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-sm font-semibold italic tracking-tight text-gray-900">
              Navegação
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
              <li>
                <Link href="/catalogo" className="hover:text-purple-700 hover:underline">
                  Catálogo completo
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogo?region=Minas%20Gerais"
                  className="hover:text-purple-700 hover:underline"
                >
                  Acompanhantes em Minas Gerais
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-purple-700 hover:underline">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          © 2026 {SITE_NAME}. Conteúdo destinado a maiores de 18 anos.
        </p>
      </div>
    </footer>
  );
}

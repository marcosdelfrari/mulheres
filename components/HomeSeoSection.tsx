import Link from "next/link";
import { SEARCH_ALTERNATIVES } from "@/lib/seo";

export function HomeSeoSection() {
  const alternatives = SEARCH_ALTERNATIVES.join(", ");

  return (
    <section className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="font-serif text-2xl font-bold italic text-gray-900">
            Acompanhantes em Belo Horizonte — MG
          </h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            Estamos começando em Belo Horizonte. Encontre acompanhantes verificadas
            em bairros como Savassi, Lourdes, Funcionários e Pampulha. Se você
            costuma buscar no {alternatives}, conheça o Mulheres — catálogo
            moderno com filtros por bairro, preço e contato direto via WhatsApp.
          </p>
          <Link
            href="/minas-gerais/belo-horizonte"
            className="mt-5 inline-flex rounded-2xl bg-purple-700 px-6 py-3 text-sm font-bold text-white hover:bg-purple-800 transition-colors"
          >
            Ver acompanhantes em BH →
          </Link>
        </div>
      </div>
    </section>
  );
}

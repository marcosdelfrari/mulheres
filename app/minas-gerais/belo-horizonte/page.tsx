import Link from "next/link";
import { CompanionCard } from "@/components/CompanionCard";
import { JsonLd } from "@/components/JsonLd";
import { getCompanionsByCity } from "@/lib/mock-data";
import {
  absoluteUrl,
  BH_FAQ,
  BH_NEIGHBORHOODS,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
  buildBhCatalogMetadata,
  SEARCH_ALTERNATIVES,
} from "@/lib/seo";

export const metadata = buildBhCatalogMetadata();

export default function BeloHorizontePage() {
  const companions = getCompanionsByCity("Belo Horizonte");
  const alternatives = SEARCH_ALTERNATIVES.join(", ");

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Início", url: absoluteUrl("/") },
            { name: "Minas Gerais", url: absoluteUrl("/catalogo?region=Minas%20Gerais") },
            { name: "Belo Horizonte", url: absoluteUrl("/minas-gerais/belo-horizonte") },
          ]),
          buildItemListJsonLd(
            companions,
            "Acompanhantes em Belo Horizonte, MG"
          ),
          buildFaqJsonLd(BH_FAQ),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1.5">            <li>
              <Link href="/" className="hover:text-purple-700">
                Início
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href="/catalogo?region=Minas%20Gerais"
                className="hover:text-purple-700"
              >
                Minas Gerais
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-semibold text-gray-900">Belo Horizonte</li>
          </ol>
        </nav>

        <header className="mt-6 max-w-3xl">
          <h1 className="font-serif text-3xl font-bold italic text-gray-900 sm:text-4xl">
            Acompanhantes em Belo Horizonte, MG
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Encontre acompanhantes em BH com perfis verificados, fotos reais e
            contato direto via WhatsApp. Se você busca no{" "}
            {alternatives}, o <strong>Mulheres</strong> é a alternativa moderna para Belo
            Horizonte — com filtros por bairro, distância e serviços.
          </p>
        </header>

        <section className="mt-8 flex flex-wrap gap-2">
          {BH_NEIGHBORHOODS.map((bairro) => (
            <Link
              key={bairro}
              href={`/catalogo?region=Minas%20Gerais&search=${encodeURIComponent(bairro)}`}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:border-purple-300 hover:text-purple-700"
            >
              {bairro}
            </Link>
          ))}
        </section>

        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-serif text-2xl font-bold italic text-gray-900">
              {companions.length} acompanhantes em BH
            </h2>
            <Link
              href="/catalogo?region=Minas%20Gerais&search=Belo%20Horizonte"
              className="text-sm font-bold text-purple-700 hover:underline"
            >
              Ver catálogo completo →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {companions.map((c) => (
              <CompanionCard
                key={c.id}
                companion={c}
                locationMode="neighborhood"
              />
            ))}
          </div>
        </section>

        <section className="mt-14 max-w-3xl">
          <h2 className="font-serif text-2xl font-bold italic text-gray-900">
            Por que escolher o Mulheres em Belo Horizonte?
          </h2>
          <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Belo Horizonte concentra milhares de buscas por acompanhantes
              todos os meses. Plataformas como <strong>Fatal Model</strong>,{" "}
              <strong>Garota com Local</strong>,{" "}
              <strong>Photoacompanhante</strong> e <strong>Skokka</strong> são
              referências no mercado — o Mulheres reúne o que há de melhor: perfis
              verificados, interface rápida e filtros precisos por bairros como
              Savassi, Lourdes e Funcionários.
            </p>
            <p>
              Navegue pelo catálogo, compare preços e entre em contato direto
              com a acompanhante. Sem intermediários, sem complicação.
            </p>
          </div>
        </section>

        <section className="mt-14 max-w-3xl" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="font-serif text-2xl font-bold italic text-gray-900">
            Perguntas frequentes — Acompanhantes BH
          </h2>
          <dl className="mt-6 space-y-6">
            {BH_FAQ.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-gray-100 bg-white p-5"
              >
                <dt className="font-serif font-semibold text-gray-900">{faq.question}</dt>
                <dd className="mt-2 text-gray-600 leading-relaxed">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}

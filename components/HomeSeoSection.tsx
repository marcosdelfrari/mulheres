import Link from "next/link";
import { GENERIC_PLATFORMS_PHRASE } from "@/lib/brand-copy";
import { getCityHub, neighborhoodHubPath } from "@/lib/location-hubs";

const bhHub = getCityHub("minas-gerais", "belo-horizonte");

export function HomeSeoSection() {
  const alternatives = GENERIC_PLATFORMS_PHRASE;

  return (
    <section className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="font-serif text-2xl font-bold italic text-gray-900">
            Acompanhantes de luxo em Belo Horizonte — MG
          </h2>

          {bhHub && (
            <div className="mt-4 flex flex-wrap gap-2">
              {bhHub.neighborhoods.slice(0, 5).map((bairro) => (
                <Link
                  key={bairro.slug}
                  href={neighborhoodHubPath(bhHub, bairro)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 hover:border-purple-300 hover:text-luxury-accent"
                >
                  {bairro.name}
                </Link>
              ))}
            </div>
          )}

          <p className="mt-4 leading-relaxed text-gray-600">
            Estamos começando em Belo Horizonte com curadoria focada em
            discrição e sofisticação. Encontre acompanhantes verificadas em
            bairros como Savassi, Lourdes, Funcionários e Pampulha. Se você
            costuma buscar em {alternatives}, conheça o Mulheres — catálogo
            moderno com filtros por bairro, preço e contato direto via WhatsApp.
          </p>

          <Link
            href="/minas-gerais/belo-horizonte"
            className="mt-5 inline-flex rounded-full bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-black"
          >
            Ver acompanhantes em BH →
          </Link>
        </div>
      </div>
    </section>
  );
}

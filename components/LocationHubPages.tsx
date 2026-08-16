import Link from "next/link";
import { CompanionCard } from "@/components/CompanionCard";
import { JsonLd } from "@/components/JsonLd";
import { getCompanionsByCity } from "@/lib/listings";
import type { CityHub, NeighborhoodHub } from "@/lib/location-hubs";
import {
  cityHubPath,
  getNeighborhoodCompanions,
  getPublishedNeighborhoodHubs,
  neighborhoodHubPath,
} from "@/lib/location-hubs";
import {
  absoluteUrl,
  BH_FAQ,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
} from "@/lib/seo";
import { GENERIC_PLATFORMS_PHRASE } from "@/lib/brand-copy";

interface CityHubPageProps {
  hub: CityHub;
}

export async function CityHubPage({ hub }: CityHubPageProps) {
  const cityCompanions = await getCompanionsByCity(hub.city);
  const faqs = hub.faq.length > 0 ? hub.faq : BH_FAQ;
  const neighborhoods = getPublishedNeighborhoodHubs(hub, cityCompanions);

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Início", url: absoluteUrl("/") },
            {
              name: hub.region,
              url: absoluteUrl(
                `/catalogo?region=${encodeURIComponent(hub.region)}`,
              ),
            },
            { name: hub.city, url: absoluteUrl(cityHubPath(hub)) },
          ]),
          buildItemListJsonLd(cityCompanions, hub.title),
          buildFaqJsonLd(faqs),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-luxury-accent">
                Início
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={`/catalogo?region=${encodeURIComponent(hub.region)}`}
                className="hover:text-luxury-accent"
              >
                {hub.region}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-semibold text-gray-900">{hub.city}</li>
          </ol>
        </nav>

        <header className="mt-6 max-w-3xl">
          <h1 className="font-serif text-3xl font-bold italic text-gray-900 sm:text-4xl">
            {hub.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            {hub.intro}
            {hub.city === "Belo Horizonte" && (
              <>
                {" "}
                Se você já usa {GENERIC_PLATFORMS_PHRASE}, o <strong>Mulheres</strong>{" "}
                é uma opção com filtros por bairro e perfis verificados.
              </>
            )}
          </p>
        </header>

        {neighborhoods.length > 0 && (
          <section className="mt-8 flex flex-wrap gap-2">
            {neighborhoods.map((bairro) => (
              <Link
                key={bairro.slug}
                href={neighborhoodHubPath(hub, bairro)}
                className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:border-purple-300 hover:text-luxury-accent"
              >
                {bairro.name}
              </Link>
            ))}
          </section>
        )}

        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-light tracking-wide text-gray-900">
              {cityCompanions.length} acompanhantes em{" "}
              {hub.city === "Belo Horizonte" ? "BH" : hub.city}
            </h2>
            <Link
              href={`/catalogo?region=${encodeURIComponent(hub.region)}&search=${encodeURIComponent(hub.city)}`}
              className="text-sm font-bold text-purple-800 hover:text-luxury-accent hover:underline"
            >
              Ver catálogo completo →
            </Link>
          </div>

          {cityCompanions.length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-8 text-gray-600">
              Nenhum perfil publicado nesta cidade no momento.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cityCompanions.map((c) => (
                <CompanionCard
                  key={c.id}
                  companion={c}
                  locationMode="neighborhood"
                />
              ))}
            </div>
          )}
        </section>

        {hub.city === "Belo Horizonte" && (
          <section className="mt-14 max-w-3xl">
            <h2 className="text-2xl font-light tracking-wide text-gray-900">
              Por que escolher o Mulheres em Belo Horizonte?
            </h2>
            <div className="mt-4 space-y-4 leading-relaxed text-gray-600">
              <p>
                Belo Horizonte concentra milhares de buscas por acompanhantes
                todos os meses. O Mulheres reúne perfis verificados, interface
                rápida e filtros precisos por bairros como Savassi, Lourdes e
                Funcionários — com contato direto via WhatsApp.
              </p>
            </div>
          </section>
        )}

        <section className="mt-14 max-w-3xl" aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="text-2xl font-light tracking-wide text-gray-900"
          >
            Perguntas frequentes — {hub.city}
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-gray-100 bg-white p-5"
              >
                <dt className="font-light text-gray-900">
                  {faq.question}
                </dt>
                <dd className="mt-2 leading-relaxed text-gray-600">
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

interface NeighborhoodHubPageProps {
  hub: CityHub;
  neighborhood: NeighborhoodHub;
}

export async function NeighborhoodHubPage({
  hub,
  neighborhood,
}: NeighborhoodHubPageProps) {
  const cityCompanions = await getCompanionsByCity(hub.city);
  const companions = getNeighborhoodCompanions(
    cityCompanions,
    hub.city,
    neighborhood.name,
  );

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Início", url: absoluteUrl("/") },
            {
              name: hub.region,
              url: absoluteUrl(
                `/catalogo?region=${encodeURIComponent(hub.region)}`,
              ),
            },
            { name: hub.city, url: absoluteUrl(cityHubPath(hub)) },
            {
              name: neighborhood.name,
              url: absoluteUrl(neighborhoodHubPath(hub, neighborhood)),
            },
          ]),
          buildItemListJsonLd(
            companions,
            `Acompanhantes em ${neighborhood.name}, ${hub.city}`,
          ),
          buildFaqJsonLd(neighborhood.faq),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-luxury-accent">
                Início
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={cityHubPath(hub)} className="hover:text-luxury-accent">
                {hub.city}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-semibold text-gray-900">{neighborhood.name}</li>
          </ol>
        </nav>

        <header className="mt-6 max-w-3xl">
          <h1 className="font-serif text-3xl font-bold italic text-gray-900 sm:text-4xl">
            Acompanhantes em {neighborhood.name}, {hub.city}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            {neighborhood.intro}
          </p>
        </header>

        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-light tracking-wide text-gray-900">
              {companions.length}{" "}
              {companions.length === 1 ? "acompanhante" : "acompanhantes"} em{" "}
              {neighborhood.name}
            </h2>
            <Link
              href={`/catalogo?region=${encodeURIComponent(hub.region)}&city=${encodeURIComponent(hub.city)}&neighborhood=${encodeURIComponent(neighborhood.name)}`}
              className="text-sm font-bold text-purple-800 hover:text-luxury-accent hover:underline"
            >
              Ver no catálogo →
            </Link>
          </div>

          {companions.length === 0 ? (
            <p className="text-gray-600">
              Nenhum perfil disponível neste bairro no momento.{" "}
              <Link
                href={cityHubPath(hub)}
                className="text-purple-800 hover:text-luxury-accent hover:underline"
              >
                Ver todos em {hub.city}
              </Link>
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {companions.map((c) => (
                <CompanionCard
                  key={c.id}
                  companion={c}
                  locationMode="neighborhood"
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-14 max-w-3xl" aria-labelledby="faq-neighborhood">
          <h2
            id="faq-neighborhood"
            className="text-2xl font-light tracking-wide text-gray-900"
          >
            Perguntas frequentes — {neighborhood.name}
          </h2>
          <dl className="mt-6 space-y-6">
            {neighborhood.faq.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-gray-100 bg-white p-5"
              >
                <dt className="font-light text-gray-900">
                  {faq.question}
                </dt>
                <dd className="mt-2 leading-relaxed text-gray-600">
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

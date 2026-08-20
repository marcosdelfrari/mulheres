import Link from "next/link";
import { CompanionCard } from "@/components/CompanionCard";
import { JsonLd } from "@/components/JsonLd";
import { LocationHero } from "@/components/LocationHero";
import { getCompanionsByCity, getCompanionsByRegion } from "@/lib/listings";
import type { CityHub, NeighborhoodHub, StateHub } from "@/lib/location-hubs";
import {
  cityHubPath,
  getCityHub,
  getCityHubsByState,
  getNeighborhoodCompanions,
  getPublishedNeighborhoodHubs,
  neighborhoodHubPath,
  stateHubPath,
} from "@/lib/location-hubs";
import {
  absoluteUrl,
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
  const faqs = hub.faq;
  const neighborhoods = getPublishedNeighborhoodHubs(hub, cityCompanions);

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Início", url: absoluteUrl("/") },
            {
              name: hub.region,
              url: absoluteUrl(`/${hub.stateSlug}`),
            },
            { name: hub.city, url: absoluteUrl(cityHubPath(hub)) },
          ]),
          buildItemListJsonLd(cityCompanions, hub.title),
          buildFaqJsonLd(faqs),
        ]}
      />

      <div className="luxury-shell">
        <LocationHero
          eyebrow={hub.eyebrow}
          locationName={hub.heroLocation}
          subtitle={hub.heroSub}
          searchPlaceholder={`Qual bairro em ${hub.shortName}?`}
          catalogHref={`/acompanhantes?region=${encodeURIComponent(hub.region)}&search=${encodeURIComponent(hub.city)}`}
        />
      </div>

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
                href={`/${hub.stateSlug}`}
                className="hover:text-luxury-accent"
              >
                {hub.region}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-semibold text-gray-900">{hub.city}</li>
          </ol>
        </nav>

        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <h2 className="text-xl font-light tracking-wide text-gray-900 sm:text-2xl">
              {cityCompanions.length} acompanhantes em {hub.shortName}
            </h2>
            <Link
              href={`/acompanhantes?region=${encodeURIComponent(hub.region)}&search=${encodeURIComponent(hub.city)}`}
              className="shrink-0 text-sm font-bold text-purple-800 hover:text-luxury-accent hover:underline"
            >
              Ver todas as modelos →
            </Link>
          </div>

          {cityCompanions.length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-8 text-gray-600">
              Nenhum perfil publicado nesta cidade no momento. Anuncie ou volte
              em breve — estamos expandindo as modelos em {hub.city}.
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
      </div>

      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-light tracking-wide text-gray-900">
              {hub.seoHeading}
            </h2>

            {neighborhoods.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {neighborhoods.map((bairro) => (
                  <Link
                    key={bairro.slug}
                    href={neighborhoodHubPath(hub, bairro)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 hover:border-purple-300 hover:text-luxury-accent"
                  >
                    {bairro.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Tags SEO legíveis */}
            <ul className="mt-4 flex flex-wrap gap-2" aria-label={`Tags ${hub.city}`}>
              {hub.tags.map((tag) => (
                <li key={tag}>
                  <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200">
                    {tag}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 font-light leading-relaxed text-gray-600">
              {hub.intro}{" "}
              Se você já usa {GENERIC_PLATFORMS_PHRASE}, o{" "}
              <strong>Mulheres</strong> é uma opção com filtros por localização e
              perfis verificados em {hub.city}.
            </p>

            <Link
              href={`/acompanhantes?region=${encodeURIComponent(hub.region)}&search=${encodeURIComponent(hub.city)}`}
              className="mt-5 inline-flex rounded-full bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-black"
            >
              Ver acompanhantes em {hub.shortName} →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-light tracking-wide text-gray-900">
              Por que escolher o Mulheres em {hub.city}?
            </h2>
            <p className="mt-4 font-light leading-relaxed text-gray-600">
              {hub.whySection}
            </p>
          </div>
        </div>
      </section>

      <section
        className="border-t border-gray-100 bg-gray-50"
        aria-labelledby="faq-heading"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 pb-24 sm:px-6 sm:pb-12">
          <div className="max-w-3xl">
            <h2
              id="faq-heading"
              className="text-xl font-light tracking-wide text-gray-900 sm:text-2xl"
            >
              Perguntas frequentes — {hub.city}
            </h2>
            <dl className="mt-5 space-y-4 sm:mt-6">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-gray-100 bg-white p-4 sm:rounded-3xl sm:p-5"
                >
                  <dt className="text-[15px] font-medium leading-snug text-gray-900 sm:text-base sm:font-light">
                    {faq.question}
                  </dt>
                  <dd className="mt-2 text-sm font-light leading-relaxed text-gray-600">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}

interface StateHubPageProps {
  hub: StateHub;
}

export async function StateHubPage({ hub }: StateHubPageProps) {
  const regionCompanions = await getCompanionsByRegion(hub.region);
  const cityHubs = getCityHubsByState(hub.stateSlug);
  const capital = getCityHub(hub.stateSlug, hub.capitalCitySlug);
  const faqs = hub.faq;

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Início", url: absoluteUrl("/") },
            { name: hub.region, url: absoluteUrl(stateHubPath(hub)) },
          ]),
          buildItemListJsonLd(regionCompanions, hub.title),
          buildFaqJsonLd(faqs),
        ]}
      />

      <div className="luxury-shell">
        <LocationHero
          eyebrow={hub.eyebrow}
          locationName={hub.heroLocation}
          subtitle={hub.heroSub}
          searchPlaceholder={`Cidade em ${hub.uf}?`}
          catalogHref={`/acompanhantes?region=${encodeURIComponent(hub.region)}`}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-luxury-accent">
                Início
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-semibold text-gray-900">{hub.region}</li>
          </ol>
        </nav>

        {cityHubs.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-light text-gray-900">
              Capitais e hubs em {hub.region}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {cityHubs.map((city) => (
                <Link
                  key={city.citySlug}
                  href={cityHubPath(city)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:border-purple-300 hover:text-luxury-accent"
                >
                  {city.city}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <h2 className="text-xl font-light tracking-wide text-gray-900 sm:text-2xl">
              {regionCompanions.length} acompanhantes em {hub.uf}
            </h2>
            <Link
              href={`/acompanhantes?region=${encodeURIComponent(hub.region)}`}
              className="shrink-0 text-sm font-bold text-purple-800 hover:text-luxury-accent hover:underline"
            >
              Ver todas as modelos →
            </Link>
          </div>

          {regionCompanions.length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-8 text-gray-600">
              Nenhum perfil publicado neste estado no momento.
              {capital && (
                <>
                  {" "}
                  Confira a página de{" "}
                  <Link
                    href={cityHubPath(capital)}
                    className="font-medium text-purple-800 hover:underline"
                  >
                    {capital.city}
                  </Link>
                  .
                </>
              )}
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {regionCompanions.slice(0, 12).map((c) => (
                <CompanionCard key={c.id} companion={c} locationMode="city" />
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-light tracking-wide text-gray-900">
              {hub.seoHeading}
            </h2>

            <ul className="mt-4 flex flex-wrap gap-2" aria-label={`Tags ${hub.region}`}>
              {hub.tags.map((tag) => (
                <li key={tag}>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200">
                    {tag}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 font-light leading-relaxed text-gray-600">
              {hub.intro}
            </p>

            {capital && (
              <Link
                href={cityHubPath(capital)}
                className="mt-5 inline-flex rounded-full bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-black"
              >
                Ver {capital.city} →
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-light tracking-wide text-gray-900">
              Por que escolher o Mulheres em {hub.region}?
            </h2>
            <p className="mt-4 font-light leading-relaxed text-gray-600">
              {hub.whySection}
            </p>
          </div>
        </div>
      </section>

      <section
        className="border-t border-gray-100 bg-gray-50"
        aria-labelledby="faq-state"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 pb-24 sm:px-6 sm:pb-12">
          <div className="max-w-3xl">
            <h2
              id="faq-state"
              className="text-xl font-light tracking-wide text-gray-900 sm:text-2xl"
            >
              Perguntas frequentes — {hub.region}
            </h2>
            <dl className="mt-6 space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-3xl border border-gray-100 bg-white p-5"
                >
                  <dt className="font-light text-gray-900">{faq.question}</dt>
                  <dd className="mt-2 text-sm font-light leading-relaxed text-gray-600">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
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
              url: absoluteUrl(`/${hub.stateSlug}`),
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

      <div className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 sm:py-10 sm:pb-16">
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
                href={`/${hub.stateSlug}`}
                className="hover:text-luxury-accent"
              >
                {hub.region}
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

        <header className="mt-5 max-w-3xl sm:mt-6">
          <h1 className="font-serif text-[1.65rem] font-bold italic leading-snug text-gray-900 sm:text-4xl">
            Acompanhantes em {neighborhood.name}, {hub.city}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-gray-600 sm:mt-4 sm:text-lg">
            {neighborhood.intro}
          </p>
        </header>

        <section className="mt-8 sm:mt-10">
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <h2 className="text-xl font-light tracking-wide text-gray-900 sm:text-2xl">
              {companions.length}{" "}
              {companions.length === 1 ? "acompanhante" : "acompanhantes"} em{" "}
              {neighborhood.name}
            </h2>
            <Link
              href={`/acompanhantes?region=${encodeURIComponent(hub.region)}&city=${encodeURIComponent(hub.city)}&neighborhood=${encodeURIComponent(neighborhood.name)}`}
              className="shrink-0 text-sm font-bold text-purple-800 hover:text-luxury-accent hover:underline"
            >
              Ver no catálogo →
            </Link>
          </div>

          {companions.length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm leading-relaxed text-gray-600 sm:px-5 sm:py-8 sm:text-base">
              Nenhum perfil disponível neste bairro no momento.{" "}
              <Link
                href={cityHubPath(hub)}
                className="font-semibold text-purple-800 underline underline-offset-2 hover:text-luxury-accent"
              >
                Ver todos em {hub.city}
              </Link>
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
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

        <section className="mt-12 max-w-3xl sm:mt-14" aria-labelledby="faq-neighborhood">
          <h2
            id="faq-neighborhood"
            className="text-xl font-light tracking-wide text-gray-900 sm:text-2xl"
          >
            Perguntas frequentes — {neighborhood.name}
          </h2>
          <dl className="mt-5 space-y-4 sm:mt-6 sm:space-y-6">
            {neighborhood.faq.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5"
              >
                <dt className="text-[15px] font-medium leading-snug text-gray-900 sm:text-base sm:font-light">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
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

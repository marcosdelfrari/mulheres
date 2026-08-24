import Link from "next/link";
import { CatalogGrid } from "@/components/CatalogGrid";
import { CompanionCard } from "@/components/CompanionCard";
import { JsonLd } from "@/components/JsonLd";
import { LocationHero } from "@/components/LocationHero";
import {
  citiesWithListingsInRegion,
  comLocalPath,
  companionHasLocal,
  getNeighborhoodsForCity,
  getTypeTagsInCity,
  typeTagHubPath,
} from "@/lib/dynamic-location-hubs";
import { getCompanionsByCity, getCompanionsByRegion } from "@/lib/listings";
import { slugify } from "@/lib/slug";
import type { CityHub, NeighborhoodHub, StateHub } from "@/lib/location-hubs";
import {
  cityHubPath,
  getCityHub,
  getCityHubsByState,
  getNeighborhoodCompanions,
  neighborhoodHubPath,
  stateHubPath,
  tagToHubPath,
} from "@/lib/location-hubs";
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
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
  const neighborhoods = getNeighborhoodsForCity(hub, cityCompanions);
  const withLocalCount = cityCompanions.filter(companionHasLocal).length;
  const typeTags = getTypeTagsInCity(cityCompanions);

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
          buildCollectionPageJsonLd({
            name: hub.title,
            description: hub.intro,
            url: absoluteUrl(cityHubPath(hub)),
            companions: cityCompanions,
          }),
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
            <CatalogGrid
              items={cityCompanions.map((c) => ({ companion: c }))}
              locationMode="neighborhood"
              sponsoredSubtitle={`Perfis em destaque em ${hub.shortName}.`}
            />
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

            {(withLocalCount > 0 || typeTags.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {withLocalCount > 0 && (
                  <Link
                    href={comLocalPath(hub)}
                    className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-900 hover:border-purple-300"
                  >
                    Com local ({withLocalCount})
                  </Link>
                )}
                {typeTags.map((tag) => (
                  <Link
                    key={tag}
                    href={typeTagHubPath(hub, tag)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 hover:border-purple-300 hover:text-luxury-accent"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Tags SEO com links internos */}
            <ul className="mt-4 flex flex-wrap gap-2" aria-label={`Tags ${hub.city}`}>
              {hub.tags.map((tag) => {
                const href = tagToHubPath(tag, hub);
                return (
                  <li key={tag}>
                    {href ? (
                      <Link
                        href={href}
                        className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200 hover:text-luxury-accent hover:ring-purple-300"
                      >
                        {tag}
                      </Link>
                    ) : (
                      <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200">
                        {tag}
                      </span>
                    )}
                  </li>
                );
              })}
              {withLocalCount > 0 && (
                <li>
                  <Link
                    href={comLocalPath(hub)}
                    className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200 hover:text-luxury-accent hover:ring-purple-300"
                  >
                    mulheres com local {hub.shortName.toLowerCase()}
                  </Link>
                </li>
              )}
            </ul>

            <p className="mt-4 font-light leading-relaxed text-gray-600">
              {hub.intro}{" "}
              Se você já usa {GENERIC_PLATFORMS_PHRASE}, o{" "}
              <strong>Mulheres de Luxo</strong> é uma opção com filtros por localização e
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
              Por que escolher o Mulheres de Luxo em {hub.city}?
            </h2>
            <p className="mt-4 font-light leading-relaxed text-gray-600">
              {hub.whySection}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-light tracking-wide text-gray-900">
              Segurança e confiança
            </h2>
            <p className="mt-4 font-light leading-relaxed text-gray-600">
              Perfis verificados, fotos reais e contato direto via WhatsApp — sem
              intermediários ou taxas ocultas. Combine valores, horário e local
              antes do encontro.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/guias/site-seguro-acompanhantes"
                className="inline-flex rounded-full border border-purple-200 bg-purple-50 px-5 py-2.5 text-sm font-semibold text-purple-900 hover:border-purple-300"
              >
                Qual site é mais seguro? →
              </Link>
              {withLocalCount > 0 && (
                <Link
                  href={comLocalPath(hub)}
                  className="inline-flex rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:border-purple-300"
                >
                  Acompanhantes com local em {hub.shortName}
                </Link>
              )}
            </div>
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
  const listedCities = citiesWithListingsInRegion(regionCompanions, hub.region);
  const capital = getCityHub(hub.stateSlug, hub.capitalCitySlug);
  const faqs = hub.faq;

  const cityLinks = [...new Set([
    ...cityHubs.map((c) => c.city),
    ...listedCities,
  ])].sort((a, b) => a.localeCompare(b, "pt-BR"));

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

        {cityLinks.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-light text-gray-900">
              Cidades em {hub.region}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {cityLinks.map((city) => {
                const staticHub = cityHubs.find((c) => c.city === city);
                const href = staticHub
                  ? cityHubPath(staticHub)
                  : `/${hub.stateSlug}/${slugify(city)}`;
                return (
                  <Link
                    key={city}
                    href={href}
                    className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:border-purple-300 hover:text-luxury-accent"
                  >
                    {city}
                  </Link>
                );
              })}
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
            <CatalogGrid
              items={regionCompanions.map((c) => ({ companion: c }))}
              locationMode="city"
              sponsoredSubtitle={`Perfis em destaque em ${hub.region}.`}
            />
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
              {hub.tags.map((tag) => {
                const href = tagToHubPath(tag, hub);
                return (
                  <li key={tag}>
                    {href ? (
                      <Link
                        href={href}
                        className="rounded-full bg-white px-2.5 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200 hover:text-luxury-accent hover:ring-purple-300"
                      >
                        {tag}
                      </Link>
                    ) : (
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200">
                        {tag}
                      </span>
                    )}
                  </li>
                );
              })}
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
              Por que escolher o Mulheres de Luxo em {hub.region}?
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
            Acompanhantes em {neighborhood.name}, {hub.shortName}
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

interface ComLocalHubPageProps {
  hub: CityHub;
}

export async function ComLocalHubPage({ hub }: ComLocalHubPageProps) {
  const cityCompanions = await getCompanionsByCity(hub.city);
  const companions = cityCompanions.filter(companionHasLocal);
  const faqs = [
    {
      question: `Tem acompanhantes com local em ${hub.city}?`,
      answer: `Sim. O Mulheres de Luxo lista acompanhantes com local próprio em ${hub.city}. Perfis verificados com fotos reais e contato direto via WhatsApp.`,
    },
    {
      question: `Onde encontrar mulheres com local em ${hub.shortName}?`,
      answer: `Nesta página você vê perfis em ${hub.city} que indicam atendimento com local próprio. Combine horário e valores direto via WhatsApp antes do encontro.`,
    },
    {
      question: `Acompanhantes com local em ${hub.city} atendem em hotel também?`,
      answer:
        "Muitas também atendem em hotel, motel ou deslocamento. Cada perfil detalha todas as opções de local de atendimento.",
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Início", url: absoluteUrl("/") },
            { name: hub.region, url: absoluteUrl(`/${hub.stateSlug}`) },
            { name: hub.city, url: absoluteUrl(cityHubPath(hub)) },
            {
              name: "Com local",
              url: absoluteUrl(comLocalPath(hub)),
            },
          ]),
          buildItemListJsonLd(
            companions,
            `Acompanhantes com local em ${hub.city}`,
          ),
          buildFaqJsonLd(faqs),
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
              <Link href={`/${hub.stateSlug}`} className="hover:text-luxury-accent">
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
            <li className="font-semibold text-gray-900">Com local</li>
          </ol>
        </nav>

        <header className="mt-5 max-w-3xl sm:mt-6">
          <h1 className="font-serif text-[1.65rem] font-bold italic leading-snug text-gray-900 sm:text-4xl">
            Acompanhantes com local em {hub.city}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-gray-600 sm:mt-4 sm:text-lg">
            Perfis em {hub.city} que indicam atendimento com local próprio.
            Contato direto via WhatsApp — sem intermediários.
          </p>
        </header>

        <section className="mt-8 sm:mt-10">
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <h2 className="text-xl font-light tracking-wide text-gray-900 sm:text-2xl">
              {companions.length}{" "}
              {companions.length === 1 ? "acompanhante" : "acompanhantes"} com
              local
            </h2>
            <Link
              href={cityHubPath(hub)}
              className="shrink-0 text-sm font-bold text-purple-800 hover:text-luxury-accent hover:underline"
            >
              Ver todas em {hub.shortName} →
            </Link>
          </div>

          {companions.length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm leading-relaxed text-gray-600 sm:px-5 sm:py-8 sm:text-base">
              Nenhum perfil com local nesta cidade no momento.{" "}
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

        <section className="mt-12 max-w-3xl sm:mt-14" aria-labelledby="faq-com-local">
          <h2
            id="faq-com-local"
            className="text-xl font-light tracking-wide text-gray-900 sm:text-2xl"
          >
            Perguntas frequentes — com local em {hub.city}
          </h2>
          <dl className="mt-5 space-y-4 sm:mt-6 sm:space-y-6">
            {faqs.map((faq) => (
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

interface TypeTagHubPageProps {
  hub: CityHub;
  typeTag: string;
}

export async function TypeTagHubPage({ hub, typeTag }: TypeTagHubPageProps) {
  const cityCompanions = await getCompanionsByCity(hub.city);
  const companions = cityCompanions.filter((c) =>
    c.typeTags.includes(typeTag),
  );
  const faqs = [
    {
      question: `Onde encontrar acompanhantes ${typeTag.toLowerCase()} em ${hub.city}?`,
      answer: `No Mulheres de Luxo você encontra acompanhantes ${typeTag.toLowerCase()} em ${hub.city} com perfis verificados, fotos reais e contato direto via WhatsApp.`,
    },
    {
      question: `Tem acompanhantes ${typeTag.toLowerCase()} com local em ${hub.shortName}?`,
      answer: `Vários perfis ${typeTag.toLowerCase()} em ${hub.city} indicam local próprio, hotel ou deslocamento. Confira cada anúncio antes de combinar.`,
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Início", url: absoluteUrl("/") },
            { name: hub.region, url: absoluteUrl(`/${hub.stateSlug}`) },
            { name: hub.city, url: absoluteUrl(cityHubPath(hub)) },
            {
              name: typeTag,
              url: absoluteUrl(typeTagHubPath(hub, typeTag)),
            },
          ]),
          buildItemListJsonLd(
            companions,
            `Acompanhantes ${typeTag} em ${hub.city}`,
          ),
          buildFaqJsonLd(faqs),
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
              <Link href={`/${hub.stateSlug}`} className="hover:text-luxury-accent">
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
            <li className="font-semibold text-gray-900">{typeTag}</li>
          </ol>
        </nav>

        <header className="mt-5 max-w-3xl sm:mt-6">
          <h1 className="font-serif text-[1.65rem] font-bold italic leading-snug text-gray-900 sm:text-4xl">
            Acompanhantes {typeTag} em {hub.city}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-gray-600 sm:mt-4 sm:text-lg">
            Perfis com tag {typeTag} em {hub.city}. Verificados no Mulheres de Luxo com
            contato direto via WhatsApp.
          </p>
        </header>

        <section className="mt-8 sm:mt-10">
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <h2 className="text-xl font-light tracking-wide text-gray-900 sm:text-2xl">
              {companions.length}{" "}
              {companions.length === 1 ? "acompanhante" : "acompanhantes"}{" "}
              {typeTag.toLowerCase()}
            </h2>
            <Link
              href={cityHubPath(hub)}
              className="shrink-0 text-sm font-bold text-purple-800 hover:text-luxury-accent hover:underline"
            >
              Ver todas em {hub.shortName} →
            </Link>
          </div>

          {companions.length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm leading-relaxed text-gray-600 sm:px-5 sm:py-8 sm:text-base">
              Nenhum perfil {typeTag.toLowerCase()} nesta cidade no momento.{" "}
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

        <section className="mt-12 max-w-3xl sm:mt-14" aria-labelledby="faq-type-tag">
          <h2
            id="faq-type-tag"
            className="text-xl font-light tracking-wide text-gray-900 sm:text-2xl"
          >
            Perguntas frequentes — {typeTag} em {hub.city}
          </h2>
          <dl className="mt-5 space-y-4 sm:mt-6 sm:space-y-6">
            {faqs.map((faq) => (
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

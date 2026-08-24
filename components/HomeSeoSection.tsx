import Link from "next/link";
import {
  formatCityNamesPhrase,
  getActiveLocationLinks,
} from "@/lib/active-locations";
import { GENERIC_PLATFORMS_PHRASE } from "@/lib/brand-copy";

export async function HomeSeoSection() {
  const alternatives = GENERIC_PLATFORMS_PHRASE;
  const { cities, states } = await getActiveLocationLinks();
  const featuredCities = cities.slice(0, 8);
  const citiesPhrase = formatCityNamesPhrase(cities);

  return (
    <section className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-light tracking-wide text-gray-900">
            Acompanhantes de luxo em todo o Brasil
          </h2>

          {featuredCities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {featuredCities.map((city) => (
                <Link
                  key={city.href}
                  href={city.href}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 hover:border-purple-300 hover:text-luxury-accent"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          )}

          <p className="mt-4 font-light leading-relaxed text-gray-600">
            O Mulheres de Luxo reúne acompanhantes verificadas
            {cities.length > 0 ? ` em ${citiesPhrase}` : " no Brasil"} — com
            filtros por bairro, preço e contato direto via WhatsApp. Se você
            costuma buscar em {alternatives}, conheça uma experiência moderna,
            discreta e sem intermediários.
          </p>

          {states.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {states.map((state) => (
                <Link
                  key={state.stateSlug}
                  href={state.href}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 hover:border-purple-300 hover:text-luxury-accent"
                >
                  {state.name}
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/acompanhantes"
            className="mt-5 inline-flex rounded-full bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-black"
          >
            Ver todas as modelos →
          </Link>
        </div>
      </div>
    </section>
  );
}

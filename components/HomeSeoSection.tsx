import Link from "next/link";
import { GENERIC_PLATFORMS_PHRASE } from "@/lib/brand-copy";
import { CITY_HUBS, cityHubPath, STATE_HUBS, stateHubPath } from "@/lib/location-hubs";

export function HomeSeoSection() {
  const alternatives = GENERIC_PLATFORMS_PHRASE;
  const featuredCities = CITY_HUBS.slice(0, 6);
  const states = STATE_HUBS;

  return (
    <section className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-light tracking-wide text-gray-900">
            Acompanhantes de luxo em todo o Brasil
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {featuredCities.map((hub) => (
              <Link
                key={cityHubPath(hub)}
                href={cityHubPath(hub)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 hover:border-purple-300 hover:text-luxury-accent"
              >
                {hub.city}
              </Link>
            ))}
          </div>

          <p className="mt-4 font-light leading-relaxed text-gray-600">
            O Mulheres reúne acompanhantes verificadas nas principais capitais —
            Belo Horizonte, São Paulo, Rio de Janeiro, Curitiba, Brasília e
            Salvador — com filtros por bairro, preço e contato direto via
            WhatsApp. Se você costuma buscar em {alternatives}, conheça uma
            experiência moderna, discreta e sem intermediários.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {states.map((state) => (
              <Link
                key={state.stateSlug}
                href={stateHubPath(state)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 hover:border-purple-300 hover:text-luxury-accent"
              >
                {state.region}
              </Link>
            ))}
          </div>

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

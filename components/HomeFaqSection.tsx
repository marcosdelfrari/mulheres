import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";
import {
  formatCityNamesPhrase,
  getActiveLocationLinks,
} from "@/lib/active-locations";
import { buildBrFaq, buildFaqJsonLd } from "@/lib/seo";

export async function HomeFaqSection() {
  const { cities } = await getActiveLocationLinks();
  const faqs = buildBrFaq(formatCityNamesPhrase(cities));

  return (
    <section className="border-t border-gray-100 bg-white" aria-labelledby="home-faq">
      <JsonLd data={buildFaqJsonLd(faqs)} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="max-w-3xl">
          <h2
            id="home-faq"
            className="text-2xl font-light tracking-wide text-gray-900"
          >
            Perguntas frequentes
          </h2>
          <FaqAccordion faqs={faqs} />
          <Link
            href="/guias/como-funciona"
            className="mt-6 inline-block text-sm font-bold text-purple-800 hover:text-luxury-accent hover:underline"
          >
            Saiba como funciona →
          </Link>
        </div>
      </div>
    </section>
  );
}

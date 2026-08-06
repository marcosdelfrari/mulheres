import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { BH_FAQ, buildFaqJsonLd } from "@/lib/seo";

export function HomeFaqSection() {
  const faqs = BH_FAQ.slice(0, 4);

  return (
    <section className="border-t border-gray-100 bg-white" aria-labelledby="home-faq">
      <JsonLd data={buildFaqJsonLd(faqs)} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="max-w-3xl">
          <h2
            id="home-faq"
            className="font-serif text-2xl font-bold italic text-gray-900"
          >
            Perguntas frequentes
          </h2>
          <dl className="mt-6 space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-3xl border border-gray-100 bg-gray-50 p-5"
              >
                <dt className="font-serif font-semibold text-gray-900">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-gray-600">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
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

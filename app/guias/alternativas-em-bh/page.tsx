import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { TrademarkDisclaimer } from "@/components/TrademarkDisclaimer";
import {
  absoluteUrl,
  buildArticleJsonLd,
  buildFaqJsonLd,
  buildGuideMetadata,
} from "@/lib/seo";
import { GENERIC_PLATFORMS_PHRASE } from "@/lib/brand-copy";

const PAGE_DESCRIPTION =
  "Guia para encontrar acompanhantes de luxo em Belo Horizonte com perfis verificados, filtros por bairro e contato direto via WhatsApp no Mulheres.";

export const metadata = buildGuideMetadata({
  title: "Alternativas para encontrar acompanhantes em BH",
  description: PAGE_DESCRIPTION,
  slug: "alternativas-em-bh",
});

const FEATURES = [
  {
    title: "Perfis verificados",
    description:
      "Selo de verificação para perfis que passaram por checagem de identidade e fotos.",
  },
  {
    title: "Filtros por bairro",
    description:
      "Páginas dedicadas para Savassi, Lourdes, Funcionários, Centro, Pampulha e mais.",
  },
  {
    title: "Contato direto",
    description:
      "WhatsApp e telefone em cada perfil, sem intermediários ou taxas ocultas.",
  },
  {
    title: "Interface limpa",
    description:
      "Navegação rápida, sem anúncios invasivos, focada em encontrar o perfil certo.",
  },
] as const;

const FAQ = [
  {
    question: "Como encontrar acompanhantes em Belo Horizonte com segurança?",
    answer:
      "Prefira plataformas com perfis verificados, fotos reais e contato direto. No Mulheres você filtra por bairro, compara preços e conversa via WhatsApp antes de combinar o encontro.",
  },
  {
    question: "O Mulheres cobra taxa de intermediação?",
    answer:
      "Não. O contato é direto entre você e a acompanhante. O Mulheres reúne modelos e anúncios verificados.",
  },
  {
    question: "Quais bairros de BH estão entre as modelos?",
    answer:
      "Savassi, Lourdes, Funcionários, Centro, Pampulha, Buritis e outros. Cada bairro com perfis disponíveis tem página dedicada.",
  },
] as const;

export default function AlternativasBhPage() {
  const url = absoluteUrl("/guias/alternativas-em-bh");

  return (
    <>
      <JsonLd
        data={[
          buildArticleJsonLd({
            title: "Alternativas para encontrar acompanhantes em BH",
            description: PAGE_DESCRIPTION,
            url,
            datePublished: "2026-06-15T10:00:00.000Z",
          }),
          buildFaqJsonLd(FAQ),
        ]}
      />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="text-sm text-gray-500">
          <Link href="/" className="hover:text-luxury-accent">
            Início
          </Link>
          <span aria-hidden> / </span>
          <span className="text-gray-900">Alternativas em BH</span>
        </nav>

        <header className="mt-6">
          <h1 className="font-serif text-3xl font-bold italic text-gray-900">
            Como encontrar acompanhantes em Belo Horizonte
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Se você já usa {GENERIC_PLATFORMS_PHRASE}, conheça o Mulheres: modelos
            com perfis verificados, filtros por bairro e contato direto via
            WhatsApp em BH.
          </p>
        </header>

        <section className="mt-10 space-y-4">
          <h2 className="font-serif text-xl font-bold italic text-gray-900">
            O que o Mulheres oferece
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
              >
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 leading-relaxed text-gray-600">
          <h2 className="font-serif text-xl font-bold italic text-gray-900">
            Por bairro em BH
          </h2>
          <p className="mt-2">
            Belo Horizonte concentra milhares de buscas mensais por acompanhantes.
            O Mulheres organiza perfis por bairro — comece por{" "}
            <Link
              href="/minas-gerais/belo-horizonte/savassi"
              className="text-purple-800 hover:text-luxury-accent hover:underline"
            >
              Savassi
            </Link>
            ,{" "}
            <Link
              href="/minas-gerais/belo-horizonte/lourdes"
              className="text-purple-800 hover:text-luxury-accent hover:underline"
            >
              Lourdes
            </Link>{" "}
            ou{" "}
            <Link
              href="/minas-gerais/belo-horizonte"
              className="text-purple-800 hover:text-luxury-accent hover:underline"
            >
              veja todos em BH
            </Link>
            .
          </p>
          <Link
            href="/guias/site-seguro-acompanhantes"
            className="mt-4 inline-block text-sm font-semibold text-purple-800 hover:underline"
          >
            Qual site é mais seguro para encontrar acompanhantes? →
          </Link>
        </section>

        <section className="mt-14" aria-labelledby="faq-alternativas">
          <h2
            id="faq-alternativas"
            className="font-serif text-2xl font-bold italic text-gray-900"
          >
            Perguntas frequentes
          </h2>
          <dl className="mt-6 space-y-6">
            {FAQ.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
              >
                <dt className="font-serif font-semibold text-gray-900">
                  {faq.question}
                </dt>
                <dd className="mt-2">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-10">
          <Link
            href="/minas-gerais/belo-horizonte"
            className="inline-flex rounded-full bg-[#0c0414] px-6 py-3 text-sm font-bold text-white hover:bg-purple-900"
          >
            Ver acompanhantes em BH →
          </Link>
        </div>

        <TrademarkDisclaimer className="mt-10" />
      </article>
    </>
  );
}

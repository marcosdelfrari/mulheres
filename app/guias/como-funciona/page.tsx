import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { TrademarkDisclaimer } from "@/components/TrademarkDisclaimer";
import {
  absoluteUrl,
  buildArticleJsonLd,
  buildFaqJsonLd,
  buildGuideMetadata,
} from "@/lib/seo";

const PAGE_DESCRIPTION =
  "Saiba como encontrar acompanhantes de luxo verificadas no Mulheres. Filtros por bairro, contato via WhatsApp e perfis com fotos reais.";

export const metadata = buildGuideMetadata({
  title: "Como funciona o Mulheres",
  description: PAGE_DESCRIPTION,
  slug: "como-funciona",
});

const FAQ = [
  {
    question: "Como encontrar acompanhantes no Mulheres?",
    answer:
      "Acesse o catálogo, filtre por região, cidade ou bairro e navegue pelos perfis verificados. Cada anúncio exibe fotos, preços, serviços e WhatsApp para contato direto.",
  },
  {
    question: "O Mulheres cobra taxa de intermediação?",
    answer:
      "Não. O contato é direto entre você e a acompanhante via WhatsApp ou telefone. Sem intermediários e sem taxas ocultas.",
  },
  {
    question: "O que significa perfil verificado?",
    answer:
      "Perfis verificados passaram por checagem de identidade e fotos. O selo verde indica maior confiabilidade no catálogo.",
  },
  {
    question: "Posso filtrar por bairro em Belo Horizonte?",
    answer:
      "Sim. Use a página de BH ou filtros do catálogo para Savassi, Lourdes, Funcionários, Centro, Pampulha e outros bairros.",
  },
] as const;

export default function ComoFuncionaPage() {
  const url = absoluteUrl("/guias/como-funciona");

  return (
    <>
      <JsonLd
        data={[
          buildArticleJsonLd({
            title: "Como funciona o Mulheres",
            description: PAGE_DESCRIPTION,
            url,
            datePublished: "2026-06-01T10:00:00.000Z",
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
          <span className="text-gray-900">Como funciona</span>
        </nav>

        <header className="mt-6">
          <h1 className="font-serif text-3xl font-bold italic text-gray-900">
            Como funciona o Mulheres
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            O Mulheres é um catálogo de acompanhantes de luxo com perfis
            verificados, filtros por bairro e contato direto via WhatsApp.
          </p>
        </header>

        <section className="mt-10 space-y-8 leading-relaxed text-gray-600">
          <div>
            <h2 className="font-serif text-xl font-bold italic text-gray-900">
              1. Escolha a região ou bairro
            </h2>
            <p className="mt-2">
              Comece pela{" "}
              <Link href="/minas-gerais/belo-horizonte" className="text-purple-800 hover:text-luxury-accent hover:underline">
                página de Belo Horizonte
              </Link>{" "}
              ou use o{" "}
              <Link href="/catalogo" className="text-purple-800 hover:text-luxury-accent hover:underline">
                catálogo completo
              </Link>{" "}
              para filtrar por estado, cidade e bairro.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold italic text-gray-900">
              2. Compare perfis
            </h2>
            <p className="mt-2">
              Cada perfil exibe fotos, preço por hora, serviços oferecidos,
              locais de atendimento e selo de verificação. Compare opções antes
              de entrar em contato.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold italic text-gray-900">
              3. Contato direto via WhatsApp
            </h2>
            <p className="mt-2">
              Toque no botão WhatsApp do perfil para conversar diretamente.
              Combine valores, horários e local de atendimento sem
              intermediários.
            </p>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="faq-guia">
          <h2 id="faq-guia" className="font-serif text-2xl font-bold italic text-gray-900">
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

        <TrademarkDisclaimer className="mt-10" />
      </article>
    </>
  );
}

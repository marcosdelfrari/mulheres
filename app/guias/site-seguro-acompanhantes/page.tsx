import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { TrademarkDisclaimer } from "@/components/TrademarkDisclaimer";
import { CITY_HUBS, cityHubPath } from "@/lib/location-hubs";
import {
  absoluteUrl,
  buildArticleJsonLd,
  buildFaqJsonLd,
  buildGuideMetadata,
} from "@/lib/seo";

const PAGE_DESCRIPTION =
  "Guia para escolher um site seguro de acompanhantes: perfis verificados, fotos reais, contato direto via WhatsApp e sem taxas ocultas no Mulheres de Luxo.";

export const metadata = buildGuideMetadata({
  title: "Qual site é mais seguro para encontrar acompanhantes?",
  description: PAGE_DESCRIPTION,
  slug: "site-seguro-acompanhantes",
});

const CHECKLIST = [
  {
    title: "Perfis verificados",
    description:
      "Selo de verificação com checagem de identidade e fotos — reduz perfis falsos e golpes.",
  },
  {
    title: "Contato direto",
    description:
      "WhatsApp e telefone no perfil, sem intermediários cobrando taxa para “liberar” contato.",
  },
  {
    title: "Fotos e descrição reais",
    description:
      "Anúncios com galeria atualizada e texto claro sobre local, valores e disponibilidade.",
  },
  {
    title: "Transparência de preço",
    description:
      "Valor por hora visível no perfil. Combine detalhes antes do encontro, sem surpresas.",
  },
] as const;

const FAQ = [
  {
    question: "Qual site é mais seguro para encontrar acompanhantes?",
    answer:
      "Prefira plataformas com verificação de identidade, fotos reais, contato direto via WhatsApp e política clara de privacidade. No Mulheres de Luxo não há taxa de intermediação — você fala direto com a acompanhante.",
  },
  {
    question: "O Mulheres de Luxo cobra taxa ou comissão?",
    answer:
      "Não. O contato é direto entre você e a acompanhante. O Mulheres de Luxo reúne anúncios verificados; valores e combinações são acertados no WhatsApp.",
  },
  {
    question: "Como saber se um perfil é confiável?",
    answer:
      "Busque o selo verificado, leia a descrição completa, confira se as fotos parecem consistentes e converse antes sobre horário, local e valores. Desconfie de pedidos de pagamento antecipado sem contexto.",
  },
  {
    question: "É seguro usar WhatsApp para combinar?",
    answer:
      "Sim, desde que você confirme que está falando com a pessoa do perfil, combine tudo por escrito e evite enviar dados bancários ou pagamentos adiantados a desconhecidos.",
  },
  {
    question: "O Mulheres de Luxo funciona em quais cidades?",
    answer:
      "Belo Horizonte, Salvador, São Paulo, Rio de Janeiro, Curitiba, Brasília e outras cidades conforme anúncios publicados. Cada capital tem página dedicada com perfis locais.",
  },
] as const;

export default function SiteSeguroPage() {
  const url = absoluteUrl("/guias/site-seguro-acompanhantes");

  return (
    <>
      <JsonLd
        data={[
          buildArticleJsonLd({
            title: "Qual site é mais seguro para encontrar acompanhantes?",
            description: PAGE_DESCRIPTION,
            url,
            datePublished: "2026-08-24T22:00:00.000Z",
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
          <Link href="/guias/como-funciona" className="hover:text-luxury-accent">
            Guias
          </Link>
          <span aria-hidden> / </span>
          <span className="text-gray-900">Site seguro</span>
        </nav>

        <header className="mt-6">
          <h1 className="font-serif text-3xl font-bold italic text-gray-900">
            Qual site é mais seguro para encontrar acompanhantes?
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Critérios objetivos para escolher uma plataforma confiável — e como o
            Mulheres de Luxo aplica verificação, contato direto e transparência em todo o
            Brasil.
          </p>
        </header>

        <section className="mt-10 space-y-4">
          <h2 className="font-serif text-xl font-bold italic text-gray-900">
            O que observar antes de escolher
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {CHECKLIST.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
              >
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 leading-relaxed text-gray-600">
          <h2 className="font-serif text-xl font-bold italic text-gray-900">
            Por cidade
          </h2>
          <p className="mt-2">
            Explore perfis verificados nas principais capitais — cada uma com
            landing page, bairros e FAQ local:
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {CITY_HUBS.map((hub) => (
              <li key={hub.citySlug}>
                <Link
                  href={cityHubPath(hub)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-purple-800 hover:border-purple-300 hover:underline"
                >
                  {hub.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14" aria-labelledby="faq-site-seguro">
          <h2
            id="faq-site-seguro"
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

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/acompanhantes"
            className="inline-flex rounded-full bg-[#0c0414] px-6 py-3 text-sm font-bold text-white hover:bg-purple-900"
          >
            Ver acompanhantes verificadas →
          </Link>
          <Link
            href="/guias/como-funciona"
            className="inline-flex rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50"
          >
            Como funciona
          </Link>
        </div>

        <TrademarkDisclaimer className="mt-10" />
      </article>
    </>
  );
}

import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Política de Privacidade",
  description:
    "Política de privacidade do Mulheres de Luxo. Saiba como tratamos seus dados pessoais.",
  path: "/privacidade",
});

export default function PrivacidadePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-bold italic text-gray-900">
        Política de Privacidade
      </h1>
      <p className="mt-2 text-sm text-gray-500">Última atualização: julho de 2026</p>

      <div className="prose prose-gray mt-8 max-w-none space-y-6 leading-relaxed text-gray-600">
        <section>
          <h2 className="font-serif text-xl font-bold italic text-gray-900">
            1. Dados coletados
          </h2>
          <p className="mt-2">
            Coletamos informações fornecidas voluntariamente no cadastro, como
            e-mail e nome, além de dados de navegação anonimizados via Google
            Analytics.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold italic text-gray-900">
            2. Uso dos dados
          </h2>
          <p className="mt-2">
            Utilizamos os dados para operar a plataforma, melhorar a experiência
            e responder solicitações de suporte. Não vendemos dados pessoais a
            terceiros.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold italic text-gray-900">
            3. Seus direitos (LGPD)
          </h2>
          <p className="mt-2">
            Você pode solicitar acesso, correção ou exclusão dos seus dados
            entrando em contato pelo e-mail contato@mulheresdeluxo.com.br.
          </p>
        </section>
      </div>
    </article>
  );
}

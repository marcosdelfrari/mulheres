import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Termos de Uso",
  description:
    "Termos de uso do Mulheres. Regras para clientes e acompanhantes na plataforma.",
  path: "/termos",
});

export default function TermosPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-bold italic text-gray-900">
        Termos de Uso
      </h1>
      <p className="mt-2 text-sm text-gray-500">Última atualização: julho de 2026</p>

      <div className="mt-8 space-y-6 leading-relaxed text-gray-600">
        <section>
          <h2 className="font-serif text-xl font-bold italic text-gray-900">
            1. Elegibilidade
          </h2>
          <p className="mt-2">
            O Mulheres é destinado exclusivamente a maiores de 18 anos. Ao usar a
            plataforma, você confirma ter idade legal.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold italic text-gray-900">
            2. Responsabilidade
          </h2>
          <p className="mt-2">
            O Mulheres reúne modelos e anúncios. A negociação e
            encontro ocorrem diretamente entre cliente e acompanhante. Não nos
            responsabilizamos por acordos feitos fora da plataforma.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold italic text-gray-900">
            3. Conteúdo
          </h2>
          <p className="mt-2">
            Anunciantes são responsáveis pelas informações publicadas. Reservamo-nos
            o direito de remover perfis que violem estes termos.
          </p>
        </section>
      </div>
    </article>
  );
}

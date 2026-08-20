import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Conteúdo +18",
  description:
    "Aviso de conteúdo adulto. O Mulheres é destinado exclusivamente a maiores de 18 anos.",
  path: "/mais-de-18",
});

export default function MaisDe18Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-bold italic text-gray-900">
        Conteúdo para maiores de 18 anos
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-gray-600">
        O Mulheres contém material destinado exclusivamente a adultos. Ao
        continuar navegando, você confirma ter 18 anos ou mais e aceita nossos{" "}
        <Link
          href="/termos"
          className="text-purple-800 hover:text-luxury-accent hover:underline"
        >
          Termos de Uso
        </Link>
        .
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/acompanhantes"
          className="rounded-full bg-[#0c0414] px-6 py-3 text-sm font-bold text-white hover:bg-purple-900"
        >
          Tenho 18 anos ou mais — continuar
        </Link>
        <a
          href="https://google.com"
          className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50"
        >
          Sair
        </a>
      </div>
    </article>
  );
}

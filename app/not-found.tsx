import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="font-serif text-4xl font-bold italic text-gray-900">404</h1>
      <p className="mt-2 text-lg text-gray-600">Perfil não encontrado</p>
      <Link
        href="/"
        className="mt-6 rounded bg-purple-700 px-6 py-3 text-base font-medium text-white hover:bg-purple-800"
      >
        Voltar ao catálogo
      </Link>
    </div>
  );
}

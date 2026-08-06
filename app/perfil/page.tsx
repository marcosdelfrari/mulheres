"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Mantido por compatibilidade — a tela unificada é /conta (Meu perfil). */
export default function PerfilPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/conta");
  }, [router]);

  return (
    <div className="mx-auto max-w-lg px-4 py-10 text-center text-gray-500">
      Carregando…
    </div>
  );
}

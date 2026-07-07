"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/types";

const inputClass =
  "w-full rounded border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("cliente");
  const [error, setError] = useState("");

  useEffect(() => {
    const paramRole = searchParams.get("role");
    if (paramRole === "acompanhante" || paramRole === "cliente") {
      setRole(paramRole);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }

    if (password.length < 4) {
      setError("Senha com pelo menos 4 caracteres.");
      return;
    }

    login(email, password, role);
    router.push("/");
  };

  return (
    <>
      <h1 className="font-serif text-2xl font-bold italic text-gray-900">Entrar</h1>
      <p className="mt-1 text-base text-gray-600">
        Cliente ou acompanhante.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded border border-gray-200 p-1">
        <button
          type="button"
          onClick={() => setRole("cliente")}
          className={`rounded py-2.5 text-base font-medium ${
            role === "cliente"
              ? "bg-purple-700 text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Cliente
        </button>
        <button
          type="button"
          onClick={() => setRole("acompanhante")}
          className={`rounded py-2.5 text-base font-medium ${
            role === "acompanhante"
              ? "bg-purple-700 text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Acompanhante
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-base font-medium text-gray-700">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-base font-medium text-gray-700">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-base text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded bg-purple-700 py-3 text-base font-medium text-white hover:bg-purple-800"
        >
          Entrar
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Demonstração: qualquer e-mail e senha com 4+ caracteres.
      </p>

      <p className="mt-4 text-center">
        <Link href="/" className="text-base text-purple-700 underline hover:text-purple-900">
          Voltar ao catálogo
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}

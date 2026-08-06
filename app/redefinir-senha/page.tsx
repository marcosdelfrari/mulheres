"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const inputClass =
  "w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-base text-white placeholder:text-white/30 focus:border-luxury-accent/50 focus:outline-none focus:ring-2 focus:ring-luxury-accent/10 transition-all";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Link inválido. Solicite uma nova recuperação.");
      return;
    }

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível redefinir.");
        return;
      }
      router.push("/login");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="font-serif text-3xl font-bold italic text-white">
        Nova senha
      </h1>
      <p className="mt-2 text-base text-white/60">
        Escolha uma senha nova para acessar sua conta.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 text-left">
        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-white/50">
            Nova senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-white/50">
            Confirmar senha
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={6}
            className={inputClass}
            required
          />
        </div>

        {error && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-base text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-luxury-accent py-4 text-base font-bold text-[#0c0414] transition-all hover:bg-luxury-accent-hover disabled:opacity-60 active:scale-[0.98]"
        >
          {submitting ? "Salvando…" : "Salvar senha"}
        </button>
      </form>

      <p className="mt-8 text-center">
        <Link
          href="/login"
          className="text-sm font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
        >
          ← Voltar ao login
        </Link>
      </p>
    </>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  );
}

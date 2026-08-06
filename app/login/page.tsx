"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postLoginPath, useAuth } from "@/lib/auth-context";

const inputClass =
  "w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-base text-white placeholder:text-white/30 focus:border-luxury-accent/50 focus:outline-none focus:ring-2 focus:ring-luxury-accent/10 transition-all";

function LoginForm() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(postLoginPath(user));
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <p className="text-center text-base text-white/60">Carregando…</p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const nextUser = await login(email, password);
      router.push(postLoginPath(nextUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na autenticação.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="font-serif text-3xl font-bold italic text-white">
        Entrar
      </h1>
      <p className="mt-2 text-base text-white/60">
        Área exclusiva para <span className="text-white">acompanhantes</span>.
        Use e-mail e senha da sua conta de anúncios.
      </p>
      <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white/50">
        Clientes não precisam de login — navegue no catálogo e entre em contato
        direto pelo WhatsApp ou telefone.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-white/50">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className={inputClass}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-white/50">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
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
          {submitting ? "Aguarde…" : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link
          href="/recuperar-senha"
          className="text-base text-white/60 underline hover:text-luxury-accent transition-colors"
        >
          Esqueci minha senha
        </Link>
      </p>

      <p className="mt-8 text-center text-base text-white/60 border-t border-white/5 pt-8">
        Ainda não anuncia?{" "}
        <Link
          href="/criar-conta?role=acompanhante"
          className="font-bold text-white underline hover:text-luxury-accent transition-colors"
        >
          Criar conta de acompanhante
        </Link>
      </p>

      <p className="mt-4 text-center">
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
        >
          ← Voltar ao catálogo
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

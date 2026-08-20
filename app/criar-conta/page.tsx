"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postLoginPath, useAuth } from "@/lib/auth-context";

const inputClass =
  "w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-base text-white placeholder:text-white/30 focus:border-luxury-accent/50 focus:outline-none focus:ring-2 focus:ring-luxury-accent/10 transition-all";

function CriarContaForm() {
  const router = useRouter();
  const { register, user, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
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

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("Senha com pelo menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      const nextUser = await register({
        name,
        email,
        password,
        role: "acompanhante",
        phone,
      });
      router.push(postLoginPath(nextUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a conta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="font-serif text-3xl font-bold italic text-white">
        Criar conta
      </h1>
      <p className="mt-2 text-base text-white/60">
        Cadastro exclusivo para{" "}
        <span className="text-white">acompanhantes</span> que querem anunciar.
      </p>
      <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white/50">
        Clientes não precisam de conta — veja as modelos e fale direto pelo
        WhatsApp ou telefone.
      </p>
      <p className="mt-4 text-center text-sm text-luxury-accent/80 italic">
        Confirmação de perfil com foto após o cadastro.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-white/50">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            autoComplete="name"
            required
          />
        </div>

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
            WhatsApp
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="31999999999"
            className={inputClass}
            autoComplete="tel"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-white/50">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-white/50">
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        {error && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-base text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full cursor-pointer rounded-full bg-luxury-accent py-4 text-base font-bold text-[#0c0414] transition-all hover:bg-luxury-accent-hover disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
        >
          {submitting ? "Criando conta…" : "Criar conta"}
        </button>
      </form>

      <p className="mt-8 text-center text-base text-white/60 border-t border-white/5 pt-8">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-bold text-white underline hover:text-luxury-accent transition-colors"
        >
          Entrar
        </Link>
      </p>

      <p className="mt-4 text-center">
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
        >
          ← Voltar às modelos
        </Link>
      </p>
    </>
  );
}

export default function CriarContaPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <Suspense>
        <CriarContaForm />
      </Suspense>
    </div>
  );
}

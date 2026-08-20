"use client";

import { useState } from "react";
import Link from "next/link";

const inputClass =
  "w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-base text-white placeholder:text-white/30 focus:border-luxury-accent/50 focus:outline-none focus:ring-2 focus:ring-luxury-accent/10 transition-all";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar o link.");
        return;
      }

      setMessage(
        data.message ??
          "Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.",
      );
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6 text-center">
      <h1 className="font-serif text-3xl font-bold italic text-white">
        Recuperar senha
      </h1>
      <p className="mt-2 text-base text-white/60">
        Informe seu e-mail cadastrado. Enviaremos um link seguro para redefinir
        a senha.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 text-left">
        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-white/50">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="seu@email.com"
            required
            autoComplete="email"
          />
        </div>

        {error && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-base text-red-400">
            {error}
          </p>
        )}

        {message && (
          <div className="space-y-2 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-4 text-base text-green-400">
            <p>{message}</p>
            <p className="text-sm text-green-400/70">
              Confira também a caixa de spam. O link expira em 1 hora.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full cursor-pointer rounded-full bg-luxury-accent py-4 text-base font-bold text-[#0c0414] transition-all hover:bg-luxury-accent-hover disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
        >
          {submitting ? "Enviando…" : "Enviar link por e-mail"}
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
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { VerificationCamera } from "@/components/VerificationCamera";
import type { User } from "@/lib/types";

type Method = "documento" | "foto_perfil";

export function AccountVerification({
  onVerified,
}: {
  onVerified?: (user: User) => void;
}) {
  const { setUser } = useAuth();
  const [method, setMethod] = useState<Method>("foto_perfil");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const facingMode = method === "documento" ? "environment" : "user";
  const cameraLabel =
    method === "documento"
      ? "documento (câmera traseira)"
      : "rosto (câmera frontal)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!file) {
      setError("Tire ou selecione uma foto para confirmar.");
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.set("method", method);
      form.set("file", file);

      const res = await fetch("/api/profile/verify", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        user?: User;
      };

      if (!res.ok) {
        setError(data.error ?? "Falha ao enviar verificação.");
        return;
      }

      if (data.user) {
        setUser(data.user);
        onVerified?.(data.user);
      }
      setMessage(data.message ?? "Cadastro confirmado.");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-700">
        Status:{" "}
        <span className="font-semibold text-gray-900">
          Pendente de confirmação
        </span>
      </div>

      <p className="text-base text-gray-700">
        Para liberar sua área de anúncios, confirme o cadastro com{" "}
        <strong>foto de documento</strong> ou <strong>foto de perfil</strong>.
        Use a câmera do celular para tirar a foto agora.
      </p>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-relaxed text-emerald-950">
        <p className="font-semibold text-emerald-900">
          Sua privacidade é prioridade
        </p>
        <p className="mt-2">
          Essa foto <strong>não será publicada</strong> no anúncio nem aparece
          para visitantes do site. Serve só para confirmação interna do
          cadastro — inclusive se você não mostra o rosto nas fotos públicas.
        </p>
        <p className="mt-2">
          O acesso é restrito e protegido pela{" "}
          <strong>Lei Geral de Proteção de Dados (LGPD)</strong>. Ninguém
          externo tem acesso a essa imagem.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-full border border-gray-200 p-1">
        <button
          type="button"
          onClick={() => {
            setMethod("foto_perfil");
            setFile(null);
            setError("");
          }}
          className={`rounded-full py-2.5 text-base font-medium ${
            method === "foto_perfil"
              ? "bg-[#0c0414] text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Foto de perfil
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod("documento");
            setFile(null);
            setError("");
          }}
          className={`rounded-full py-2.5 text-base font-medium ${
            method === "documento"
              ? "bg-[#0c0414] text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Documento
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <VerificationCamera
          key={method}
          facingMode={facingMode}
          label={cameraLabel}
          onCapture={(captured) => {
            setFile(captured);
            setError("");
          }}
        />

        <div>
          <label className="mb-1 block text-base font-medium text-gray-700">
            Ou escolha uma foto da galeria
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError("");
            }}
            className="block w-full text-base text-gray-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#faf6ef] file:px-4 file:py-2 file:text-purple-900"
          />
        </div>

        {preview && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Foto selecionada — confira antes de enviar:
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Pré-visualização"
              className="max-h-72 w-full rounded-3xl border border-gray-200 bg-white object-contain"
            />
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-sm text-luxury-accent underline hover:text-luxury-accent-hover"
            >
              Remover e tirar outra
            </button>
          </div>
        )}

        {error && (
          <p className="rounded-3xl border border-red-200 bg-red-50 px-3 py-2 text-base text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-3xl border border-green-200 bg-green-50 px-3 py-2 text-base text-green-800">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !file}
          className="w-full rounded-full bg-[#0c0414] py-3 text-base font-medium text-white hover:bg-purple-900 disabled:opacity-60"
        >
          {submitting ? "Enviando…" : "Confirmar cadastro"}
        </button>
      </form>
    </div>
  );
}

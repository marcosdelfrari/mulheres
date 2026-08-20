"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { REPORT_REASONS, type ReportReason } from "@/lib/reports";

interface ReportListingButtonProps {
  listingId: string;
  listingName: string;
}

export function ReportListingButton({
  listingId,
  listingName,
}: ReportListingButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const close = () => {
    if (submitting) return;
    setOpen(false);
    setError("");
  };

  const submit = async () => {
    if (!reason) {
      setError("Escolha um motivo.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          reason,
          details: details.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar.");
        return;
      }
      setDone(true);
    } catch {
      setError("Falha de conexão. Tente de novo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDone(false);
          setReason("");
          setDetails("");
          setError("");
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-red-700"
      >
        <Flag className="h-4 w-4" strokeWidth={2} aria-hidden />
        Denunciar anúncio
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="space-y-4">
                <h2
                  id="report-title"
                  className="font-serif text-2xl text-gray-900"
                >
                  Denúncia enviada
                </h2>
                <p className="text-sm text-gray-600">
                  Obrigado. Nossa equipe vai analisar o anúncio de{" "}
                  <strong>{listingName}</strong>.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#0c0414] px-5 py-3 text-sm font-semibold text-white"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2
                  id="report-title"
                  className="font-serif text-2xl text-gray-900"
                >
                  Denunciar anúncio
                </h2>
                <p className="text-sm text-gray-600">
                  Informe o motivo da denúncia de{" "}
                  <strong>{listingName}</strong>. A remoção só ocorre após
                  análise.
                </p>

                <fieldset className="space-y-2">
                  <legend className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Motivo
                  </legend>
                  {REPORT_REASONS.map((item) => (
                    <label
                      key={item}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 hover:border-gray-300"
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={item}
                        checked={reason === item}
                        onChange={() => setReason(item)}
                        className="accent-[#0c0414]"
                      />
                      {item}
                    </label>
                  ))}
                </fieldset>

                <div>
                  <label
                    htmlFor="report-details"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Detalhes (opcional)
                  </label>
                  <textarea
                    id="report-details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Conte o que aconteceu…"
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                {error ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                ) : null}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={close}
                    disabled={submitting}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={submitting}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {submitting ? "Enviando…" : "Enviar denúncia"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

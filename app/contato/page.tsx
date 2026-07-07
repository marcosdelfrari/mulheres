"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600";

export default function ContatoPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "duvida",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="font-serif text-2xl font-bold italic text-gray-900">Contato</h1>
        <p className="mt-1 text-base text-gray-600">
          Dúvidas, verificação de perfil ou suporte.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "E-mail", value: "contato@mulheres.app" },
          { title: "WhatsApp", value: "(11) 90000-0000" },
          { title: "Horário", value: "Seg–Sex, 9h–18h" },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-gray-200 p-4"
          >
            <p className="text-sm font-medium text-gray-500">{item.title}</p>
            <p className="mt-1 text-base font-medium text-gray-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {sent ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <h2 className="text-lg font-bold text-green-800">Mensagem enviada</h2>
          <p className="mt-1 text-base text-gray-700">
            Resposta em até 24h úteis. (Demonstração — nada foi enviado.)
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-4 text-base text-purple-700 underline"
          >
            Enviar outra
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-gray-200 p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">
                Nome
              </label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">
                E-mail
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-base font-medium text-gray-700">
              Assunto
            </label>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className={inputClass}
            >
              <option value="duvida">Dúvida</option>
              <option value="verificacao">Verificação de perfil</option>
              <option value="denuncia">Denúncia</option>
              <option value="parceria">Parceria</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-base font-medium text-gray-700">
              Mensagem
            </label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`${inputClass} resize-none`}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-purple-700 py-3 text-base font-medium text-white hover:bg-purple-800"
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  );
}

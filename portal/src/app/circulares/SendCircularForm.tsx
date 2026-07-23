"use client";

import { useState, useTransition } from "react";
import { sendCircular } from "./actions";

export function SendCircularForm({
  activeCuit,
  consorcios,
}: {
  activeCuit: string;
  consorcios: { id: string; nombre: string; total_con_whatsapp: string }[];
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await sendCircular(formData);
      window.location.href = "/circulares?sent=true";
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label">Consorcio *</label>
        <select disabled value={activeCuit} className="input bg-gray-50 cursor-not-allowed text-sm">
          {consorcios.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} ({c.total_con_whatsapp} con WhatsApp)
            </option>
          ))}
        </select>
        <input type="hidden" name="consorcio_id" value={activeCuit} />
      </div>

      <div>
        <label className="label">Mensaje *</label>
        <textarea
          name="message"
          required
          rows={6}
          className="input text-sm resize-none"
          placeholder={`Hola {{nombre}}!\n\nComunicamos que mañana se realizarán trabajos de mantenimiento en el ascensor entre las 9 y las 13hs.\n\nDisculpen las molestias.\nAdministración`}
        />
        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
          Usá <code className="bg-gray-100 px-1 rounded font-mono text-[10px]">{"{{nombre}}"}</code> para personalizar con el nombre del vecino.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-700">
        <p className="font-semibold text-xs mb-1.5 flex items-center gap-1">
          <span>💡</span> Antes de enviar
        </p>
        <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed opacity-90">
          <li>Los mensajes se envían de a uno con un intervalo de 300ms para evitar bloqueos</li>
          <li>Solo se envía a vecinos con número de WhatsApp registrado</li>
          <li>Verificá que el proveedor de WhatsApp esté configurado</li>
        </ul>
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full justify-center text-sm py-2">
        {pending ? "Enviando…" : "📢 Enviar circular"}
      </button>
    </form>
  );
}

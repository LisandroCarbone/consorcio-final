"use client";

import React from "react";

interface Consorcio {
  cuit: string;
  nombre: string;
}

export function ConsorcioRequerido({
  consorcios,
  seccion,
}: {
  consorcios: Consorcio[];
  seccion: string;
}) {
  const handleSelect = (cuit: string) => {
    document.cookie = `active_consorcio_cuit=${cuit}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  };

  return (
    <div className="max-w-md mx-auto my-16 text-center card p-8 space-y-6">
      <div className="mx-auto w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 text-3xl">
        🏢
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900">Consorcio requerido</h2>
        <p className="text-sm text-gray-500">
          Para ver y gestionar <strong>{seccion}</strong>, por favor selecciona un consorcio.
        </p>
      </div>
      <div className="space-y-3">
        <select
          onChange={(e) => handleSelect(e.target.value)}
          defaultValue=""
          className="input"
        >
          <option value="" disabled>— Seleccionar un consorcio —</option>
          {consorcios.map((c) => (
            <option key={c.cuit} value={c.cuit}>
              {c.nombre}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400">
          También puedes seleccionarlo en la barra superior en cualquier momento.
        </p>
      </div>
    </div>
  );
}

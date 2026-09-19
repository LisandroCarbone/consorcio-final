"use client";

import { useState } from "react";
import { CreatePeriodoButton } from "./CreatePeriodoButton";

export function NuevoPeriodoButton({ consorcioId }: { consorcioId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" className="btn-secondary text-xs whitespace-nowrap shrink-0" onClick={() => setOpen(true)}>
        + Nuevo período
      </button>
    );
  }

  return (
    <div className="card p-4 shrink-0 w-72">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Nuevo período</h3>
        <button type="button" className="text-xs text-gray-400 hover:text-gray-600" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
      <form className="space-y-3">
        <input type="hidden" name="consorcio_id" value={consorcioId} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Año *</label>
            <input name="anio" type="number" defaultValue={new Date().getFullYear()} required className="input" />
          </div>
          <div>
            <label className="label">Mes *</label>
            <input name="mes" type="number" min="1" max="12" defaultValue={new Date().getMonth() + 1} required className="input" />
          </div>
        </div>
        <div>
          <label className="label">Vencimiento</label>
          <input name="fecha_vencimiento" type="date" className="input" />
        </div>
        <CreatePeriodoButton />
      </form>
    </div>
  );
}

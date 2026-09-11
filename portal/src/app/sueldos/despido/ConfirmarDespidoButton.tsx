"use client";

import { useState } from "react";
import { accionLiquidarDespido } from "./actions";

export function ConfirmarDespidoButton({
  empleadoId,
  fechaEgreso,
  tipoEgreso,
}: {
  empleadoId: number;
  fechaEgreso: string;
  tipoEgreso: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("empleado_id", String(empleadoId));
      fd.set("fecha_egreso", fechaEgreso);
      fd.set("tipo_egreso", tipoEgreso);
      await accionLiquidarDespido(fd);
      window.location.href = `/sueldos/despido?empleado_id=${empleadoId}&fecha_egreso=${fechaEgreso}&tipo_egreso=${tipoEgreso}&liquidado=1`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al confirmar el egreso");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-3 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Confirmando…" : "Confirmar liquidación por egreso"}
      </button>
    </form>
  );
}

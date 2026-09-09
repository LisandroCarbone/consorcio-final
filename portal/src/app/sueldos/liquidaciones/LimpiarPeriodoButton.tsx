"use client";

import { useState, useTransition } from "react";
import { limpiarPeriodoSueldos } from "./actions";

export function LimpiarPeriodoButton({
  periodo,
  tipo,
  borradorCount,
}: {
  periodo: string;
  tipo: string;
  borradorCount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (borradorCount <= 0) return null;

  function handleClick() {
    const confirmed = window.confirm(
      `Se eliminarán ${borradorCount} liquidaciones en borrador/revisión del período. ` +
        `Los datos de novedades y empleados no se modifican. ¿Confirmar?`
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("periodo", periodo);
      fd.set("tipo", tipo);
      try {
        const result = await limpiarPeriodoSueldos(fd);
        if (result.blocked) {
          setError(result.blocked);
          return;
        }
        window.location.reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al limpiar el período");
      }
    });
  }

  return (
    <div className="inline-flex flex-col items-start">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="btn-danger py-1.5 text-xs"
      >
        {isPending ? "Limpiando…" : "Limpiar período"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

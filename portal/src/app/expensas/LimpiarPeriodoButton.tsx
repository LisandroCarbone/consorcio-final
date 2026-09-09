"use client";

import { useTransition } from "react";
import { limpiarPeriodoExpensas } from "./actions";

export function LimpiarPeriodoButton({
  periodoId,
  resultCount,
}: {
  periodoId: number;
  resultCount: number;
}) {
  const [isPending, startTransition] = useTransition();

  if (resultCount <= 0) return null;

  function handleClick() {
    const confirmed = confirm(
      `Se eliminarán ${resultCount} resultados de cuenta corriente calculados. Los gastos cargados se mantienen. ¿Confirmar?`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("periodo_id", String(periodoId));
      const result = await limpiarPeriodoExpensas(formData);
      if (result.blocked) {
        alert(result.blocked);
        return;
      }
      window.location.reload();
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className="btn-danger disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isPending ? "Limpiando..." : "🗑️ Limpiar período"}
    </button>
  );
}

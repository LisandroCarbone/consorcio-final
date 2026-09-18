"use client";

import { useTransition } from "react";
import { revertirEgresoAction } from "./actions";
import { Undo2 } from "lucide-react";

export function RevertirEgresoButton({ empleadoId, nombre }: { empleadoId: number; nombre: string }) {
  const [loading, startTransition] = useTransition();

  return (
    <button
      disabled={loading}
      className="text-amber-600 hover:text-amber-800 transition-colors disabled:opacity-50 flex items-center gap-1 text-xs font-medium"
      title="Revertir egreso"
      onClick={() => {
        if (!confirm(`¿Revertir el egreso de ${nombre}? El empleado volverá a estado activo.`)) return;
        const fd = new FormData();
        fd.set("empleado_id", String(empleadoId));
        startTransition(() => {
          revertirEgresoAction(fd).catch(() => {});
        });
      }}
    >
      <Undo2 className="w-3.5 h-3.5" />
      {loading ? "Revirtiendo…" : "Revertir"}
    </button>
  );
}

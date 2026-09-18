"use client";

import { useTransition } from "react";
import { revertirEgresoAction } from "./actions";
import { Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function RevertirEgresoButton({ empleadoId, nombre }: { empleadoId: number; nombre: string }) {
  const [loading, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={loading}
      className="text-amber-600 hover:text-amber-800 transition-colors disabled:opacity-50 flex items-center gap-1 text-xs font-medium"
      title="Revertir egreso"
      onClick={() => {
        if (!confirm(`¿Revertir el egreso de ${nombre}? El empleado volverá a estado activo.`)) return;
        const fd = new FormData();
        fd.set("empleado_id", String(empleadoId));
        startTransition(async () => {
          try {
            await revertirEgresoAction(fd);
            router.refresh();
          } catch (e: unknown) {
            alert(`Error al revertir: ${e instanceof Error ? e.message : "error desconocido"}`);
          }
        });
      }}
    >
      <Undo2 className="w-3.5 h-3.5" />
      {loading ? "Revirtiendo…" : "Revertir"}
    </button>
  );
}

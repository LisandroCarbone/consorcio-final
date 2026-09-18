"use client";

import { useTransition } from "react";
import { eliminarBorradorAction } from "./actions";
import { Trash2 } from "lucide-react";

export function EliminarBorradorButton({ id }: { id: number }) {
  const [loading, startTransition] = useTransition();

  return (
    <button
      disabled={loading}
      className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
      title="Eliminar borrador"
      onClick={() => {
        if (!confirm("¿Eliminar este borrador?")) return;
        const fd = new FormData();
        fd.set("id", String(id));
        startTransition(() => {
          eliminarBorradorAction(fd).catch(() => {});
        });
      }}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

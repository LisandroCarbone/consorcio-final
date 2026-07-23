"use client";

import { useState, useTransition } from "react";
import { updatePeriodoVencimiento, deletePeriodo } from "./actions";

interface Props {
  periodoId: number;
  fechaVencimiento: string | null;
  estado: string;
}

export function PeriodoActionsMenu({ periodoId, fechaVencimiento, estado }: Props) {
  const [editingVenc, setEditingVenc] = useState(false);
  const [vencValue, setVencValue] = useState(fechaVencimiento?.slice(0, 10) ?? "");
  const [isPending, startTransition] = useTransition();

  const handleSaveVenc = () => {
    startTransition(async () => {
      await updatePeriodoVencimiento(periodoId, vencValue || null);
      setEditingVenc(false);
      window.location.reload();
    });
  };

  const handleDelete = () => {
    if (!confirm("¿Eliminar este período? Se borrarán todos sus gastos. Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      await deletePeriodo(periodoId);
      window.location.reload();
    });
  };

  if (editingVenc) {
    return (
      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm shrink-0">
        <input
          type="date"
          value={vencValue}
          onChange={(e) => setVencValue(e.target.value)}
          className="px-1.5 py-0.5 text-xs border border-gray-200 rounded-md focus:border-brand-500 focus:outline-none w-28"
          autoFocus
        />
        <button
          type="button"
          onClick={handleSaveVenc}
          disabled={isPending}
          className="text-xs text-green-600 hover:text-green-800 font-bold px-1 py-0.5 transition-colors"
          title="Guardar"
        >
          {isPending ? "..." : "✓"}
        </button>
        <button
          type="button"
          onClick={() => setEditingVenc(false)}
          className="text-xs text-gray-400 hover:text-gray-600 px-1 py-0.5 transition-colors"
          title="Cancelar"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-1 justify-end shrink-0 select-none">
      <button
        type="button"
        onClick={() => setEditingVenc(true)}
        className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand-600 transition-colors text-sm"
        title={fechaVencimiento ? "Cambiar vencimiento" : "Agregar vencimiento"}
      >
        📅
      </button>
      {estado === "abierto" && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors text-sm"
          title="Eliminar período"
        >
          🗑️
        </button>
      )}
    </div>
  );
}

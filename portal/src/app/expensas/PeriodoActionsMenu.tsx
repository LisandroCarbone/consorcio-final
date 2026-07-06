"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePeriodoVencimiento, deletePeriodo } from "./actions";

interface Props {
  periodoId: number;
  fechaVencimiento: string | null;
  estado: string;
}

export function PeriodoActionsMenu({ periodoId, fechaVencimiento, estado }: Props) {
  const [open, setOpen] = useState(false);
  const [editingVenc, setEditingVenc] = useState(false);
  const [vencValue, setVencValue] = useState(fechaVencimiento?.slice(0, 10) ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSaveVenc = () => {
    startTransition(async () => {
      await updatePeriodoVencimiento(periodoId, vencValue || null);
      setEditingVenc(false);
      setOpen(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm("¿Eliminar este período? Se borrarán todos sus gastos. Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      await deletePeriodo(periodoId);
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setEditingVenc(false); }}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title="Opciones del período"
      >
        ⋯
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => { setOpen(false); setEditingVenc(false); }} />
          <div className="absolute right-0 top-full mt-1 z-40 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            {editingVenc ? (
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Fecha de vencimiento</p>
                <input
                  type="date"
                  value={vencValue}
                  onChange={(e) => setVencValue(e.target.value)}
                  className="input text-sm w-full mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveVenc}
                    disabled={isPending}
                    className="btn-primary text-xs flex-1 justify-center"
                  >
                    {isPending ? "Guardando…" : "Guardar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingVenc(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancelar
                  </button>
                </div>
                {vencValue && (
                  <button
                    type="button"
                    onClick={() => { setVencValue(""); handleSaveVenc(); }}
                    className="mt-2 text-xs text-gray-400 hover:text-red-500 w-full text-center"
                  >
                    Quitar vencimiento
                  </button>
                )}
              </div>
            ) : (
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => setEditingVenc(true)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                >
                  <span>📅</span>
                  <span>{fechaVencimiento ? "Cambiar vencimiento" : "Agregar vencimiento"}</span>
                </button>
                {estado === "abierto" && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors border-t border-gray-100"
                  >
                    <span>🗑️</span>
                    <span>{isPending ? "Eliminando…" : "Eliminar período"}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

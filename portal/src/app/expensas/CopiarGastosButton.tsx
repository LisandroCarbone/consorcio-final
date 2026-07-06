"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getGastosAnteriores, copiarGastos } from "./actions";
import { formatMoney } from "@/lib/format";
import { CATEGORIA_LABELS } from "./ExpensasTableClient";

const MES_LABELS = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

type GastoAnterior = { id: number; descripcion: string; monto: string; categoria: number; tipo: string };
type SourcePeriodo = { id: number; anio: number; mes: number } | null;

export function CopiarGastosButton({ periodoId }: { periodoId: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gastos, setGastos] = useState<GastoAnterior[]>([]);
  const [source, setSource] = useState<SourcePeriodo>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOpen = async () => {
    if (open) { setOpen(false); return; }
    setLoading(true);
    const { gastos: g, sourcePeriodo } = await getGastosAnteriores(periodoId);
    setGastos(g);
    setSource(sourcePeriodo);
    setSelected(new Set(g.map((x) => x.id))); // all checked by default
    setLoading(false);
    setOpen(true);
  };

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === gastos.length ? new Set() : new Set(gastos.map((g) => g.id))
    );

  const handleCopy = () => {
    startTransition(async () => {
      await copiarGastos(periodoId, Array.from(selected));
      setOpen(false);
      router.refresh();
    });
  };

  // Group for display
  const grouped = new Map<number, GastoAnterior[]>();
  for (const g of gastos) {
    if (!grouped.has(g.categoria)) grouped.set(g.categoria, []);
    grouped.get(g.categoria)!.push(g);
  }
  const sortedCats = Array.from(grouped.keys()).sort((a, b) => a - b);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpen}
        disabled={loading}
        className="btn-secondary flex items-center gap-1.5"
      >
        {loading ? (
          <span className="text-xs text-gray-400">Cargando…</span>
        ) : (
          <>
            <span>📋</span>
            <span>Copiar período anterior</span>
          </>
        )}
      </button>

      {open && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute left-0 top-full mt-2 z-40 w-[480px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  Gastos de {source ? `${MES_LABELS[source.mes]} ${source.anio}` : "—"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Seleccioná los gastos que querés copiar a este período
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {gastos.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">
                No hay gastos anteriores disponibles.
              </p>
            ) : (
              <>
                {/* Select all */}
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selected.size === gastos.length}
                      onChange={toggleAll}
                      className="rounded border-gray-300 text-brand-600"
                    />
                    Seleccionar todos ({gastos.length})
                  </label>
                  <span className="text-xs text-gray-400">{selected.size} seleccionados</span>
                </div>

                {/* Gastos grouped by category */}
                <div className="max-h-72 overflow-y-auto">
                  {sortedCats.map((cat) => (
                    <div key={cat}>
                      <div className="px-4 py-1.5 bg-gray-50 border-y border-gray-100">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          {cat}. {CATEGORIA_LABELS[cat] ?? `Cat. ${cat}`}
                        </span>
                      </div>
                      {grouped.get(cat)!.map((g) => (
                        <label
                          key={g.id}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(g.id)}
                            onChange={() => toggle(g.id)}
                            className="rounded border-gray-300 text-brand-600 shrink-0"
                          />
                          <span className="flex-1 text-sm text-gray-800 leading-snug">{g.descripcion}</span>
                          <span className="text-xs font-mono text-gray-500 shrink-0">{formatMoney(g.monto)}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn-secondary text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={selected.size === 0 || isPending}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {isPending ? "Copiando…" : `Copiar ${selected.size} gasto${selected.size !== 1 ? "s" : ""}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

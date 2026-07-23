"use client";

import { useState, useTransition } from "react";
import { formatMoney } from "@/lib/format";
import { addProvision, deleteProvision, marcarProvisionPagada, updateGasto, moverGasto } from "./actions";
import { CATEGORIA_LABELS } from "./ExpensasTableClient";
import MaskedInput from "@/components/ui/MaskedInput";

const CATEGORIA_COLORS: Record<number, string> = {
  1: "bg-indigo-50 border-indigo-200 text-indigo-800",
  2: "bg-blue-50 border-blue-200 text-blue-800",
  3: "bg-cyan-50 border-cyan-200 text-cyan-800",
  4: "bg-amber-50 border-amber-200 text-amber-800",
  5: "bg-orange-50 border-orange-200 text-orange-800",
  6: "bg-slate-50 border-slate-200 text-slate-800",
  7: "bg-green-50 border-green-200 text-green-800",
  8: "bg-violet-50 border-violet-200 text-violet-800",
  9: "bg-red-50 border-red-200 text-red-800",
  10: "bg-gray-50 border-gray-200 text-gray-700",
};

export interface ProvisionRow {
  id: number;
  concepto: string;
  monto: string;
  tipo: string;
  categoria: number;
  provision_pagada: boolean;
  provision_pagada_periodo_id: number | null;
  pct_a: number;
}

interface Props {
  provisiones: ProvisionRow[];
  periodoId: number;
  unidades: { id: number; uf: number }[];
}

function EditProvisionRow({ p, periodoId, onCancel }: { p: ProvisionRow; periodoId: number; onCancel: () => void }) {
  const [tipo, setTipo] = useState(p.tipo);
  const [aperturar, setAperturar] = useState(Number(p.pct_a) > 0 && Number(p.pct_a) < 100);
  const [pctA, setPctA] = useState(Number(p.pct_a ?? 100));

  const handleTipoChange = (val: string) => {
    setTipo(val);
    if (val === "A") setPctA(100);
    else if (val === "B") setPctA(0);
    setAperturar(false);
  };

  return (
    <tr className="border-b border-gray-100 bg-amber-50">
      <td className="td" colSpan={4}>
        <form action={async (formData: FormData) => { await updateGasto(formData); window.location.reload(); }} className="flex flex-wrap gap-2 items-end py-1">
          <input type="hidden" name="id" value={p.id} />
          <input type="hidden" name="periodo_id" value={periodoId} />
          <input type="hidden" name="categoria" value={p.categoria} />
          <input type="hidden" name="pct_a" value={aperturar ? pctA : (tipo === "B" ? 0 : 100)} />
          <div className="flex-1 min-w-48">
            <label className="label text-xs">Concepto</label>
            <input name="concepto" defaultValue={p.concepto} required className="input" />
          </div>
          <div className="w-36">
            <label className="label text-xs">Monto</label>
            <MaskedInput preset="money" name="monto" defaultValue={Number(p.monto)} required className="input" />
          </div>
          <div className="w-36">
            <label className="label text-xs">Tipo</label>
            <select name="tipo" value={tipo} onChange={(e) => handleTipoChange(e.target.value)} className="input">
              <option value="A">Coeficiente A</option>
              <option value="B">Coeficiente B</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-1.5 text-xs text-gray-600 pb-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={aperturar}
                onChange={(e) => {
                  setAperturar(e.target.checked);
                  setPctA(e.target.checked ? 50 : (tipo === "B" ? 0 : 100));
                }}
                className="rounded border-gray-300 text-brand-600"
              />
              Aperturar A/B
            </label>
            {aperturar && (
              <div className="w-24">
                <label className="label text-xs">% Coef A</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={pctA}
                  onChange={(e) => setPctA(Number(e.target.value))}
                  className="input"
                />
                <p className="text-xs text-gray-400">({100 - pctA}% Coef B)</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 self-end">
            <button type="submit" className="btn-primary text-xs px-3 py-1.5">Guardar</button>
            <button type="button" onClick={onCancel} className="btn-secondary text-xs px-3 py-1.5">Cancelar</button>
          </div>
        </form>
      </td>
    </tr>
  );
}

export function ProvisionesSection({ provisiones, periodoId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [concepto, setConcepto] = useState("");
  const [tipo, setTipo] = useState<"A" | "B">("A");
  const [aperturar, setAperturar] = useState(false);
  const [pctA, setPctA] = useState(100);
  const [editingId, setEditingId] = useState<number | null>(null);

  const total = provisiones.reduce((sum, p) => sum + Number(p.monto), 0);
  const pendientes = provisiones.filter((p) => !p.provision_pagada);
  const pagadas = provisiones.filter((p) => p.provision_pagada);

  const handleAdd = (fd: FormData) => {
    startTransition(async () => {
      await addProvision(fd);
      setConcepto("");
      setTipo("A");
      setAperturar(false);
      setPctA(100);
      window.location.reload();
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("¿Eliminar esta provisión?")) return;
    startTransition(async () => {
      await deleteProvision(id);
      window.location.reload();
    });
  };

  const handlePagada = (id: number) => {
    if (!confirm("¿Marcar esta provisión como pagada? No sumará de nuevo a expensas.")) return;
    startTransition(async () => {
      await marcarProvisionPagada(id, periodoId);
      window.location.reload();
    });
  };

  const grouped = new Map<number, ProvisionRow[]>();
  for (const p of pendientes) {
    if (!grouped.has(p.categoria)) grouped.set(p.categoria, []);
    grouped.get(p.categoria)!.push(p);
  }
  const sortedCats = Array.from(grouped.keys()).sort((a, b) => a - b);

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/30">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="font-semibold text-gray-800 text-base">Previsiones / Provisiones</h3>
        </div>
        <p className="text-lg font-bold text-gray-900">{formatMoney(total)}</p>
      </div>

      {provisiones.length === 0 ? (
        <p className="px-5 py-6 text-sm text-gray-400 text-center">
          No hay provisiones en este período.
        </p>
      ) : (
        <div>
          {sortedCats.map((cat) => {
            const rows = grouped.get(cat)!;
            const subtotal = rows.reduce((sum, r) => sum + Number(r.monto), 0);
            const colorClass = CATEGORIA_COLORS[cat] ?? "bg-gray-50 border-gray-200 text-gray-700";

            return (
              <div key={cat} className="border-b border-gray-100 last:border-b-0">
                <div className={`flex items-center justify-between px-5 py-2 border-b ${colorClass}`}>
                  <span className="text-sm font-bold uppercase tracking-wider">
                    {cat}. {CATEGORIA_LABELS[cat] ?? `Categoría ${cat}`}
                  </span>
                  <span className="text-sm font-mono font-bold">{formatMoney(subtotal)}</span>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {rows.map((p) =>
                      editingId === p.id ? (
                        <EditProvisionRow key={p.id} p={p} periodoId={periodoId} onCancel={() => setEditingId(null)} />
                      ) : (
                        <tr key={p.id} className="group border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-2.5">
                            <p className="font-medium text-gray-900 text-sm leading-snug">{p.concepto}</p>
                          </td>
                          <td className="px-3 py-2.5 w-24">
                            {(() => {
                              const pctA = Number(p.pct_a ?? 100);
                              if (pctA > 0 && pctA < 100) {
                                return (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-teal-100 text-teal-700">
                                    {`${pctA}%A / ${100 - pctA}%B`}
                                  </span>
                                );
                              }
                              return (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  pctA === 100 ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                }`}>
                                  {pctA === 100 ? "Coef A" : "Coef B"}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-3 py-2.5 text-right w-36 font-mono font-semibold text-gray-900 text-sm whitespace-nowrap">
                            {formatMoney(p.monto)}
                          </td>
                          <td className="px-3 py-2.5 w-40">
                            <div className="flex gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={async () => { await moverGasto(p.id, "up"); window.location.reload(); }}
                                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors text-xs"
                                title="Mover arriba"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={async () => { await moverGasto(p.id, "down"); window.location.reload(); }}
                                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors text-xs"
                                title="Mover abajo"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(p.id)}
                                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePagada(p.id)}
                                className="p-1 rounded hover:bg-green-100 text-gray-400 hover:text-green-700 transition-colors text-xs"
                                title="Marcar como pagada"
                                disabled={isPending}
                              >
                                ✅
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(p.id)}
                                className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                                title="Eliminar"
                                disabled={isPending}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            );
          })}

          {pagadas.length > 0 && (
            <details className="border-t border-gray-200">
              <summary className="px-5 py-3 text-xs font-semibold text-gray-500 cursor-pointer hover:bg-gray-50 select-none">
                Provisiones pagadas ({pagadas.length})
              </summary>
              <table className="w-full text-sm">
                <tbody>
                  {pagadas.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 last:border-b-0 bg-green-50/30">
                      <td className="px-5 py-2 text-gray-500 line-through">{p.concepto}</td>
                      <td className="px-3 py-2 w-24">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">Pagada</span>
                      </td>
                      <td className="px-3 py-2 text-right w-36 font-mono text-gray-400 text-sm">{formatMoney(p.monto)}</td>
                      <td className="px-3 py-2 w-32"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}
        </div>
      )}

      {/* Add provision form */}
      <form
        action={handleAdd}
        className="flex flex-wrap gap-2 px-5 py-3 bg-amber-50/40 border-t border-amber-100 items-end"
      >
        <input type="hidden" name="periodo_id" value={periodoId} />
        <input type="hidden" name="categoria" value="10" />
        <input type="hidden" name="pct_a" value={aperturar ? pctA : (tipo === "B" ? 0 : 100)} />

        <div className="flex-1 min-w-40">
          <label className="label text-xs">Concepto</label>
          <input
            name="concepto"
            required
            placeholder="Descripción de la provisión"
            className="input"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="w-36">
          <label className="label text-xs">Monto</label>
          <MaskedInput
            preset="money"
            name="monto"
            required
            placeholder="Ej: 300.000"
            className="input"
          />
        </div>

        <div className="w-36">
          <label className="label text-xs">Tipo</label>
          <select
            name="tipo"
            className="input"
            value={tipo}
            onChange={(e) => {
              const v = e.target.value as "A" | "B";
              setTipo(v);
              setAperturar(false);
              setPctA(v === "B" ? 0 : 100);
            }}
            disabled={isPending}
          >
            <option value="A">Coeficiente A</option>
            <option value="B">Coeficiente B</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 pb-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={aperturar}
              onChange={(e) => {
                setAperturar(e.target.checked);
                setPctA(e.target.checked ? 50 : (tipo === "B" ? 0 : 100));
              }}
              disabled={isPending}
              className="rounded border-gray-300 text-brand-600"
            />
            Aperturar A/B
          </label>
          {aperturar && (
            <div className="w-24">
              <label className="label text-xs">% Coef A</label>
              <input
                type="number"
                min="1"
                max="99"
                value={pctA}
                onChange={(e) => setPctA(Number(e.target.value))}
                className="input"
                disabled={isPending}
              />
              <p className="text-xs text-gray-400">({100 - pctA}% Coef B)</p>
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary shrink-0 self-end" disabled={isPending}>
          {isPending ? "Guardando…" : "+ Agregar provisión"}
        </button>
      </form>
    </div>
  );
}

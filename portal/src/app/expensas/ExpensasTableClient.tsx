"use client";

import React, { useState } from "react";
import { formatMoney } from "@/lib/format";
import { deleteGasto, updateGasto } from "./actions";

export interface GastoRow {
  id: number;
  concepto: string;
  monto: string | number;
  tipo: string;
  categoria: number;
  liquidacion_id?: number | null;
  liq_bruto?: string | null;
  liq_descuentos?: string | null;
  liq_neto?: string | null;
  liq_tipo?: string | null;
  conceptos?: string | null; // JSON string from postgres
}

export const CATEGORIA_LABELS: Record<number, string> = {
  1: "Sueldos y Cargas Sociales",
  2: "Servicios Públicos y Tasas",
  3: "Abonos de Servicios",
  4: "Mantenimiento de Partes Comunes",
  5: "Reparaciones en Unidades",
  6: "Gastos Bancarios",
  7: "Gastos de Limpieza",
  8: "Gastos de Administración y Legales",
  9: "Seguros",
  10: "Otros",
};

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

interface ConceptoLiq {
  concepto: string;
  importe: number;
  tipo: "haber" | "descuento" | "no_remunerativo";
}

function SalaryBreakdown({ row }: { row: GastoRow }) {
  const [open, setOpen] = useState(false);
  const bruto = Number(row.liq_bruto || 0);
  const descuentos = Number(row.liq_descuentos || 0);
  const neto = Number(row.liq_neto || 0);

  // Postgres may return json_agg already parsed, or as a string
  let conceptos: ConceptoLiq[] = [];
  if (row.conceptos) {
    try {
      conceptos = typeof row.conceptos === "string"
        ? JSON.parse(row.conceptos)
        : (row.conceptos as unknown as ConceptoLiq[]);
    } catch { /* ignore */ }
  }

  const haberes = conceptos.filter((c) => c.tipo === "haber" || c.tipo === "no_remunerativo");
  const descuentosList = conceptos.filter((c) => c.tipo === "descuento");

  return (
    <div className="mt-1">
      {/* Collapsed summary — always visible */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>Bruto <span className="font-mono text-gray-600">{formatMoney(bruto)}</span></span>
        <span>·</span>
        <span>Desc. <span className="font-mono text-red-500">-{formatMoney(descuentos)}</span></span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-brand-500 hover:text-brand-700 transition-colors flex items-center gap-0.5"
        >
          {open ? "▲ ocultar" : "▼ detalle"}
        </button>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="mt-2 ml-0 text-xs border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm w-80">
          {haberes.length > 0 && (
            <div className="px-3 pt-2.5 pb-1.5">
              {haberes.map((c, i) => (
                <div key={i} className="flex justify-between py-0.5 text-gray-700">
                  <span>{c.concepto}</span>
                  <span className="font-mono">{formatMoney(c.importe)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between px-3 py-1.5 bg-gray-50 border-t border-gray-100 font-semibold text-gray-700">
            <span>Total bruto</span>
            <span className="font-mono">{formatMoney(bruto)}</span>
          </div>
          {descuentosList.length > 0 ? (
            <div className="px-3 py-1.5 border-t border-gray-100">
              {descuentosList.map((c, i) => (
                <div key={i} className="flex justify-between py-0.5 text-gray-600">
                  <span>{c.concepto}</span>
                  <span className="font-mono text-red-500">-{formatMoney(c.importe)}</span>
                </div>
              ))}
            </div>
          ) : descuentos > 0 ? (
            <div className="flex justify-between px-3 py-1.5 border-t border-gray-100 text-gray-600">
              <span>Descuentos legales</span>
              <span className="font-mono text-red-500">-{formatMoney(descuentos)}</span>
            </div>
          ) : null}
          <div className="flex justify-between px-3 py-2 bg-indigo-50 border-t border-indigo-100 font-bold text-indigo-800">
            <span>Total neto</span>
            <span className="font-mono">{formatMoney(neto)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  gastos: GastoRow[];
  periodoId: number;
}

export function ExpensasTableClient({ gastos, periodoId }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);

  if (gastos.length === 0) {
    return (
      <p className="px-5 py-6 text-sm text-gray-400 text-center">
        No hay gastos registrados en este período.
      </p>
    );
  }

  // Group by category
  const grouped = new Map<number, GastoRow[]>();
  for (const g of gastos) {
    if (!grouped.has(g.categoria)) grouped.set(g.categoria, []);
    grouped.get(g.categoria)!.push(g);
  }
  const sortedCategories = Array.from(grouped.keys()).sort((a, b) => a - b);

  return (
    <div>
      {sortedCategories.map((cat) => {
        const rows = grouped.get(cat)!;
        const subtotal = rows.reduce((sum, r) => sum + Number(r.monto), 0);
        const colorClass = CATEGORIA_COLORS[cat] ?? "bg-gray-50 border-gray-200 text-gray-700";

        return (
          <div key={cat} className="border-b border-gray-100 last:border-b-0">
            {/* Category header */}
            <div className={`flex items-center justify-between px-5 py-2 border-b ${colorClass}`}>
              <span className="text-xs font-bold uppercase tracking-wider">
                {cat}. {CATEGORIA_LABELS[cat] ?? `Categoría ${cat}`}
              </span>
              <span className="text-xs font-mono font-bold">{formatMoney(subtotal)}</span>
            </div>

            {/* Rows in this category */}
            <table className="w-full text-sm">
              <tbody>
                {rows.map((g) =>
                  editingId === g.id ? (
                    <tr key={g.id} className="border-b border-gray-100 bg-amber-50">
                      <td className="td" colSpan={4}>
                        <form action={updateGasto} className="flex flex-wrap gap-2 items-end py-1">
                          <input type="hidden" name="id" value={g.id} />
                          <input type="hidden" name="periodo_id" value={periodoId} />
                          <div className="flex-1 min-w-48">
                            <label className="label text-xs">Concepto</label>
                            <input name="concepto" defaultValue={g.concepto} required className="input" />
                          </div>
                          <div className="w-32">
                            <label className="label text-xs">Monto</label>
                            <input name="monto" type="number" step="0.01" defaultValue={Number(g.monto)} required className="input" />
                          </div>
                          <div className="w-44">
                            <label className="label text-xs">Categoría</label>
                            <select name="categoria" defaultValue={g.categoria} className="input">
                              {Object.entries(CATEGORIA_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{v}. {l}</option>
                              ))}
                            </select>
                          </div>
                          <div className="w-36">
                            <label className="label text-xs">Tipo</label>
                            <select name="tipo" defaultValue={g.tipo} className="input">
                              <option value="A">Coeficiente A</option>
                              <option value="B">Coeficiente B</option>
                              <option value="Particular">Particular</option>
                            </select>
                          </div>
                          <div className="flex gap-2 self-end">
                            <button type="submit" className="btn-primary text-xs px-3 py-1.5">Guardar</button>
                            <button type="button" onClick={() => setEditingId(null)} className="btn-secondary text-xs px-3 py-1.5">Cancelar</button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={g.id} className="group border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-2.5">
                        <p className="font-medium text-gray-900 text-sm leading-snug">{g.concepto}</p>
                        {g.liquidacion_id && (
                          <SalaryBreakdown row={g} />
                        )}
                      </td>
                      <td className="px-3 py-2.5 w-24 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          g.tipo === "A" ? "bg-blue-100 text-blue-700" :
                          g.tipo === "B" ? "bg-purple-100 text-purple-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {g.tipo === "A" ? "Coef A" : g.tipo === "B" ? "Coef B" : g.tipo}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right w-36 font-mono font-semibold text-gray-900 text-sm whitespace-nowrap">
                        {formatMoney(g.monto)}
                      </td>
                      <td className="px-3 py-2.5 w-16">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setEditingId(g.id)}
                            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <form action={deleteGasto.bind(null, g.id, periodoId)} onSubmit={(e) => { if (!confirm("¿Eliminar este gasto?")) e.preventDefault(); }}>
                            <button
                              type="submit"
                              className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </form>
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
    </div>
  );
}

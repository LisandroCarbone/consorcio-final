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
}

const CATEGORIA_LABELS: Record<number, string> = {
  1: "1 - Sueldos y Cargas",
  2: "2 - Servicios Públicos",
  3: "3 - Abonos de Servicios",
  4: "4 - Mantenimiento Común",
  5: "5 - Reparaciones en Unidades",
  6: "6 - Gastos Bancarios",
  7: "7 - Gastos de Limpieza",
  8: "8 - Gastos Administración",
  9: "9 - Seguros",
  10: "10 - Otros Gastos",
};

const TIPO_BADGES: Record<string, string> = {
  A: "bg-blue-100 text-blue-700",
  B: "bg-purple-100 text-purple-700",
  Particular: "bg-green-100 text-green-700",
};

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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="th">Concepto</th>
            <th className="th">Categoría</th>
            <th className="th">Tipo</th>
            <th className="th text-right">Monto</th>
            <th className="th w-16" />
          </tr>
        </thead>
        <tbody>
          {gastos.map((g) =>
            editingId === g.id ? (
              <tr key={g.id} className="border-b border-gray-100 bg-amber-50">
                <td className="td" colSpan={5}>
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
                          <option key={v} value={v}>{l}</option>
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
              <tr key={g.id} className="group border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="td font-medium text-gray-900">{g.concepto}</td>
                <td className="td text-gray-500 text-xs">{CATEGORIA_LABELS[g.categoria] ?? `Cat. ${g.categoria}`}</td>
                <td className="td">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_BADGES[g.tipo] ?? "bg-gray-100 text-gray-600"}`}>
                    {g.tipo === "A" ? "Coef A" : g.tipo === "B" ? "Coef B" : g.tipo}
                  </span>
                </td>
                <td className="td text-right font-mono font-semibold text-gray-900">
                  {formatMoney(g.monto)}
                </td>
                <td className="td">
                  <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setEditingId(g.id)}
                      className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <form action={deleteGasto.bind(null, g.id, periodoId)} onSubmit={(e) => { if (!confirm("¿Eliminar este gasto?")) e.preventDefault(); }}>
                      <button
                        type="submit"
                        className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
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
}

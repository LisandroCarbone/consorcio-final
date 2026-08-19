"use client";

import React, { useMemo, useState } from "react";
import { formatMoney } from "@/lib/format";
import MaskedInput from "@/components/ui/MaskedInput";
import {
  actualizarSaldoInicial,
  agregarPeriodoHistorial,
  editarPeriodoHistorial,
  eliminarPeriodoHistorial,
} from "../actions";
import * as XLSX from "xlsx";

export interface HistorialRow {
  id: number;
  anio: number;
  mes: number;
  total_mes: string;
  su_pago: string;
  saldo_anterior: string;
  intereses: string;
  deuda: string;
  total_pagar: string;
  periodo_estado: string;
  [key: string]: unknown;
}

interface Props {
  consorcioCuit: string;
  unidadId: number;
  uf: string;
  propietario: string;
  saldoInicial: number;
  tasaVigente: number;
  historialRows: HistorialRow[];
}

interface ComputedRow extends HistorialRow {
  saldoAnteriorCalc: number;
  expensas: number;
  pago: number;
  interesesCalc: number;
  saldoCalc: number;
  dias: number;
}

export default function HistorialCuentaCorrienteClient({
  consorcioCuit,
  unidadId,
  uf,
  propietario,
  saldoInicial,
  tasaVigente,
  historialRows,
}: Props) {
  const [editingSaldoInicial, setEditingSaldoInicial] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const historialUrl = `/finanzas/cuenta-corriente?consorcio=${consorcioCuit}&ver_historial=${unidadId}`;

  const computed = useMemo<ComputedRow[]>(() => {
    const result: ComputedRow[] = [];
    let deudasVivas: { capital: number; meses: number }[] = [];

    if (saldoInicial > 0) {
      deudasVivas.push({ capital: saldoInicial, meses: 0 });
    }

    let prevSaldo = saldoInicial;

    for (let i = 0; i < historialRows.length; i++) {
      const row = historialRows[i];
      const expensas = Number(row.total_mes);
      const pago = Number(row.su_pago);

      const saldoAnteriorCalc = prevSaldo;

      for (const d of deudasVivas) {
        d.meses++;
      }

      if (expensas > 0) {
        deudasVivas.push({ capital: expensas, meses: 0 });
      }

      // Apply payment FIFO BEFORE calculating interest
      let pagoRestante = pago;
      while (pagoRestante > 0 && deudasVivas.length > 0) {
        if (pagoRestante >= deudasVivas[0].capital) {
          pagoRestante -= deudasVivas[0].capital;
          deudasVivas.shift();
        } else {
          deudasVivas[0].capital -= pagoRestante;
          pagoRestante = 0;
        }
      }

      const interesesReal = deudasVivas.reduce(
        (sum, d) => sum + d.capital * tasaVigente * d.meses,
        0
      );

      const capitalPostPago = deudasVivas.reduce((s, d) => s + d.capital, 0);
      const saldoCalc = capitalPostPago + interesesReal;
      prevSaldo = saldoCalc;
      const diasMax = deudasVivas.length > 0
        ? Math.max(...deudasVivas.map(d => d.meses)) * 30
        : 0;

      result.push({
        ...row,
        saldoAnteriorCalc,
        expensas,
        pago,
        interesesCalc: interesesReal,
        saldoCalc,
        dias: diasMax,
      });
    }

    return result;
  }, [historialRows, saldoInicial, tasaVigente]);

  async function handleSubmit(action: (fd: FormData) => Promise<void>, form: HTMLFormElement) {
    setLoading(true);
    try {
      const fd = new FormData(form);
      await action(fd);
      window.location.href = historialUrl;
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este período histórico?")) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("res_cuenta_id", String(id));
      await eliminarPeriodoHistorial(fd);
      window.location.href = historialUrl;
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al eliminar");
      setLoading(false);
    }
  }

  function exportToExcel() {
    const data = computed.map((r) => ({
      Mes: `${String(r.mes).padStart(2, "0")}/${r.anio}`,
      "Saldo Anterior": Number(r.saldoAnteriorCalc.toFixed(2)),
      "Expensas del Mes": Number(r.expensas.toFixed(2)),
      "Su Pago": Number(r.pago.toFixed(2)),
      Días: r.dias,
      Intereses: Number(r.interesesCalc.toFixed(2)),
      Saldo: Number(r.saldoCalc.toFixed(2)),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 10 },
      { wch: 16 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cuenta Corriente");
    XLSX.writeFile(wb, `cuenta_corriente_${uf}.xlsx`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <a
        href={`?consorcio=${consorcioCuit}`}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Historial de Cuenta Corriente
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Unidad {uf} · {propietario} · Tasa vigente:{" "}
              {tasaVigente > 0
                ? `${(tasaVigente * 100).toFixed(1)}% mensual`
                : "sin tasa configurada"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportToExcel}
              className="btn-secondary text-xs flex items-center gap-1.5"
              title="Exportar a Excel"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
            <a
              href={`?consorcio=${consorcioCuit}`}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </a>
          </div>
        </div>

        {/* Saldo Inicial */}
        <div className="px-6 py-3 bg-blue-50/50 border-b border-gray-100 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Saldo inicial</span>
          <span className="text-xs text-gray-400">Deuda previa al primer período cargado</span>
          <div className="ml-auto flex items-center gap-2">
            {editingSaldoInicial ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(actualizarSaldoInicial, e.currentTarget);
                }}
                className="flex items-center gap-2"
              >
                <input type="hidden" name="unidad_id" value={unidadId} />
                <MaskedInput
                  preset="money"
                  name="saldo_inicial"
                  defaultValue={saldoInicial}
                  className="input text-right w-36 text-sm py-1"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="p-1 rounded hover:bg-green-100 text-green-600"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSaldoInicial(false)}
                  className="p-1 rounded hover:bg-gray-200 text-gray-400"
                >
                  ✕
                </button>
              </form>
            ) : (
              <>
                <span className="font-mono text-sm font-semibold">
                  {formatMoney(saldoInicial)}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingSaldoInicial(true)}
                  className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
                  title="Editar saldo inicial"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1 px-6 py-3">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Mes</th>
                <th className="py-2.5 px-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Saldo Anterior</th>
                <th className="py-2.5 px-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Expensas</th>
                <th className="py-2.5 px-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Su Pago</th>
                <th className="py-2.5 px-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Días</th>
                <th className="py-2.5 px-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Intereses</th>
                <th className="py-2.5 px-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Saldo</th>
                <th className="py-2.5 px-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {computed.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50/50"
                >
                  <td className="py-2 px-3 font-medium">
                    {String(r.mes).padStart(2, "0")}/{r.anio}
                  </td>

                  {editingId === r.id ? (
                    <td colSpan={6} className="py-2 px-3">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSubmit(editarPeriodoHistorial, e.currentTarget);
                        }}
                        className="flex items-center gap-3"
                      >
                        <input type="hidden" name="res_cuenta_id" value={r.id} />
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-400 block mb-0.5">Expensas</label>
                          <MaskedInput
                            preset="money"
                            name="expensas"
                            defaultValue={r.expensas}
                            className="input text-right w-full text-sm py-1"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-400 block mb-0.5">Su pago</label>
                          <MaskedInput
                            preset="money"
                            name="pago"
                            defaultValue={r.pago}
                            className="input text-right w-full text-sm py-1"
                          />
                        </div>
                        <div className="flex items-center gap-1 pt-3">
                          <button type="submit" disabled={loading} className="p-1 rounded hover:bg-green-100 text-green-600" title="Guardar">✓</button>
                          <button type="button" onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-gray-200 text-gray-400" title="Cancelar">✕</button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="py-2 px-3 text-right font-mono text-gray-500">
                        {formatMoney(r.saldoAnteriorCalc)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {formatMoney(r.expensas)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-green-700">
                        {r.pago > 0 ? `(${formatMoney(r.pago)})` : formatMoney(0)}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-gray-400 text-xs">
                        {r.dias}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-amber-700">
                        {r.interesesCalc > 0 ? formatMoney(r.interesesCalc) : formatMoney(0)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">
                        {formatMoney(r.saldoCalc)}
                      </td>
                    </>
                  )}

                  <td className="py-2 px-3">
                    {r.periodo_estado !== "liquidado" && editingId !== r.id && (
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingId(r.id)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          disabled={loading}
                          className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {computed.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400 text-sm">
                    No hay períodos cargados. Usá el formulario de abajo para agregar el historial.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add form */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(agregarPeriodoHistorial, e.currentTarget);
            }}
            className="flex items-end gap-3"
          >
            <input type="hidden" name="unidad_id" value={unidadId} />
            <div className="w-20">
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block mb-1">Mes</label>
              <input
                type="number"
                name="mes"
                min={1}
                max={12}
                required
                placeholder="MM"
                className="input text-sm py-1.5 w-full text-center"
              />
            </div>
            <div className="w-20">
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block mb-1">Año</label>
              <input
                type="number"
                name="anio"
                min={2000}
                max={2100}
                required
                placeholder="AAAA"
                className="input text-sm py-1.5 w-full text-center"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block mb-1">Expensas del mes</label>
              <MaskedInput
                preset="money"
                name="expensas"
                defaultValue={0}
                required
                className="input text-right text-sm py-1.5 w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide block mb-1">Su pago</label>
              <MaskedInput
                preset="money"
                name="pago"
                defaultValue={0}
                className="input text-right text-sm py-1.5 w-full"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-sm py-1.5 px-4 whitespace-nowrap"
            >
              {loading ? "Guardando..." : "Agregar"}
            </button>
          </form>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Saldo anterior e intereses se calculan automáticamente.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <a href={`?consorcio=${consorcioCuit}`} className="btn-secondary">
            Cerrar
          </a>
        </div>
      </div>
    </div>
  );
}

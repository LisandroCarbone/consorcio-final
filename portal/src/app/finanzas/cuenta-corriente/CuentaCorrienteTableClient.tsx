"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { registrarPago } from "../actions";

export interface CuentaCorrienteRow {
  unidad_id: number;
  unidad_numero: string;
  propietario: string | null;
  saldo_anterior: number;
  su_pago: number;
  coef_a: number;
  expensas_a: number;
  coef_b: number;
  expensas_b: number;
  total_mes: number;
  deuda: number;
  intereses: number;
  total_pagar: number;
  estado: string | null;
  // Keep for modals:
  total_pagado?: string;
  total_pagado_count?: number;
  ultimo_pago?: string | null;
  expensa_pendiente_id?: number | null;
  expensa_pendiente_monto?: string | null;
  [key: string]: unknown;
}

interface CuentaCorrienteTableClientProps {
  consorcioCuit: string;
  data: CuentaCorrienteRow[];
}

function money(n: number) {
  return formatMoney(n);
}

function formatPercent(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function MoneyCell({ value, bold = false }: { value: number; bold?: boolean }) {
  const negative = value < 0;
  return (
    <td
      className={`py-2 px-3 text-right font-mono whitespace-nowrap ${bold ? "font-bold" : ""} ${
        negative ? "text-red-600" : "text-gray-800"
      }`}
    >
      {negative ? `(${money(Math.abs(value))})` : money(value)}
    </td>
  );
}

export function CuentaCorrienteTableClient({
  consorcioCuit,
  data,
}: CuentaCorrienteTableClientProps) {
  const [pagoUnidad, setPagoUnidad] = useState<CuentaCorrienteRow | null>(null);
  const [montoInput, setMontoInput] = useState("");

  const totals = data.reduce(
    (acc, r) => ({
      saldo_anterior: acc.saldo_anterior + Number(r.saldo_anterior),
      su_pago: acc.su_pago + Number(r.su_pago),
      expensas_a: acc.expensas_a + Number(r.expensas_a),
      expensas_b: acc.expensas_b + Number(r.expensas_b),
      total_mes: acc.total_mes + Number(r.total_mes),
      deuda: acc.deuda + Number(r.deuda),
      intereses: acc.intereses + Number(r.intereses),
      total_pagar: acc.total_pagar + Number(r.total_pagar),
    }),
    {
      saldo_anterior: 0,
      su_pago: 0,
      expensas_a: 0,
      expensas_b: 0,
      total_mes: 0,
      deuda: 0,
      intereses: 0,
      total_pagar: 0,
    }
  );

  return (
    <div className="w-full">
      {data.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          No hay unidades registradas en este consorcio.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase tracking-wide">
                <th className="py-2 px-3 text-left sticky left-0 bg-gray-100 z-10 min-w-[60px]">U.F.</th>
                <th className="py-2 px-3 text-left sticky left-[60px] bg-gray-100 z-10 min-w-[160px]">Nombre</th>
                <th className="py-2 px-3 text-right min-w-[110px]">Saldo Anterior</th>
                <th className="py-2 px-3 text-right min-w-[110px]">Su Pago</th>
                <th className="py-2 px-3 text-right min-w-[70px]">% A</th>
                <th className="py-2 px-3 text-right min-w-[100px]">Exp. A</th>
                <th className="py-2 px-3 text-right min-w-[70px]">% B</th>
                <th className="py-2 px-3 text-right min-w-[100px]">Exp. B</th>
                <th className="py-2 px-3 text-right min-w-[110px]">Totales del Mes</th>
                <th className="py-2 px-3 text-right min-w-[100px]">Deuda</th>
                <th className="py-2 px-3 text-right min-w-[100px]">Intereses</th>
                <th className="py-2 px-3 text-right min-w-[110px]">Total</th>
                <th className="py-2 px-3 text-center min-w-[200px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((r, idx) => (
                <tr
                  key={r.unidad_id}
                  className={`hover:bg-blue-50/50 ${idx % 2 === 1 ? "bg-gray-50/40" : ""}`}
                >
                  <td className="py-2 px-3 font-semibold text-gray-900 sticky left-0 bg-inherit z-10">
                    {r.unidad_numero}
                  </td>
                  <td className="py-2 px-3 text-gray-700 whitespace-nowrap sticky left-[60px] bg-inherit z-10">
                    {r.propietario ?? "—"}
                  </td>
                  <MoneyCell value={Number(r.saldo_anterior)} />
                  <MoneyCell value={-Number(r.su_pago)} />
                  <td className="py-2 px-3 text-right font-mono text-gray-500">
                    {formatPercent(Number(r.coef_a))}
                  </td>
                  <MoneyCell value={Number(r.expensas_a)} />
                  <td className="py-2 px-3 text-right font-mono text-gray-500">
                    {formatPercent(Number(r.coef_b))}
                  </td>
                  <MoneyCell value={Number(r.expensas_b)} />
                  <MoneyCell value={Number(r.total_mes)} />
                  <MoneyCell value={Number(r.deuda)} />
                  <MoneyCell value={Number(r.intereses)} />
                  <MoneyCell value={Number(r.total_pagar)} bold />
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPagoUnidad(r);
                          setMontoInput(r.expensa_pendiente_monto || String(r.total_pagar) || "");
                        }}
                        className="btn-primary text-xs py-1.5 px-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1 transition-all whitespace-nowrap font-medium shadow-sm"
                      >
                        💸 Cobrar
                      </button>
                      <Link
                        href={`?consorcio=${consorcioCuit}&ver_historial=${r.unidad_id}`}
                        className="btn-secondary text-xs py-1.5 px-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 transition-all whitespace-nowrap font-medium"
                      >
                        📋 Historial
                      </Link>
                      {(r.total_pagado_count ?? 0) > 0 && (
                        <Link
                          href={`?consorcio=${consorcioCuit}&ver_pagos=${r.unidad_id}`}
                          className="btn-secondary text-xs py-1.5 px-2.5 rounded-lg border border-amber-300 text-amber-700 bg-amber-50/50 hover:bg-amber-50 flex items-center justify-center gap-1 transition-all whitespace-nowrap font-medium"
                        >
                          ⚙️
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
                <td className="py-2 px-3 sticky left-0 bg-gray-100 z-10" colSpan={2}>
                  TOTALES
                </td>
                <MoneyCell value={totals.saldo_anterior} bold />
                <MoneyCell value={-totals.su_pago} bold />
                <td className="py-2 px-3" />
                <MoneyCell value={totals.expensas_a} bold />
                <td className="py-2 px-3" />
                <MoneyCell value={totals.expensas_b} bold />
                <MoneyCell value={totals.total_mes} bold />
                <MoneyCell value={totals.deuda} bold />
                <MoneyCell value={totals.intereses} bold />
                <MoneyCell value={totals.total_pagar} bold />
                <td className="py-2 px-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Modal para Registrar Pago */}
      {pagoUnidad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            type="button"
            onClick={() => setPagoUnidad(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Registrar Cobranza</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Unidad {pagoUnidad.unidad_numero} · Propietario: {pagoUnidad.propietario || "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPagoUnidad(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form action={registrarPago} className="grid grid-cols-2 gap-4">
                <input type="hidden" name="consorcio_id" value={consorcioCuit} />
                <input type="hidden" name="unidad_id" value={pagoUnidad.unidad_id} />
                {pagoUnidad.expensa_pendiente_id && (
                  <input type="hidden" name="expensa_id" value={pagoUnidad.expensa_pendiente_id} />
                )}
                <div>
                  <label className="label text-xs">Fecha *</label>
                  <input
                    name="fecha"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    required
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="label text-xs">Monto *</label>
                  <div className="flex gap-2">
                    <input
                      name="monto"
                      type="number"
                      step="0.01"
                      value={montoInput}
                      onChange={(e) => setMontoInput(e.target.value)}
                      required
                      placeholder="0.00"
                      className="input text-sm flex-1"
                    />
                    {Number(pagoUnidad.total_pagar) > 0 && (
                      <button
                        type="button"
                        onClick={() => setMontoInput(String(pagoUnidad.total_pagar))}
                        className="px-2.5 py-1.5 text-xs font-semibold bg-green-50 border border-green-300 text-green-700 rounded-lg hover:bg-green-100 whitespace-nowrap transition-colors"
                        title="Cobrar saldo total"
                      >
                        Cobro total
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-xs">Medio de pago *</label>
                    <select name="medio_pago" className="input text-sm">
                      <option value="transferencia">Transferencia</option>
                      <option value="deposito">Depósito</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="debito_automatico">Débito Automático</option>
                      <option value="cheque">Cheque</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Referencia</label>
                    <input
                      name="referencia"
                      className="input text-sm"
                      placeholder="Nro de ticket, etc."
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="label text-xs">Notas</label>
                  <textarea name="notas" rows={2} className="input text-sm resize-none" placeholder="Opcional..." />
                </div>
                <div className="col-span-2 pt-2 flex gap-2 justify-end">
                  <button type="button" onClick={() => setPagoUnidad(null)} className="btn-secondary text-sm">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary text-sm">
                    Registrar Cobranza
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

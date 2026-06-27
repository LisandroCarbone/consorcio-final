'use client';

import React, { useState } from "react";
import { formatMoney } from "@/lib/format";
import { distribuirExpensaIndividual } from "./actions";

export interface UfLiquidacionRow {
  id: number;
  unidad_id: number;
  uf: string;
  propietario: string | null;
  monto_ordinario: string;
  monto_extraordinario: string;
  monto_fondo_reserva: string;
  total_pagar: string;
  enviada: boolean;
  pdf_url: string | null;
}

interface UfLiquidacionesTableClientProps {
  data: UfLiquidacionRow[];
}

export function UfLiquidacionesTableClient({ data }: UfLiquidacionesTableClientProps) {
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [status, setStatus] = useState<Record<number, { type: "success" | "error"; message: string }>>({});

  const handleSendIndividual = async (id: number) => {
    setSendingId(id);
    try {
      const res = await distribuirExpensaIndividual(id);
      if (res.success) {
        setStatus(prev => ({
          ...prev,
          [id]: { type: "success", message: "Enviado con éxito" }
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          [id]: { type: "error", message: res.error || "Error" }
        }));
      }
    } catch (e) {
      setStatus(prev => ({
        ...prev,
        [id]: { type: "error", message: "Error" }
      }));
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-5 py-3.5">Unidad</th>
            <th className="px-5 py-3.5">Propietario</th>
            <th className="px-5 py-3.5 text-right">Ordinario (A)</th>
            <th className="px-5 py-3.5 text-right">Extraordinario (B)</th>
            <th className="px-5 py-3.5 text-right">Fondo / Otros</th>
            <th className="px-5 py-3.5 text-right">Total</th>
            <th className="px-5 py-3.5 text-center">Estado Envío</th>
            <th className="px-5 py-3.5 text-right pr-6">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => {
            const rowStatus = status[row.id];
            const isSending = sendingId === row.id;

            return (
              <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-gray-900">{row.uf}</td>
                <td className="px-5 py-3.5 text-gray-700">{row.propietario ?? "—"}</td>
                <td className="px-5 py-3.5 text-right font-mono text-gray-600">{formatMoney(row.monto_ordinario)}</td>
                <td className="px-5 py-3.5 text-right font-mono text-gray-600">{formatMoney(row.monto_extraordinario)}</td>
                <td className="px-5 py-3.5 text-right font-mono text-gray-600">{formatMoney(row.monto_fondo_reserva)}</td>
                <td className="px-5 py-3.5 text-right font-mono font-bold text-gray-900">{formatMoney(row.total_pagar)}</td>
                <td className="px-5 py-3.5 text-center">
                  {row.enviada ? (
                    <span className="badge bg-green-100 text-green-700 inline-flex items-center gap-1">
                      ✓ Enviada
                    </span>
                  ) : (
                    <span className="badge bg-yellow-100 text-yellow-700">
                      Pendiente
                    </span>
                  )}
                  {rowStatus && (
                    <div className={`text-[10px] mt-1 font-semibold ${rowStatus.type === "success" ? "text-green-600" : "text-red-600"}`}>
                      {rowStatus.message}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    {row.pdf_url && (
                      <a
                        href={row.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary text-xs py-1 px-2.5 rounded-lg border border-gray-300 flex items-center gap-1 hover:bg-gray-50 transition-all"
                      >
                        📄 PDF
                      </a>
                    )}
                    <button
                      onClick={() => handleSendIndividual(row.id)}
                      disabled={isSending}
                      className="btn-primary text-xs py-1 px-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 flex items-center gap-1 transition-all"
                    >
                      {isSending ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>🚀 Enviar</>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

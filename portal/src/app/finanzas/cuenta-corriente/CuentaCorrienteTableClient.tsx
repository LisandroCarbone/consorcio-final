"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { formatMoney, formatDate } from "@/lib/format";
import { registrarPago } from "../actions";

export interface CuentaCorrienteRow {
  unidad_id: number;
  unidad_numero: string;
  propietario: string | null;
  total_expensas: string;
  total_pagado: string;
  total_pagado_count: number;
  saldo: string;
  ultimo_pago: string | null;
  expensa_pendiente_id: number | null;
  expensa_pendiente_monto: string | null;
  [key: string]: unknown;
}

interface CuentaCorrienteTableClientProps {
  consorcioCuit: string;
  data: CuentaCorrienteRow[];
}

export function CuentaCorrienteTableClient({
  consorcioCuit,
  data,
}: CuentaCorrienteTableClientProps) {
  const searchParams = useSearchParams();
  const pagoParam = searchParams.get("pago");
  const pagoUnidadId = pagoParam ? Number(pagoParam) : null;
  const pagoUnidad = data.find((r) => r.unidad_id === pagoUnidadId);

  const columns: ColumnDef<CuentaCorrienteRow>[] = [
    {
      accessorKey: "unidad_numero",
      header: "Unidad",
      cell: ({ row }) => <span className="font-semibold text-gray-900">{row.original.unidad_numero}</span>,
    },
    {
      accessorKey: "propietario",
      header: "Propietario",
      cell: ({ row }) => <span className="text-gray-700">{row.original.propietario ?? "—"}</span>,
    },
    {
      accessorKey: "total_expensas",
      header: () => <div className="text-right">Expensas Emitidas</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono text-gray-600">
          {formatMoney(row.original.total_expensas)}
        </div>
      ),
    },
    {
      accessorKey: "total_pagado",
      header: () => <div className="text-right">Pagado</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono text-green-700">
          {formatMoney(row.original.total_pagado)}
        </div>
      ),
    },
    {
      accessorKey: "saldo",
      header: () => <div className="text-right">Saldo</div>,
      cell: ({ row }) => {
        const deuda = Number(row.original.saldo);
        return (
          <div className="text-right font-mono font-bold">
            {deuda > 0 ? (
              <span className="text-red-600">- {formatMoney(deuda)}</span>
            ) : (
              <span className="text-green-600">Al día</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "ultimo_pago",
      header: () => <div className="text-center">Estado y Último Pago</div>,
      cell: ({ row }) => {
        const r = row.original;
        const deuda = Number(r.saldo);
        return (
          <div className="text-center">
            {deuda > 0 && Number(r.total_pagado) > 0 && (
              <span className="badge bg-orange-100 text-orange-700">Pago Parcial</span>
            )}
            {deuda === 0 && Number(r.total_pagado) > 0 && (
              <span className="badge bg-green-100 text-green-700">Al día</span>
            )}
            {r.ultimo_pago && (
              <p className="text-gray-400 text-[10px] mt-0.5">{formatDate(r.ultimo_pago)}</p>
            )}
            {!r.ultimo_pago && Number(r.total_pagado) === 0 && (
              <span className="text-gray-300 text-xs">—</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center justify-end gap-2 pr-2">
            <Link
              href={`?consorcio=${consorcioCuit}&pago=${r.unidad_id}`}
              className="btn-primary text-xs py-1.5 px-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1 transition-all whitespace-nowrap font-medium shadow-sm"
            >
              💸 Pagar
            </Link>
            <Link
              href={`?consorcio=${consorcioCuit}&ver_historial=${r.unidad_id}`}
              className="btn-secondary text-xs py-1.5 px-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 transition-all whitespace-nowrap font-medium"
            >
              📋 Historial
            </Link>
            {r.total_pagado_count > 0 && (
              <Link
                href={`?consorcio=${consorcioCuit}&ver_pagos=${r.unidad_id}`}
                className="btn-secondary text-xs py-1.5 px-2.5 rounded-lg border border-amber-300 text-amber-700 bg-amber-50/50 hover:bg-amber-50 flex items-center justify-center gap-1 transition-all whitespace-nowrap font-medium"
              >
                ⚙️ Gestionar ({r.total_pagado_count})
              </Link>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full">
      <DataTable columns={columns} data={data} emptyMessage="No hay unidades registradas en este consorcio." />

      {/* Modal para Registrar Pago */}
      {pagoUnidad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <Link
            href={`?consorcio=${consorcioCuit}`}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Registrar Pago</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Unidad {pagoUnidad.unidad_numero} · Propietario: {pagoUnidad.propietario || "—"}
                </p>
              </div>
              <Link
                href={`?consorcio=${consorcioCuit}`}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
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
                  <input
                    name="monto"
                    type="number"
                    step="0.01"
                    defaultValue={pagoUnidad.expensa_pendiente_monto || ""}
                    required
                    placeholder="0.00"
                    className="input text-sm"
                  />
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
                  <Link href={`?consorcio=${consorcioCuit}`} className="btn-secondary text-sm">
                    Cancelar
                  </Link>
                  <button type="submit" className="btn-primary text-sm">
                    Registrar Pago
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

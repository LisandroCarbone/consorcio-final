"use client";

import React, { useState } from "react";
import { formatMoney, formatDate } from "@/lib/format";
import { editarPago, eliminarPago } from "../actions";

interface Pago {
  id: number;
  fecha: string;
  monto: string;
  medio_pago: string;
  referencia: string | null;
  notes?: string | null;
  notas?: string | null;
}

interface ManagePaymentsModalProps {
  consorcioCuit: string;
  unidadId: number;
  uf: string;
  propietario: string;
  pagos: Pago[];
}

export default function ManagePaymentsModal({
  consorcioCuit,
  unidadId,
  uf,
  propietario,
  pagos,
}: ManagePaymentsModalProps) {
  const [editingPagoId, setEditingPagoId] = useState<number | null>(null);

  const editingPago = pagos.find((p) => p.id === editingPagoId);

  const handleEditClick = (pagoId: number) => {
    setEditingPagoId(pagoId);
  };

  const handleCancelEdit = () => {
    setEditingPagoId(null);
  };

  const handleDelete = async (pagoId: number) => {
    if (
      window.confirm(
        "¿Está seguro de que desea eliminar este pago? Esta acción no se puede deshacer y se recalcularán los saldos y prorrateos de expensas de la unidad."
      )
    ) {
      try {
        const formData = new FormData();
        formData.append("pago_id", String(pagoId));
        await eliminarPago(formData);
      } catch (err) {
        alert("Error al eliminar el pago: " + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <a
        href={`?consorcio=${consorcioCuit}`}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      ></a>

      {/* Modal Card */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Gestionar Pagos Registrados</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Unidad {uf} · Propietario: {propietario || "—"}
            </p>
          </div>
          <a
            href={`?consorcio=${consorcioCuit}`}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </a>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 space-y-6">
          {/* Edit Form Sub-panel */}
          {editingPago && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm animate-in slide-in-from-top-4 duration-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-1.5 text-sm">
                <span>✏️</span> Editar Movimiento de Pago
              </h4>
              <form
                action={async (formData) => {
                  try {
                    await editarPago(formData);
                    setEditingPagoId(null);
                  } catch (err) {
                    alert("Error al guardar cambios: " + (err instanceof Error ? err.message : String(err)));
                  }
                }}
                className="grid grid-cols-2 gap-3"
              >
                <input type="hidden" name="pago_id" value={editingPago.id} />
                
                <div>
                  <label className="label text-blue-900">Fecha *</label>
                  <input
                    name="fecha"
                    type="date"
                    defaultValue={editingPago.fecha.slice(0, 10)}
                    required
                    className="input border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="label text-blue-900">Monto *</label>
                  <input
                    name="monto"
                    type="number"
                    step="0.01"
                    min="0.01"
                    defaultValue={Number(editingPago.monto)}
                    required
                    className="input border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="label text-blue-900">Medio de pago *</label>
                  <select
                    name="medio_pago"
                    defaultValue={editingPago.medio_pago}
                    className="input border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="transferencia">Transferencia</option>
                    <option value="deposito">Depósito</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="debito_automatico">Débito automático</option>
                    <option value="cheque">Cheque</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="label text-blue-900">Referencia / Nro. operación</label>
                  <input
                    name="referencia"
                    type="text"
                    defaultValue={editingPago.referencia || ""}
                    placeholder="Ej: TRF-20240601-123"
                    className="input border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="label text-blue-900">Notas</label>
                  <input
                    name="notas"
                    type="text"
                    defaultValue={editingPago.notas || editingPago.notes || ""}
                    className="input border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2 flex gap-2 pt-2 border-t border-blue-100">
                  <button type="submit" className="btn-primary bg-blue-600 hover:bg-blue-700 border-none">
                    Guardar cambios
                  </button>
                  <button type="button" onClick={handleCancelEdit} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Payments */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                  <th className="py-3 px-4">Medio / Referencia</th>
                  <th className="py-3 px-4">Notas</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagos.map((p) => {
                  const isThisEditing = p.id === editingPagoId;
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-gray-50/50 transition-colors ${
                        isThisEditing ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-gray-600 font-medium">{formatDate(p.fecha)}</td>
                      <td className="py-3 px-4 text-right font-mono text-green-700 font-bold text-sm">
                        {formatMoney(p.monto)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold capitalize text-gray-800">
                          {p.medio_pago.replace("_", " ")}
                        </span>
                        {p.referencia && (
                          <span className="block text-[10px] text-gray-400 font-mono mt-0.5">
                            {p.referencia}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500 italic max-w-[150px] truncate" title={p.notas || p.notes || ""}>
                        {p.notas || p.notes || "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => handleEditClick(p.id)}
                            disabled={isThisEditing}
                            className={`text-[11px] font-semibold px-2 py-1 rounded transition-colors ${
                              isThisEditing
                                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                                : "text-brand-600 hover:text-brand-800 hover:bg-brand-50"
                            }`}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="text-[11px] font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pagos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No hay pagos registrados para esta unidad.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <a href={`?consorcio=${consorcioCuit}`} className="btn-secondary">
            Cerrar
          </a>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { formatDate } from "@/lib/format";
import { Eye, Calendar, MessageSquare, X } from "lucide-react";

export interface CircularRow {
  id: number;
  consorcio_cuit: string;
  mensaje: string;
  created_at: string;
}

interface CircularesTableClientProps {
  circulares: CircularRow[];
}

export function CircularesTableClient({ circulares }: CircularesTableClientProps) {
  const [selectedCircular, setSelectedCircular] = useState<CircularRow | null>(null);

  const columns: ColumnDef<CircularRow>[] = [
    {
      accessorKey: "created_at",
      header: "Fecha",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
          <span className="text-xs whitespace-nowrap">{formatDate(row.original.created_at)}</span>
        </div>
      ),
    },
    {
      accessorKey: "mensaje",
      header: "Mensaje",
      cell: ({ row }) => {
        const msg = row.original.mensaje;
        return (
          <div className="max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed whitespace-pre-line">
              {msg}
            </p>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Acción</div>,
      cell: ({ row }) => (
        <div className="text-right pr-2">
          <button
            onClick={() => setSelectedCircular(row.original)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver completo</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={circulares}
        emptyMessage="No se encontraron circulares enviadas anteriormente."
      />

      {/* Modal para ver circular completa */}
      {selectedCircular && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedCircular(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-600" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Mensaje Enviado</h3>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {formatDate(selectedCircular.created_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCircular(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {selectedCircular.mensaje}
                </p>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedCircular(null)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

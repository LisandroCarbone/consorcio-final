"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { formatMoney } from "@/lib/format";

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

const columns: ColumnDef<GastoRow>[] = [
  {
    accessorKey: "concepto",
    header: "Concepto",
    cell: ({ row }) => <span className="font-semibold text-gray-900">{row.original.concepto}</span>,
  },
  {
    accessorKey: "categoria",
    header: "Categoría",
    cell: ({ row }) => {
      const cat = row.original.categoria;
      return <span className="text-gray-500 text-xs">{CATEGORIA_LABELS[cat] ?? `Cat. ${cat}`}</span>;
    },
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const t = row.original.tipo;
      const label = t === "A" ? "Coef A" : t === "B" ? "Coef B" : t;
      return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_BADGES[t] ?? 'bg-gray-100 text-gray-600'}`}>
          {label}
        </span>
      );
    },
  },
  {
    accessorKey: "monto",
    header: () => <div className="text-right">Monto</div>,
    cell: ({ row }) => (
      <div className="text-xs font-mono font-semibold text-gray-900">
        {formatMoney(row.original.monto)}
      </div>
    ),
  },
];

interface ExpensasTableClientProps {
  gastos: GastoRow[];
}

export function ExpensasTableClient({ gastos }: ExpensasTableClientProps) {
  return (
    <DataTable columns={columns} data={gastos} emptyMessage="No hay gastos registrados en este período." />
  );
}

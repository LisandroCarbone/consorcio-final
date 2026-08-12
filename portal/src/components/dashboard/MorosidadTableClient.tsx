"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { formatMoney } from "@/lib/format";
import type { MorosidadRow } from "@/lib/queries/dashboard";

interface MorosidadTableClientProps {
  data: MorosidadRow[];
}

const columns: ColumnDef<MorosidadRow>[] = [
  {
    accessorKey: "consorcio",
    header: "Consorcio",
  },
  {
    accessorKey: "uf",
    header: "UF",
  },
  {
    accessorKey: "propietario",
    header: "Propietario",
    cell: ({ row }) => row.getValue("propietario") ?? "—",
  },
  {
    accessorKey: "deudaTotal",
    header: "Deuda Total",
    cell: ({ row }) => formatMoney(row.getValue("deudaTotal") as number),
  },
  {
    accessorKey: "maxMesesAtraso",
    header: "Meses Atraso",
    cell: ({ row }) => {
      const val = row.getValue("maxMesesAtraso") as number;
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">{val}</span>
          {row.original.cartaDocumento && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
              Carta Documento
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: () => (
      <a
        href="/finanzas/cuenta-corriente"
        className="text-brand-600 hover:underline text-xs font-semibold"
      >
        Ver Cuenta Cte. →
      </a>
    ),
  },
];

export function MorosidadTableClient({ data }: MorosidadTableClientProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No hay unidades con deuda pendiente."
    />
  );
}

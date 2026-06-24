"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";

export interface ProveedorRow {
  id: number;
  nombre: string;
  rubro: string | null;
  telefono: string | null;
  whatsapp: string | null;
  activo: boolean;
}

const columns: ColumnDef<ProveedorRow>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => <span className="font-semibold text-gray-900">{row.original.nombre}</span>,
  },
  {
    accessorKey: "rubro",
    header: "Rubro",
    cell: ({ row }) => <span className="text-gray-500 capitalize text-xs">{row.original.rubro ?? "—"}</span>,
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
    cell: ({ row }) => <span className="text-gray-500 text-xs">{row.original.telefono ?? "—"}</span>,
  },
  {
    accessorKey: "whatsapp",
    header: "WhatsApp",
    cell: ({ row }) => {
      const wa = row.original.whatsapp;
      if (!wa) return <span className="text-gray-300">—</span>;
      return (
        <a
          href={`https://wa.me/${wa.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:underline text-xs flex items-center gap-1 font-medium"
        >
          💬 {wa}
        </a>
      );
    }
  }
];

interface ProveedoresTableClientProps {
  proveedores: ProveedorRow[];
}

export function ProveedoresTableClient({ proveedores }: ProveedoresTableClientProps) {
  return (
    <DataTable columns={columns} data={proveedores} emptyMessage="No hay proveedores registrados." />
  );
}

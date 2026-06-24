"use client";

import React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";

export interface ConsorcioRow {
  cuit: string;
  nombre: string;
  direccion: string;
  codigo_postal: string | null;
  categoria_edificio: string | null;
  banco: string | null;
  cant_uf: number | null;
  tiene_cochera: boolean;
  tiene_jardin: boolean;
  tiene_pileta: boolean;
  total_unidades: string;
  total_empleados: string;
  [key: string]: unknown;
}

const columns: ColumnDef<ConsorcioRow>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => <span className="font-semibold text-gray-900">{row.original.nombre}</span>,
  },
  {
    accessorKey: "direccion",
    header: "Dirección",
    cell: ({ row }) => (
      <span className="text-gray-500 text-xs">
        {row.original.direccion}
        {row.original.codigo_postal ? ` (${row.original.codigo_postal})` : ""}
      </span>
    ),
  },
  {
    accessorKey: "cuit",
    header: "CUIT",
    cell: ({ row }) => <span className="text-gray-400 font-mono text-xs">{row.original.cuit ?? "—"}</span>,
  },
  {
    accessorKey: "categoria_edificio",
    header: "Cat.",
    cell: ({ row }) => {
      const cat = row.original.categoria_edificio;
      if (!cat) return "—";
      const colors = {
        '1° Cat.': 'bg-purple-100 text-purple-700',
        '2° Cat.': 'bg-blue-100 text-blue-700',
        '3° Cat.': 'bg-green-100 text-green-700',
        '4° Cat.': 'bg-gray-100 text-gray-600',
      } as Record<string, string>;
      return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[cat] ?? 'bg-gray-100 text-gray-600'}`}>
          {cat}
        </span>
      );
    }
  },
  {
    accessorKey: "cant_uf",
    header: "UF",
    cell: ({ row }) => <span className="text-gray-700 font-medium">{row.original.cant_uf ?? "—"}</span>,
  },
  {
    accessorKey: "banco",
    header: "Banco",
    cell: ({ row }) => <span className="text-gray-500 text-xs">{row.original.banco ?? "—"}</span>,
  },
  {
    id: "amenities",
    header: "Amenities",
    cell: ({ row }) => {
      const icons = [
        row.original.tiene_cochera && '🚗',
        row.original.tiene_jardin && '🌳',
        row.original.tiene_pileta && '🏊',
      ].filter(Boolean);
      return <span className="text-sm">{icons.length > 0 ? icons.join(" ") : "—"}</span>;
    }
  },
  {
    accessorKey: "total_empleados",
    header: "Empleados",
    cell: ({ row }) => <span className="text-gray-700 font-medium">{row.original.total_empleados}</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-3 pr-4 justify-end">
        <Link href={`/consorcios/${row.original.cuit}`} className="text-brand-600 text-xs hover:underline font-semibold">
          Ver →
        </Link>
        <Link href={`/consorcios/${row.original.cuit}/editar`} className="text-gray-400 text-xs hover:underline">
          Editar
        </Link>
      </div>
    )
  }
];

interface ConsorciosTableClientProps {
  consorcios: ConsorcioRow[];
}

export function ConsorciosTableClient({ consorcios }: ConsorciosTableClientProps) {
  return (
    <DataTable columns={columns} data={consorcios} emptyMessage="No hay consorcios registrados." />
  );
}

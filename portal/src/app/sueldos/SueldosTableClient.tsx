"use client";

import React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { formatCuit } from "@/lib/format";

export interface EmpleadoRow {
  cuil: string;
  nombre: string;
  legajo: string | null;
  funcion: string;
  jornada: string;
  consorcio_cuit: string;
  consorcio_nombre: string;
  antiguedad_anios: number;
  categoria_edificio: number;
  obra_social: string;
  banco: string | null;
  tiene_vivienda: boolean;
  retiro_residuos: boolean;
  plus_cocheras: boolean;
  plus_movimiento_coches: boolean;
  plus_jardin: boolean;
  tiene_pileta: boolean;
  plus_zona_desfavorable: boolean;
  tiene_titulo: boolean;
}

const JORNADA_BADGE: Record<string, string> = {
  Completa: 'bg-green-100 text-green-700',
  Media: 'bg-yellow-100 text-yellow-700',
  Suplente: 'bg-gray-100 text-gray-500',
};

const FUNCION_SHORT: Record<string, string> = {
  'Encargado Permanente con vivienda': 'Enc. Perm. c/viv.',
  'Encargado Permanente sin vivienda': 'Enc. Perm. s/viv.',
  'Encargado No Permanente con vivienda': 'Enc. No Perm. c/viv.',
  'Encargado No Permanente Sin vivienda': 'Enc. No Perm. s/viv.',
  'Ayudante Media jornada': 'Ayudante Media',
  'Personal Vigilancia Diurna': 'Vigilancia Diurna',
  'Personal Vigilancia Nocturna': 'Vigilancia Nocturna',
  'Suplente eventual': 'Suplente',
};

const columns: ColumnDef<EmpleadoRow>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900 flex items-center gap-1.5">
        {row.original.nombre}
        {row.original.tiene_vivienda && (
          <span className="text-xs text-blue-500" title="Con vivienda">🏠</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "cuil",
    header: "CUIL",
    cell: ({ row }) => <span className="text-gray-400 font-mono text-xs">{formatCuit(row.original.cuil)}</span>,
  },
  {
    accessorKey: "funcion",
    header: "Función",
    cell: ({ row }) => {
      const f = row.original.funcion;
      const short = FUNCION_SHORT[f] ?? f;
      return <span className="text-gray-600 text-xs">{short}</span>;
    }
  },
  {
    accessorKey: "jornada",
    header: "Jornada",
    cell: ({ row }) => {
      const j = row.original.jornada;
      return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${JORNADA_BADGE[j] ?? 'bg-gray-100 text-gray-500'}`}>
          {j}
        </span>
      );
    }
  },
  {
    accessorKey: "categoria_edificio",
    header: "Cat.",
    cell: ({ row }) => <span className="text-gray-600 text-xs">{row.original.categoria_edificio}°</span>,
  },
  {
    accessorKey: "obra_social",
    header: "Obra Social",
    cell: ({ row }) => <span className="text-gray-500 text-xs">{row.original.obra_social}</span>,
  },
  {
    accessorKey: "banco",
    header: "Banco",
    cell: ({ row }) => <span className="text-gray-500 text-xs">{row.original.banco ?? '—'}</span>,
  },
  {
    id: "plus",
    header: "Plus",
    cell: ({ row }) => {
      const e = row.original;
      const plus = [
        e.retiro_residuos && '🗑️',
        e.plus_cocheras && '🚗',
        e.plus_movimiento_coches && '🔄',
        e.plus_jardin && '🌳',
        e.tiene_pileta && '🏊',
        e.plus_zona_desfavorable && '⚠️',
        e.tiene_titulo && '🎓',
      ].filter(Boolean);
      return <span className="text-sm">{plus.length > 0 ? plus.join(' ') : <span className="text-gray-300">—</span>}</span>;
    }
  },
  {
    accessorKey: "antiguedad_anios",
    header: "Ant.",
    cell: ({ row }) => {
      const a = row.original.antiguedad_anios;
      return <span className="text-gray-600 text-xs">{a > 0 ? `${a}a` : '<1a'}</span>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right pr-4">
        <Link
          href={`/sueldos/empleados/${row.original.cuil}/editar`}
          className="text-brand-600 hover:underline text-xs font-semibold"
        >
          Editar
        </Link>
      </div>
    )
  }
];

interface SueldosTableClientProps {
  empleados: EmpleadoRow[];
}

export function SueldosTableClient({ empleados }: SueldosTableClientProps) {
  return (
    <DataTable columns={columns} data={empleados} emptyMessage="No hay empleados activos en este consorcio." />
  );
}

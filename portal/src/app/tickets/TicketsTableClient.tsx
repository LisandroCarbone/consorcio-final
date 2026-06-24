"use client";

import React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { formatDate } from "@/lib/format";

export interface TicketRow {
  id: number;
  titulo: string;
  descripcion: string | null;
  categoria: string;
  prioridad: string;
  estado: string;
  canal_origen: string;
  created_at: string;
  consorcio_nombre: string;
  unidad_numero: string | null;
  ocupante_nombre: string | null;
}

const PRIORIDAD_BADGES: Record<string, string> = {
  urgente: "bg-red-100 text-red-700",
  alta: "bg-orange-100 text-orange-700",
  normal: "bg-blue-100 text-blue-700",
  baja: "bg-gray-100 text-gray-600",
};

const ESTADO_BADGES: Record<string, string> = {
  abierto: "bg-yellow-100 text-yellow-700",
  en_proceso: "bg-blue-100 text-blue-700",
  esperando_proveedor: "bg-purple-100 text-purple-700",
  resuelto: "bg-green-100 text-green-700",
  cerrado: "bg-gray-100 text-gray-500",
};

const CATEGORIAS_LABEL: Record<string, string> = {
  "2": "Servicios Públicos",
  "3": "Abonos de Servicios",
  "4": "Mantenimiento Común",
  "5": "Reparaciones en Unidades",
  "6": "Gastos Bancarios",
  "7": "Gastos de Limpieza",
  "8": "Gastos Administración",
  "9": "Seguros",
  "10": "Otros Gastos",
};

interface TicketsTableClientProps {
  consorcioCuit: string;
  tickets: TicketRow[];
  filtro: string;
  selectedId: number | null;
}

export function TicketsTableClient({
  consorcioCuit,
  tickets,
  filtro,
  selectedId,
}: TicketsTableClientProps) {
  const columns: ColumnDef<TicketRow>[] = [
    {
      accessorKey: "id",
      header: "#ID",
      cell: ({ row }) => <span className="text-gray-400 font-mono text-xs">#{row.original.id}</span>,
    },
    {
      accessorKey: "titulo",
      header: "Título",
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 line-clamp-1">{t.titulo}</span>
            <span className="text-xs text-gray-400">
              {t.consorcio_nombre} {t.unidad_numero ? `· UF ${t.unidad_numero}` : ""}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "prioridad",
      header: "Prioridad",
      cell: ({ row }) => {
        const p = row.original.prioridad;
        return (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${PRIORIDAD_BADGES[p] ?? 'bg-gray-100 text-gray-600'}`}>
            {p}
          </span>
        );
      },
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const e = row.original.estado;
        return (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${ESTADO_BADGES[e] ?? 'bg-gray-100 text-gray-600'}`}>
            {e.replace("_", " ")}
          </span>
        );
      },
    },
    {
      accessorKey: "categoria",
      header: "Categoría",
      cell: ({ row }) => {
        const cat = row.original.categoria;
        return (
          <span className="badge bg-blue-50 text-blue-700 text-[10px] whitespace-nowrap">
            {CATEGORIAS_LABEL[cat] ?? cat}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Fecha",
      cell: ({ row }) => <span className="text-gray-500 text-xs">{formatDate(row.original.created_at)}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const id = row.original.id;
        const isActive = selectedId === id;
        return (
          <div className="text-right pr-4">
            <Link
              href={`/tickets?id=${id}&filtro=${filtro}`}
              className={`text-xs font-semibold hover:underline whitespace-nowrap ${
                isActive ? "text-brand-700" : "text-brand-600"
              }`}
            >
              Ver {isActive ? "★" : "→"}
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable columns={columns} data={tickets} emptyMessage="No hay tickets en esta categoría." />
  );
}

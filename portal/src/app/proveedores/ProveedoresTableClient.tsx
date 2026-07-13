"use client";

import React, { useState, useTransition } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { updateProveedorAction, deleteProveedorAction } from "./actions";
import { formatPhone } from "@/lib/format";

export interface ProveedorRow {
  id: number;
  nombre: string;
  rubro: string | null;
  telefono: string | null;
  whatsapp: string | null;
  activo: boolean;
}

interface ProveedoresTableClientProps {
  proveedores: ProveedorRow[];
}

export function ProveedoresTableClient({ proveedores }: ProveedoresTableClientProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = (id: number) => {
    const nombreInput = document.getElementById(`edit-nombre-${id}`) as HTMLInputElement;
    const rubroInput = document.getElementById(`edit-rubro-${id}`) as HTMLInputElement;
    const telefonoInput = document.getElementById(`edit-telefono-${id}`) as HTMLInputElement;
    const whatsappInput = document.getElementById(`edit-whatsapp-${id}`) as HTMLInputElement;

    if (!nombreInput || !nombreInput.value.trim()) {
      alert("El nombre es requerido.");
      return;
    }

    startTransition(async () => {
      await updateProveedorAction(
        id,
        nombreInput.value.trim(),
        rubroInput?.value?.trim() || null,
        telefonoInput?.value?.trim() || null,
        whatsappInput?.value?.trim() || null
      );
      setEditingId(null);
    });
  };

  const handleDelete = (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar al proveedor "${nombre}"?`)) return;
    startTransition(async () => {
      await deleteProveedorAction(id);
    });
  };

  const columns = React.useMemo<ColumnDef<ProveedorRow>[]>(() => [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        if (isEditing) {
          return (
            <input
              id={`edit-nombre-${row.original.id}`}
              defaultValue={row.original.nombre}
              className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:border-brand-500 focus:outline-none w-full"
              autoFocus
            />
          );
        }
        return <span className="font-semibold text-gray-900">{row.original.nombre}</span>;
      },
    },
    {
      accessorKey: "rubro",
      header: "Rubro",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        if (isEditing) {
          return (
            <input
              id={`edit-rubro-${row.original.id}`}
              defaultValue={row.original.rubro || ""}
              className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:border-brand-500 focus:outline-none w-full"
            />
          );
        }
        return <span className="text-gray-500 capitalize text-xs">{row.original.rubro ?? "—"}</span>;
      },
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        if (isEditing) {
          return (
            <input
              id={`edit-telefono-${row.original.id}`}
              defaultValue={row.original.telefono || ""}
              className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:border-brand-500 focus:outline-none w-full"
            />
          );
        }
        return <span className="text-gray-500 text-xs">{formatPhone(row.original.telefono)}</span>;
      },
    },
    {
      accessorKey: "whatsapp",
      header: "WhatsApp",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        if (isEditing) {
          return (
            <input
              id={`edit-whatsapp-${row.original.id}`}
              defaultValue={row.original.whatsapp || ""}
              className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:border-brand-500 focus:outline-none w-full"
            />
          );
        }
        const wa = row.original.whatsapp;
        if (!wa) return <span className="text-gray-300">—</span>;
        return (
          <a
            href={`https://wa.me/${wa.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline text-xs flex items-center gap-1 font-medium"
          >
            💬 {formatPhone(wa)}
          </a>
        );
      },
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        if (isEditing) {
          return (
            <div className="flex gap-2 justify-end shrink-0">
              <button
                type="button"
                onClick={() => handleSave(row.original.id)}
                disabled={isPending}
                className="text-xs text-green-600 hover:text-green-800 font-bold px-1 py-0.5 transition-colors"
                title="Guardar"
              >
                {isPending ? "..." : "✓"}
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-xs text-gray-400 hover:text-gray-600 px-1 py-0.5 transition-colors"
                title="Cancelar"
              >
                ✕
              </button>
            </div>
          );
        }
        return (
          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
            <button
              type="button"
              onClick={() => setEditingId(row.original.id)}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-brand-600 transition-colors text-sm"
              title="Editar proveedor"
            >
              ✏️
            </button>
            <button
              type="button"
              onClick={() => handleDelete(row.original.id, row.original.nombre)}
              disabled={isPending}
              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors text-sm"
              title="Eliminar proveedor"
            >
              🗑️
            </button>
          </div>
        );
      },
    },
  ], [editingId, isPending]);

  return (
    <DataTable columns={columns} data={proveedores} emptyMessage="No hay proveedores registrados." />
  );
}

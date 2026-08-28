"use client";

import { useState, useTransition } from "react";
import { updateFechaPago } from "../actions";

export function FechaPagoEditor({
  liquidacionId,
  fechaPago,
  fechaPagoISO,
}: {
  liquidacionId: number;
  fechaPago: string;
  fechaPagoISO: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(fechaPagoISO);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateFechaPago(liquidacionId, value);
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 print:hidden">
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border border-gray-300 rounded px-1 py-0.5 text-sm"
          disabled={isPending}
        />
        <button
          onClick={handleSave}
          disabled={isPending}
          className="text-xs bg-brand-600 text-white rounded px-2 py-0.5 hover:bg-brand-700 disabled:opacity-50"
        >
          {isPending ? "..." : "✓"}
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setValue(fechaPagoISO);
          }}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <p className="font-bold text-gray-900">{fechaPago}</p>
      <button
        onClick={() => setEditing(true)}
        className="print:hidden text-gray-400 hover:text-brand-600 text-xs"
        title="Editar fecha de pago"
      >
        ✏️
      </button>
    </div>
  );
}

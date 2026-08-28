"use client";

import { useState } from "react";
import type { AuditLogRow } from "./actions";

export function AuditDetailRow({ row }: { row: AuditLogRow }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr className="table-row hover:bg-gray-50">
        <td className="td text-gray-600 whitespace-nowrap">
          {new Date(row.timestamp).toLocaleString("es-AR", { timeZone: "UTC" })}
        </td>
        <td className="td text-gray-900">{row.username}</td>
        <td className="td text-gray-600">{row.action}</td>
        <td className="td text-gray-600">{row.entity_type}</td>
        <td className="td text-gray-600">{row.entity_id ?? "—"}</td>
        <td className="td text-gray-600">{row.consorcio_cuit ?? "—"}</td>
        <td className="td text-right">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs text-blue-600 hover:underline"
          >
            {open ? "Ocultar" : "Ver detalle"}
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={7} className="bg-gray-50 px-4 py-3">
            <pre className="text-xs whitespace-pre-wrap break-all text-gray-700">
              {JSON.stringify(row.details, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}

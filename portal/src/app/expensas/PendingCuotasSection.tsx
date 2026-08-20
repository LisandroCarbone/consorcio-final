"use client";

import { useTransition } from "react";
import { formatMoney } from "@/lib/format";
import { assignPendingCuota } from "./actions";
import { CATEGORIA_LABELS } from "./ExpensasTableClient";

export interface PendingCuotaRow {
  id: number;
  concepto: string;
  monto: string;
  cuota_grupo_id: string;
  cuota_nro: number;
  cuota_total: number;
  categoria: number;
  tipo: string;
}

interface Props {
  cuotas: PendingCuotaRow[];
  periodoId: number;
}

export function PendingCuotasSection({ cuotas, periodoId }: Props) {
  const [isPending, startTransition] = useTransition();

  if (cuotas.length === 0) return null;

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-base">Cuotas pendientes</h3>
        <span className="text-xs text-gray-400">{cuotas.length} cuota{cuotas.length === 1 ? "" : "s"}</span>
      </div>
      <table className="w-full text-sm sm:text-base">
        <tbody>
          {cuotas.map((c) => (
            <tr key={c.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60 transition-colors">
              <td className="px-5 py-2.5">
                <p className="font-medium text-gray-900 text-sm sm:text-base leading-snug">{c.concepto}</p>
                <p className="text-xs text-gray-400 mt-0.5">{CATEGORIA_LABELS[c.categoria] ?? `Categoría ${c.categoria}`}</p>
              </td>
              <td className="px-3 py-2.5 w-24 shrink-0">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700">
                  Cuota {c.cuota_nro}/{c.cuota_total}
                </span>
              </td>
              <td className="px-3 py-2.5 text-right w-36 font-mono font-semibold text-gray-900 text-sm whitespace-nowrap">
                {formatMoney(c.monto)}
              </td>
              <td className="px-3 py-2.5 w-32 text-right">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      await assignPendingCuota(c.id, periodoId);
                      window.location.reload();
                    });
                  }}
                  className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50"
                >
                  Agregar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

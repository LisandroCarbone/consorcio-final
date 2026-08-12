import { Landmark } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { CajaRow } from "@/lib/queries/dashboard";

interface CajaResumenProps {
  data: CajaRow[];
}

export function CajaResumen({ data }: CajaResumenProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-xs">
        <span>Sin datos de caja disponibles.</span>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {data.map((row) => (
        <div key={row.cuit} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Landmark className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="text-sm font-semibold text-gray-800 truncate">{row.consorcio}</span>
            </div>
            <span className="text-sm font-extrabold text-gray-800 shrink-0">
              {formatMoney(row.saldoBanco)}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 pl-6 text-[10px] text-gray-400 font-medium">
            <span>Efectivo: {formatMoney(row.cobroEfectivo)}</span>
            <span>Transferencia: {formatMoney(row.cobroTransferencia)}</span>
            <span>Débito: {formatMoney(row.cobroDebito)}</span>
            <span>Otro: {formatMoney(row.cobroOtro)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

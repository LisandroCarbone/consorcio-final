import { Building2, TrendingUp, CircleDollarSign, AlertTriangle, Wrench } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { DashboardKPIData } from "@/lib/queries/dashboard";

interface DashboardKPIsProps {
  data: DashboardKPIData;
}

export function DashboardKPIs({ data }: DashboardKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
      <div className="stat-card" aria-label="Consorcios activos">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-50 text-brand-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Consorcios</p>
            <p className="text-3xl font-extrabold text-gray-800 mt-1">{data.consorciosActivos}</p>
            <span className="text-[10px] text-gray-400 font-medium">Edificios bajo administración</span>
          </div>
        </div>
      </div>

      <div className="stat-card" aria-label="Cobranza del período">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-brand-50 text-brand-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cobranza del Mes</p>
            <p className="text-3xl font-extrabold text-gray-800 mt-1">{data.cobranzaPct}%</p>
            <span className="text-[10px] text-gray-400 font-medium">Recaudado sobre lo liquidado</span>
          </div>
        </div>
      </div>

      <div className="stat-card" aria-label="Deuda total">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-red-50 text-red-600">
            <CircleDollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deuda Total</p>
            <p className="text-2xl font-extrabold text-gray-800 mt-1.5">{formatMoney(data.deudaTotal)}</p>
            <span className="text-[10px] text-gray-400 font-medium">Capital + intereses pendientes</span>
          </div>
        </div>
      </div>

      <div className="stat-card" aria-label="Tickets abiertos">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tickets Abiertos</p>
            <p className="text-3xl font-extrabold text-gray-800 mt-1">{data.ticketsAbiertos}</p>
            <span className="text-[10px] text-gray-400 font-medium">Reclamos pendientes</span>
          </div>
        </div>
      </div>

      <div className="stat-card" aria-label="Órdenes pendientes">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Órdenes Pendientes</p>
            <p className="text-3xl font-extrabold text-gray-800 mt-1">{data.ordenesPendientes}</p>
            <span className="text-[10px] text-gray-400 font-medium">Trabajos sin finalizar</span>
          </div>
        </div>
      </div>
    </div>
  );
}

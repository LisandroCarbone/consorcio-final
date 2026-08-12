export const dynamic = 'force-dynamic';

import Link from "next/link";
import {
  getDashboardKPIs,
  getConsorciosForFilter,
  getMorosidadData,
  getCobranzaByConsorcio,
  getEstadoCaja,
  getAlertItems,
} from "@/lib/queries/dashboard";
import { DashboardFilterClient } from "@/components/dashboard/DashboardFilterClient";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AgendaPlaceholder } from "@/components/dashboard/AgendaPlaceholder";
import { MorosidadTableClient } from "@/components/dashboard/MorosidadTableClient";
import { CobranzaChartClient } from "@/components/dashboard/CobranzaChartClient";
import { CajaResumen } from "@/components/dashboard/CajaResumen";
import { AlertBanner } from "@/components/dashboard/AlertBanner";

function parseCuits(raw: string | undefined): string[] | undefined {
  if (!raw) return undefined;
  const cuits = raw.split(",").map((c) => c.trim()).filter(Boolean);
  return cuits.length > 0 ? cuits : undefined;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cuits?: string }>;
}) {
  const sp = await searchParams;
  const cuits = parseCuits(sp.cuits);

  const [kpis, consorcios, morosidad, cobranza, caja, alerts] = await Promise.all([
    getDashboardKPIs(cuits),
    getConsorciosForFilter(),
    getMorosidadData(cuits),
    getCobranzaByConsorcio(cuits),
    getEstadoCaja(cuits),
    getAlertItems(cuits),
  ]);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <DashboardFilterClient consorcios={consorcios} selectedCuits={cuits ?? []} />
      </div>

      <DashboardKPIs data={kpis} />

      <AlertBanner items={alerts} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-base">Consorcios con Mayor Morosidad</h3>
              <p className="text-xs text-gray-400 mt-0.5">Ranking ordenado por meses de atraso y deuda</p>
            </div>
            <Link href="/finanzas/cuenta-corriente" className="text-brand-600 hover:underline text-xs font-semibold">
              Ver detalle completo
            </Link>
          </div>
          <MorosidadTableClient data={morosidad} />
        </div>

        <div className="card p-5 flex flex-col">
          <div className="border-b pb-4 mb-4">
            <h3 className="font-bold text-gray-800 text-base">Cobranza por Consorcio</h3>
            <p className="text-xs text-gray-400 mt-0.5">Cobrado vs. liquidado del período actual</p>
          </div>
          <CobranzaChartClient data={cobranza} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="border-b pb-4 mb-4">
            <h3 className="font-bold text-gray-800 text-base">Estado de Caja</h3>
            <p className="text-xs text-gray-400 mt-0.5">Saldo bancario y cobranza del mes por consorcio</p>
          </div>
          <CajaResumen data={caja} />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AgendaPlaceholder />
        </div>
      </div>
    </div>
  );
}

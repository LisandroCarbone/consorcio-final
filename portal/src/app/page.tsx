export const dynamic = 'force-dynamic';

import { getDashboardKPIs, getConsorciosForFilter } from "@/lib/queries/dashboard";
import { DashboardFilterClient } from "@/components/dashboard/DashboardFilterClient";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AgendaPlaceholder } from "@/components/dashboard/AgendaPlaceholder";

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

  const [kpis, consorcios] = await Promise.all([
    getDashboardKPIs(cuits),
    getConsorciosForFilter(),
  ]);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <DashboardFilterClient consorcios={consorcios} selectedCuits={cuits ?? []} />
      </div>

      <DashboardKPIs data={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <div className="lg:col-span-1">
          <AgendaPlaceholder />
        </div>
      </div>
    </div>
  );
}

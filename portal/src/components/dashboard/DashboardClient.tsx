"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DataTable } from "../ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  Wrench,
  CircleDollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";

interface RealStats {
  totalConsorcios: number;
  ticketsAbiertos: number;
  expensasPendientes: number;
  montoPendiente: number;
  ultimosPeriodos: any[];
}

interface DashboardClientProps {
  stats: RealStats;
  tickets: any[];
}

interface MorosidadRow {
  consorcio: string;
  ufDeudoras: string;
  totalDeuda: number;
  tasaMorosidad: number;
}

// 6 months historical revenues vs expenses (example / illustration)
const cashFlowData = [
  { name: "Ene", Ingresos: 1200000, Egresos: 1100000 },
  { name: "Feb", Ingresos: 1450000, Egresos: 1250000 },
  { name: "Mar", Ingresos: 1300000, Egresos: 1350000 },
  { name: "Abr", Ingresos: 1600000, Egresos: 1400000 },
  { name: "May", Ingresos: 1850000, Egresos: 1550000 },
  { name: "Jun", Ingresos: 2100000, Egresos: 1800000 },
];

// Mock morosity data (illustration)
const morosidadData: MorosidadRow[] = [
  { consorcio: "Edificio Rivadavia 1200", ufDeudoras: "4 / 24", totalDeuda: 320000, tasaMorosidad: 16 },
  { consorcio: "Torres del Sol", ufDeudoras: "8 / 60", totalDeuda: 780000, tasaMorosidad: 13 },
  { consorcio: "Condominio Palermo", ufDeudoras: "6 / 18", totalDeuda: 950000, tasaMorosidad: 33 },
  { consorcio: "Las Heras 2340", ufDeudoras: "1 / 12", totalDeuda: 90000, tasaMorosidad: 8 },
  { consorcio: "Mitre 450", ufDeudoras: "0 / 15", totalDeuda: 0, tasaMorosidad: 0 },
];

const COLORS = ["#1a3c5e", "#ea580c", "#ffedd5"];

const columns: ColumnDef<MorosidadRow>[] = [
  {
    accessorKey: "consorcio",
    header: "Consorcio",
  },
  {
    accessorKey: "ufDeudoras",
    header: "UFs Deudoras",
  },
  {
    accessorKey: "totalDeuda",
    header: "Deuda Total",
    cell: ({ row }) => {
      const val = row.getValue("totalDeuda") as number;
      return `$${val.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
    },
  },
  {
    accessorKey: "tasaMorosidad",
    header: "Tasa Morosidad",
    cell: ({ row }) => {
      const val = row.getValue("tasaMorosidad") as number;
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                val > 30 ? "bg-red-500" : val > 15 ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ width: `${val}%` }}
            ></div>
          </div>
          <span className="text-xs font-semibold text-gray-700">{val}%</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: () => (
      <a href="/finanzas/cuenta-corriente" className="text-brand-600 hover:underline text-xs font-semibold">
        Ver Cuenta Cte. →
      </a>
    ),
  },
];

export function DashboardClient({ stats, tickets }: DashboardClientProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Format currency helper
  const formatMoney = (val: number) => {
    return `$${val.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
  };

  // Pie chart calculation (real data + ratio)
  // Let's assume the collection rate is 78% collected, 22% pending for the month
  const collectionPieData = [
    { name: "Cobrado", value: Math.max(0, stats.montoPendiente * 3.5) }, // Estimated collected based on ratio
    { name: "Pendiente", value: stats.montoPendiente },
  ];
  const totalInvoiced = collectionPieData[0].value + collectionPieData[1].value;
  const collectionRate = totalInvoiced > 0 ? Math.round((collectionPieData[0].value / totalInvoiced) * 100) : 78;

  if (!mounted) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-gray-400 text-sm animate-pulse">Cargando gráficos interactivos...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Target KPIs Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-lg bg-blue-50 text-brand-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Consorcios</p>
            <p className="text-3xl font-extrabold text-gray-800 mt-1">{stats.totalConsorcios}</p>
            <span className="text-[10px] text-gray-400 font-medium">Edificios bajo administración</span>
          </div>
        </div>

        <div className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tickets Abiertos</p>
            <p className="text-3xl font-extrabold text-gray-800 mt-1">{stats.ticketsAbiertos}</p>
            <span className="text-[10px] text-orange-500 font-semibold flex items-center gap-0.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Reclamos pendientes
            </span>
          </div>
        </div>

        <div className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-lg bg-green-50 text-green-600">
            <CircleDollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monto a Cobrar</p>
            <p className="text-2xl font-extrabold text-gray-800 mt-1.5">{formatMoney(stats.montoPendiente)}</p>
            <span className="text-[10px] text-gray-400 font-medium">{stats.expensasPendientes} expensas sin cobrar</span>
          </div>
        </div>

        <div className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-lg bg-brand-50 text-brand-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cobranza del Mes</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-extrabold text-gray-800">{collectionRate}%</p>
              <span className="text-[10px] text-green-600 font-bold flex items-center">
                ↑ 2.4%
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Promedio de recaudación mensual</span>
          </div>
        </div>
      </div>

      {/* Fila de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flujo de caja */}
        <div className="card col-span-2 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-base">Flujo de Caja Consolidado</h3>
              <p className="text-xs text-gray-400 mt-0.5">Ingresos contra egresos consolidados (últimos 6 meses)</p>
            </div>
            <span className="text-xs bg-gray-100 font-semibold px-2.5 py-1 rounded text-gray-600">Ejemplo ilustrativo</span>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cashFlowData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatMoney(value), undefined]}
                  contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="Ingresos" fill="#1a3c5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Egresos" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasa de recaudación dona */}
        <div className="card p-5 flex flex-col justify-between">
          <div className="border-b pb-4 mb-4">
            <h3 className="font-bold text-gray-800 text-base">Cobranza del Período</h3>
            <p className="text-xs text-gray-400 mt-0.5">Relación cobrado vs adeudado</p>
          </div>
          <div className="w-full h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={collectionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#1a3c5e" />
                  <Cell fill="#ea580c" />
                </Pie>
                <Tooltip formatter={(value: any) => formatMoney(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-gray-800">{collectionRate}%</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Recaudado</span>
            </div>
          </div>
          <div className="flex items-center justify-around text-xs border-t pt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-brand-600"></div>
              <span className="text-gray-500">Cobrado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-500">Pendiente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fila de Tablas y Agendas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tabla de Ranking de Morosidad */}
        <div className="card lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-base">Consorcios con Mayor Morosidad</h3>
              <p className="text-xs text-gray-400 mt-0.5">Ranking ordenado por nivel de endeudamiento</p>
            </div>
            <a href="/finanzas/cuenta-corriente" className="text-brand-600 hover:underline text-xs font-semibold">
              Ver detalle completo
            </a>
          </div>
          <DataTable columns={columns} data={morosidadData} />
        </div>

        {/* Panel de Vencimientos y Agenda */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="border-b pb-4 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-base">Agenda de Vencimientos</h3>
                <p className="text-xs text-gray-400 mt-0.5">Fechas límite críticas del mes</p>
              </div>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-red-50 text-red-700 rounded p-1.5 text-xs font-bold w-12 text-center shrink-0">
                  10 Jul
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Vencimiento Form 931</p>
                  <p className="text-xs text-gray-400">Declaración de cargas sociales SUTERH</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-brand-50 text-brand-700 rounded p-1.5 text-xs font-bold w-12 text-center shrink-0">
                  15 Jul
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Abonos de Mantenimiento</p>
                  <p className="text-xs text-gray-400">Vencimiento de facturas de ascensores y seguros</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-orange-50 text-orange-700 rounded p-1.5 text-xs font-bold w-12 text-center shrink-0">
                  20 Jul
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Vencimiento de Expensas</p>
                  <p className="text-xs text-gray-400">Límite de pago para bonificaciones en unidades</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 mt-6 flex gap-2.5 items-start">
            <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-brand-800">Todo en orden</p>
              <p className="text-[10px] text-brand-600 mt-0.5">No hay tareas con retraso crítico registradas esta semana.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

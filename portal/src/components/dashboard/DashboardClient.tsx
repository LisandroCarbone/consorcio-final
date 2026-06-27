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
  HelpCircle,
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
      return `$${val.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
  },
  {
    accessorKey: "tasaMorosidad",
    header: () => (
      <div className="flex items-center gap-1">
        <span>Tasa Morosidad</span>
        <div className="group relative inline-block">
          <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg text-center normal-case font-normal z-50">
            Proporción de deuda vencida sobre el total liquidado.
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    ),
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
    return `$${val.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        {/* Secuencia Correcta del Cierre */}
        <div className="card col-span-2 p-5 flex flex-col justify-between">
          <div className="border-b pb-4 mb-4">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-gray-800 text-base">Secuencia Correcta del Cierre</h3>
              <div className="group relative inline-block">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-52 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg text-center font-normal normal-case z-50">
                  Guía paso a paso recomendada para realizar el cierre del período sin cometer errores.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Guía paso a paso de buenas prácticas para el procesamiento mensual de los consorcios</p>
          </div>
          <div className="divide-y divide-gray-100 flex-1 flex flex-col justify-center">
            {/* Step 1 */}
            <div className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">1</span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Cargar Gastos Mensuales</h4>
                  <p className="text-xs text-gray-400">Registrar abonos de mantenimiento, seguros, servicios públicos e imprevistos.</p>
                </div>
              </div>
              <a href="/expensas" className="btn-secondary py-1 text-xs shrink-0 hover:bg-brand-50 hover:text-brand-600">Cargar Gastos</a>
            </div>
            {/* Step 2 */}
            <div className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">2</span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Novedades y Sueldos</h4>
                  <p className="text-xs text-gray-400">Registrar horas extras, suplencias y liquidar haberes (genera el gasto de sueldo automático).</p>
                </div>
              </div>
              <a href="/sueldos" className="btn-secondary py-1 text-xs shrink-0 hover:bg-brand-50 hover:text-brand-600">Ver Sueldos</a>
            </div>
            {/* Step 3 */}
            <div className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">3</span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Prorratear Expensas</h4>
                  <p className="text-xs text-gray-400">Calcular e imputar el cobro a cada Unidad Funcional según sus coeficientes de copropiedad.</p>
                </div>
              </div>
              <a href="/expensas" className="btn-secondary py-1 text-xs shrink-0 hover:bg-brand-50 hover:text-brand-600">Prorratear</a>
            </div>
            {/* Step 4 */}
            <div className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-green-50 text-green-700 flex items-center justify-center font-bold text-sm shrink-0">4</span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Registrar Cobranzas</h4>
                  <p className="text-xs text-gray-400">Conciliar transferencias y depósitos bancarios, cargándolos en la cuenta corriente de las UFs.</p>
                </div>
              </div>
              <a href="/finanzas/cuenta-corriente" className="btn-secondary py-1 text-xs shrink-0 hover:bg-brand-50 hover:text-brand-600">Ver Cuenta Cte.</a>
            </div>
            {/* Step 5 */}
            <div className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-50 text-orange-700 flex items-center justify-center font-bold text-sm shrink-0">5</span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Cierre del Período y Envíos</h4>
                  <p className="text-xs text-gray-400">Cerrar el mes en estado liquidado, descargar reportes y enviar expensas / circulares por WhatsApp y Mail.</p>
                </div>
              </div>
              <a href="/circulares" className="btn-secondary py-1 text-xs shrink-0 hover:bg-brand-50 hover:text-brand-600">Enviar Circulares</a>
            </div>
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

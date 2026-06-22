export const dynamic = 'force-dynamic';

import { query } from "@/lib/db";
import { formatMoney, MONTH_NAMES } from "@/lib/format";
import Link from "next/link";

async function getStats() {
  const [consorcios, tickets, expensas, periodos] = await Promise.all([
    query<{ count: string }>("SELECT COUNT(*) FROM app.consorcios"),
    query<{ count: string }>("SELECT COUNT(*) FROM app.tickets WHERE estado NOT IN ('resuelto','cerrado')"),
    query<{ pendientes: string; total: string }>(
      "SELECT COUNT(*) FILTER (WHERE estado='pendiente') AS pendientes, COALESCE(SUM(total_pagar) FILTER (WHERE estado='pendiente'), 0) AS total FROM app.res_cuenta_periodo"
    ),
    query<{ id: number; consorcio_nombre: string; anio: number; mes: number; estado: string }>(
      `SELECT p.id, c.nombre AS consorcio_nombre, p.anio, p.mes, p.estado
       FROM app.periodos_expensas p JOIN app.consorcios c ON c.cuit = p.consorcio_cuit
       ORDER BY p.anio DESC, p.mes DESC LIMIT 5`
    ),
  ]);
  return {
    totalConsorcios: Number(consorcios[0]?.count ?? 0),
    ticketsAbiertos: Number(tickets[0]?.count ?? 0),
    expensasPendientes: Number(expensas[0]?.pendientes ?? 0),
    montoPendiente: Number(expensas[0]?.total ?? 0),
    ultimosPeriodos: periodos,
  };
}

async function getTicketsRecientes() {
  return query<{ id: number; titulo: string; categoria: string; prioridad: string; estado: string; created_at: string; consorcio_nombre: string }>(
    `SELECT t.id, t.titulo, t.categoria, t.prioridad, t.estado, t.created_at, c.nombre AS consorcio_nombre
     FROM app.tickets t JOIN app.consorcios c ON c.cuit = t.consorcio_cuit
     WHERE t.estado NOT IN ('resuelto','cerrado')
     ORDER BY t.created_at DESC LIMIT 8`
  );
}

const PRIORIDAD_COLORS: Record<string, string> = {
  urgente: "bg-red-100 text-red-700",
  alta: "bg-orange-100 text-orange-700",
  normal: "bg-blue-100 text-blue-700",
  baja: "bg-gray-100 text-gray-600",
};


export default async function DashboardPage() {
  const [stats, tickets] = await Promise.all([getStats(), getTicketsRecientes()]);

  return (
    <div className="max-w-6xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Consorcios</p>
          <p className="text-3xl font-bold text-brand-600">{stats.totalConsorcios}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tickets abiertos</p>
          <p className="text-3xl font-bold text-orange-500">{stats.ticketsAbiertos}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Expensas pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.expensasPendientes}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Monto a cobrar</p>
          <p className="text-2xl font-bold text-green-600">{formatMoney(stats.montoPendiente)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets recientes */}
        <div className="card col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Tickets abiertos</h3>
            <Link href="/tickets" className="text-sm text-brand-600 hover:underline">Ver todos →</Link>
          </div>
          {tickets.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500 text-center">No hay tickets abiertos 🎉</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {tickets.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                  <span className={`badge ${PRIORIDAD_COLORS[t.prioridad] ?? "bg-gray-100 text-gray-600"}`}>
                    {t.prioridad}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.titulo}</p>
                    <p className="text-xs text-gray-500">{t.consorcio_nombre} · {t.categoria}</p>
                  </div>
                  <Link href={`/tickets?id=${t.id}`} className="text-xs text-brand-600 hover:underline shrink-0">
                    #{t.id}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Últimos períodos */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Períodos recientes</h3>
            <Link href="/expensas" className="text-sm text-brand-600 hover:underline">Ver →</Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {stats.ultimosPeriodos.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{MONTH_NAMES[p.mes]} {p.anio}</p>
                  <p className="text-xs text-gray-500">{p.consorcio_nombre}</p>
                </div>
                <span className={`badge ${
                  p.estado === "liquidado" ? "bg-green-100 text-green-700"
                  : p.estado === "cerrado" ? "bg-gray-100 text-gray-600"
                  : "bg-yellow-100 text-yellow-700"
                }`}>
                  {p.estado}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

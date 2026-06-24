export const dynamic = 'force-dynamic';

import { query } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

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

export default async function DashboardPage() {
  const [stats, tickets] = await Promise.all([getStats(), getTicketsRecientes()]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      </div>
      <DashboardClient stats={stats} tickets={tickets} />
    </div>
  );
}


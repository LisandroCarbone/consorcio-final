import Link from "next/link";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import { cleanPeriodo } from "@/lib/format";

async function getSueldosStats(activeCuit: string, activePeriodo?: string) {
  const db = pool;
  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const periodo = activePeriodo || defaultPeriod;

  const [{ rows: [stats] }, { rows: [escala] }] = await Promise.all([
    db.query(`
      SELECT
        (SELECT COUNT(*) FROM app.empleados WHERE estado = 'activo' AND consorcio_cuit = $2) AS total_empleados,
        (SELECT COUNT(*) FROM app.liquidaciones_sueldo l JOIN app.empleados e ON e.cuil = l.empleado_cuil WHERE l.periodo = $1 AND e.consorcio_cuit = $2) AS liquidaciones_mes,
        (SELECT COUNT(*) FROM app.liquidaciones_sueldo l JOIN app.empleados e ON e.cuil = l.empleado_cuil WHERE l.periodo = $1 AND l.estado = 'confirmada' AND e.consorcio_cuit = $2) AS confirmadas,
        (SELECT COALESCE(SUM(l.neto_a_pagar),0) FROM app.liquidaciones_sueldo l JOIN app.empleados e ON e.cuil = l.empleado_cuil WHERE l.periodo = $1 AND l.estado != 'anulada' AND e.consorcio_cuit = $2) AS total_neto
    `, [periodo, activeCuit]),
    db.query(`SELECT periodo FROM app.escalas_suterh ORDER BY periodo DESC LIMIT 1`),
  ]);

  return {
    total_empleados: Number(stats?.total_empleados || 0),
    liquidaciones_mes: Number(stats?.liquidaciones_mes || 0),
    confirmadas: Number(stats?.confirmadas || 0),
    total_neto: Number(stats?.total_neto || 0),
    periodo,
    ultima_escala: escala?.periodo ?? null
  };
}

export default async function SueldosPage() {
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";
  const activePeriodo = cleanPeriodo(cookieStore.get("active_periodo")?.value);

  const { rows: consorcios } = await pool.query(
    "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
  );

  if (!activeCuit) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Liquidación de Sueldos</h1>
        <ConsorcioRequerido consorcios={consorcios} seccion="los sueldos" />
      </div>
    );
  }

  const stats = await getSueldosStats(activeCuit, activePeriodo);

  const mes = new Date(stats.periodo).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  const escalaLabel = stats.ultima_escala
    ? new Date(stats.ultima_escala).toLocaleDateString("es-AR", { month: "long", year: "numeric" })
    : "Sin datos";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liquidación de Sueldos</h1>
          <p className="text-gray-500 text-sm mt-1">Período actual: {mes}</p>
        </div>
        <Link
          href={`/sueldos/novedades?periodo=${stats.periodo}`}
          className="btn-primary"
        >
          Cargar novedades del mes
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Empleados activos" value={stats.total_empleados} />
        <StatCard label="Liquidaciones generadas" value={stats.liquidaciones_mes} />
        <StatCard label="Confirmadas" value={stats.confirmadas} />
        <StatCard
          label="Total neto a pagar"
          value={`$${Number(stats.total_neto).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`}
        />
      </div>

      {/* Escalas */}
      <div className="card mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Escalas SUTERH cargadas</p>
          <p className="font-semibold">{escalaLabel}</p>
        </div>
        <Link href="/sueldos/escalas" className="btn-secondary text-sm">
          Ver escalas
        </Link>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink href="/sueldos/empleados" title="Empleados" desc="Altas, bajas y modificaciones" />
        <QuickLink
          href={`/sueldos/novedades?periodo=${stats.periodo}`}
          title="Novedades del mes"
          desc="Horas extras, ausencias, eventualidades"
        />
        <QuickLink
          href={`/sueldos/liquidaciones?periodo=${stats.periodo}`}
          title="Liquidaciones"
          desc="Calcular y confirmar recibos"
        />
        <QuickLink href="/sueldos/sac" title="SAC" desc="Liquidar 1° y 2° semestre" />
        <QuickLink href="/sueldos/despido" title="Egreso / Despido" desc="Indemnización y liquidación final" />
        <QuickLink href="/sueldos/escalas" title="Escalas SUTERH" desc="Básicos y adicionales vigentes" />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="card hover:shadow-md transition-shadow">
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </Link>
  );
}

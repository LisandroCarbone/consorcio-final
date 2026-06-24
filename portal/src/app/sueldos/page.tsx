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

async function getEmpleadosActivos(activeCuit: string) {
  const { rows: empleados } = await pool.query(`
    SELECT e.*,
           c.nombre AS consorcio_nombre,
           EXTRACT(YEAR FROM AGE(NOW(), e.fecha_ingreso))::int AS antiguedad_anios
    FROM app.empleados e
    JOIN app.consorcios c ON c.cuit = e.consorcio_cuit
    WHERE e.estado = 'activo' AND e.consorcio_cuit = $1
    ORDER BY e.nombre
  `, [activeCuit]);
  return empleados;
}

const JORNADA_BADGE: Record<string, string> = {
  Completa: 'bg-green-100 text-green-700',
  Media: 'bg-yellow-100 text-yellow-700',
  Suplente: 'bg-gray-100 text-gray-500',
};

const FUNCION_SHORT: Record<string, string> = {
  'Encargado Permanente con vivienda': 'Enc. Perm. c/viv.',
  'Encargado Permanente sin vivienda': 'Enc. Perm. s/viv.',
  'Encargado No Permanente con vivienda': 'Enc. No Perm. c/viv.',
  'Encargado No Permanente Sin vivienda': 'Enc. No Perm. s/viv.',
  'Ayudante Media jornada': 'Ayudante Media',
  'Personal Vigilancia Diurna': 'Vigilancia Diurna',
  'Personal Vigilancia Nocturna': 'Vigilancia Nocturna',
  'Suplente eventual': 'Suplente',
};

export default async function SueldosPage() {
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";
  const activePeriodo = cleanPeriodo(cookieStore.get("active_periodo")?.value);

  const { rows: consorcios } = await pool.query(
    "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
  );

  if (!activeCuit) {
    return (
      <div className="p-6 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Liquidación de Sueldos</h1>
        <ConsorcioRequerido consorcios={consorcios} seccion="los sueldos" />
      </div>
    );
  }

  const [stats, empleados] = await Promise.all([
    getSueldosStats(activeCuit, activePeriodo),
    getEmpleadosActivos(activeCuit)
  ]);

  const mes = new Date(stats.periodo).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  const escalaLabel = stats.ultima_escala
    ? new Date(stats.ultima_escala).toLocaleDateString("es-AR", { month: "long", year: "numeric" })
    : "Sin datos";

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liquidación de Sueldos</h1>
          <p className="text-gray-500 text-sm mt-1">Período actual: {mes}</p>
        </div>
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

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Izquierdo (2/3 de ancho) - Nómina de Empleados */}
        <div className="lg:col-span-2 order-1 lg:order-first space-y-6">
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 text-base">Nómina de Empleados</h3>
                <p className="text-xs text-gray-500 mt-0.5">{empleados.length} empleado{empleados.length !== 1 ? 's' : ''} activo{empleados.length !== 1 ? 's' : ''}</p>
              </div>
              <Link href="/sueldos/empleados/nuevo" className="btn-primary py-1.5 text-xs">
                + Agregar empleado
              </Link>
            </div>
            
            {empleados.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay empleados activos en este consorcio. Crea uno usando el botón superior.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-gray-400 text-left text-xs uppercase tracking-wide bg-gray-50/50">
                      <th className="px-4 py-2.5">Nombre</th>
                      <th className="px-3 py-2.5">CUIL</th>
                      <th className="px-3 py-2.5">Función</th>
                      <th className="px-3 py-2.5">Jornada</th>
                      <th className="px-3 py-2.5 text-center">Cat.</th>
                      <th className="px-3 py-2.5">Obra Social</th>
                      <th className="px-3 py-2.5">Banco</th>
                      <th className="px-3 py-2.5 text-center">Plus</th>
                      <th className="px-3 py-2.5 text-center">Ant.</th>
                      <th className="px-3 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.map((e: any) => {
                      const plus = [
                        e.retiro_residuos && '🗑️',
                        e.plus_cocheras && '🚗',
                        e.plus_movimiento_coches && '🔄',
                        e.plus_jardin && '🌳',
                        e.tiene_pileta && '🏊',
                        e.plus_zona_desfavorable && '⚠️',
                        e.tiene_titulo && '🎓',
                      ].filter(Boolean);

                      return (
                        <tr key={e.cuil} className="border-b last:border-0 hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {e.nombre}
                            {e.tiene_vivienda && (
                              <span className="ml-1.5 text-xs text-blue-500" title="Con vivienda">🏠</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-gray-400 font-mono text-xs">{e.cuil}</td>
                          <td className="px-3 py-3 text-gray-600 text-xs">
                            {FUNCION_SHORT[e.funcion] ?? e.funcion}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${JORNADA_BADGE[e.jornada] ?? 'bg-gray-100 text-gray-500'}`}>
                              {e.jornada}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center text-gray-600 text-xs">{e.categoria_edificio}°</td>
                          <td className="px-3 py-3 text-gray-500 text-xs">{e.obra_social}</td>
                          <td className="px-3 py-3 text-gray-500 text-xs">{e.banco ?? '—'}</td>
                          <td className="px-3 py-3 text-center text-sm">
                            {plus.length > 0 ? plus.join(' ') : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-3 py-3 text-center text-gray-600 text-xs">
                            {e.antiguedad_anios > 0 ? `${e.antiguedad_anios}a` : '<1a'}
                          </td>
                          <td className="px-3 py-3 text-right pr-4">
                            <Link
                              href={`/sueldos/empleados/${e.cuil}/editar`}
                              className="text-brand-600 hover:underline text-xs font-semibold"
                            >
                              Editar
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho (1/3 de ancho) - Acciones y Escalas */}
        <div className="lg:col-span-1 order-2 lg:order-last space-y-5">
          {/* Panel de Acciones */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Acciones de Liquidación</h3>
            <div className="flex flex-col gap-3">
              <QuickActionLink
                href={`/sueldos/novedades?periodo=${stats.periodo}`}
                title="📝 Novedades del mes"
                desc="Registrar horas extras, licencias, eventualidades."
              />
              <QuickActionLink
                href={`/sueldos/liquidaciones?periodo=${stats.periodo}`}
                title="⚙️ Liquidar Recibos"
                desc="Calcular conceptos, aportes y generar los PDF."
              />
              <QuickActionLink
                href="/sueldos/sac"
                title="💰 Liquidar SAC (Aguinaldo)"
                desc="Cálculo de primer o segundo SAC del año."
              />
              <QuickActionLink
                href="/sueldos/despido"
                title="💼 Egreso o Despido"
                desc="Cálculo de indemnización y liquidación final."
              />
            </div>
          </div>

          {/* Panel de Escalas */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Escalas SUTERH</h3>
            <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100 mb-4">
              <p className="text-xs text-gray-400 font-medium">Básicos y adicionales vigentes al:</p>
              <p className="font-bold text-gray-800 text-lg mt-0.5">{escalaLabel}</p>
            </div>
            <Link
              href="/sueldos/escalas"
              className="btn-secondary w-full justify-center text-sm font-medium"
            >
              Ver escalas vigentes
            </Link>
          </div>
        </div>
        
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

function QuickActionLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="block p-3 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50/20 transition-all group"
    >
      <p className="font-semibold text-gray-800 group-hover:text-brand-700 text-sm transition-colors">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </Link>
  );
}

import Link from "next/link";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import { cleanPeriodo } from "@/lib/format";
import { SueldosTableClient } from "./SueldosTableClient";
import {
  Users,
  FileCheck,
  TrendingUp,
  Wallet,
  CalendarDays,
  UserMinus,
  Scale,
  PlusCircle,
  Clock,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

interface EmpleadoRow {
  cuil: string;
  nombre: string;
  legajo: string | null;
  funcion: string;
  jornada: string;
  consorcio_cuit: string;
  consorcio_nombre: string;
  antiguedad_anios: number;
  categoria_edificio: number;
  obra_social: string;
  banco: string | null;
  tiene_vivienda: boolean;
  retiro_residuos: boolean;
  plus_cocheras: boolean;
  plus_movimiento_coches: boolean;
  plus_jardin: boolean;
  tiene_pileta: boolean;
  plus_zona_desfavorable: boolean;
  tiene_titulo: boolean;
}

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
  return empleados as EmpleadoRow[];
}

async function getSueldosChecklist(activeCuit: string, activePeriodo: string) {
  const db = pool;
  
  const dateObj = new Date(activePeriodo);
  const anio = dateObj.getUTCFullYear();
  const mes = dateObj.getUTCMonth() + 1;

  const [statsRes, novedadesRes, periodExpRes] = await Promise.all([
    db.query(`
      SELECT
        (SELECT COUNT(*) FROM app.empleados WHERE estado = 'activo' AND consorcio_cuit = $2) AS total_empleados,
        (SELECT COUNT(*) FROM app.liquidaciones_sueldo l JOIN app.empleados e ON e.cuil = l.empleado_cuil WHERE l.periodo = $1 AND e.consorcio_cuit = $2 AND l.estado != 'anulada') AS liquidaciones_mes,
        (SELECT COUNT(*) FROM app.liquidaciones_sueldo l JOIN app.empleados e ON e.cuil = l.empleado_cuil WHERE l.periodo = $1 AND l.estado = 'confirmada' AND e.consorcio_cuit = $2) AS confirmadas
    `, [activePeriodo, activeCuit]),
    db.query(`
      SELECT COUNT(*) FROM app.novedades_sueldo n
      JOIN app.empleados e ON e.cuil = n.empleado_cuil
      WHERE e.consorcio_cuit = $1 AND n.periodo = $2
    `, [activeCuit, activePeriodo]),
    db.query(`
      SELECT estado FROM app.periodos_expensas
      WHERE consorcio_cuit = $1 AND anio = $2 AND mes = $3
      LIMIT 1
    `, [activeCuit, anio, mes])
  ]);

  const total_empleados = Number(statsRes.rows[0]?.total_empleados || 0);
  const liquidacionesCount = Number(statsRes.rows[0]?.liquidaciones_mes || 0);
  const confirmadasCount = Number(statsRes.rows[0]?.confirmadas || 0);
  const novedadesCount = Number(novedadesRes.rows[0]?.count || 0);
  const periodoExpensaEstado = periodExpRes.rows[0]?.estado || null; 

  const isPeriodClosed = periodoExpensaEstado === "liquidado" || periodoExpensaEstado === "cerrado";

  const step1Done = total_empleados === 0 || novedadesCount > 0 || liquidacionesCount >= total_empleados || confirmadasCount >= total_empleados || isPeriodClosed;
  const step2Done = total_empleados === 0 || (liquidacionesCount >= total_empleados) || confirmadasCount >= total_empleados || isPeriodClosed;
  const step3Done = total_empleados === 0 || (confirmadasCount >= total_empleados) || isPeriodClosed;
  const step4Done = total_empleados === 0 || (confirmadasCount >= total_empleados);
  const step5Done = isPeriodClosed;

  return {
    total_empleados,
    novedadesCount,
    liquidacionesCount,
    confirmadasCount,
    periodoExpensaEstado,
    step1Done,
    step2Done,
    step3Done,
    step4Done,
    step5Done
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

  const checklist = await getSueldosChecklist(activeCuit, stats.periodo);

  const mes = new Date(stats.periodo).toLocaleDateString("es-AR", { month: "long", year: "numeric", timeZone: "UTC" });
  const escalaLabel = stats.ultima_escala
    ? new Date(stats.ultima_escala).toLocaleDateString("es-AR", { month: "long", year: "numeric", timeZone: "UTC" })
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
        <StatCard label="Empleados activos" value={stats.total_empleados} icon={Users} />
        <StatCard label="Liquidaciones generadas" value={stats.liquidaciones_mes} icon={Clock} />
        <StatCard label="Confirmadas" value={stats.confirmadas} icon={ShieldCheck} />
        <StatCard
          label="Total neto a pagar"
          value={`$${Number(stats.total_neto).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Wallet}
          tooltip="Monto total a transferir a los empleados luego de descuentos."
        />
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Izquierdo (2/3 de ancho) - Nómina de Empleados */}
        <div className="lg:col-span-2 order-1 lg:order-first space-y-6">
          
          {/* Smart Checklist */}
          {checklist && (
            <div className="card p-5">
              <div className="flex items-center gap-1.5 mb-3">
                <h3 className="font-semibold text-gray-800 text-sm">Pasos del período de sueldos</h3>
                <div className="group relative inline-block">
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg text-center normal-case font-normal z-50">
                    Checklist inteligente: monitorea y detecta automáticamente si falta algún paso para cerrar el mes.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                    checklist.step1Done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                  }`}>
                    {checklist.step1Done ? "✓" : "1"}
                  </span>
                  <p className="text-xs font-semibold text-gray-800">1. Cargar Novedades</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {checklist.novedadesCount > 0 ? `${checklist.novedadesCount} novedades` : "Sin cambios"}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                    checklist.step2Done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                  }`}>
                    {checklist.step2Done ? "✓" : "2"}
                  </span>
                  <p className="text-xs font-semibold text-gray-800">2. Liquidar Recibos</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {checklist.total_empleados === 0 
                      ? "Sin empleados" 
                      : `${checklist.liquidacionesCount} de ${checklist.total_empleados} gen.`}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                    checklist.step3Done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                  }`}>
                    {checklist.step3Done ? "✓" : "3"}
                  </span>
                  <p className="text-xs font-semibold text-gray-800">3. Confirmar Recibos</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {checklist.total_empleados === 0 
                      ? "Sin empleados" 
                      : `${checklist.confirmadasCount} de ${checklist.total_empleados} conf.`}
                  </p>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                    checklist.step4Done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                  }`}>
                    {checklist.step4Done ? "✓" : "4"}
                  </span>
                  <p className="text-xs font-semibold text-gray-800">4. Exportar LSD</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {checklist.confirmadasCount > 0 ? "Listo para exportar" : "Pendiente"}
                  </p>
                </div>

                {/* Step 5 */}
                <div className="flex flex-col items-center text-center p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                    checklist.step5Done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                  }`}>
                    {checklist.step5Done ? "✓" : "5"}
                  </span>
                  <p className="text-xs font-semibold text-gray-800">5. Cerrar Período</p>
                  <p className="text-[10px] text-gray-500 mt-1 capitalize">
                    {checklist.periodoExpensaEstado || "abierto"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 text-base">Nómina de Empleados</h3>
                <p className="text-xs text-gray-500 mt-0.5">{empleados.length} empleado{empleados.length !== 1 ? 's' : ''} activo{empleados.length !== 1 ? 's' : ''}</p>
              </div>
              <Link href="/sueldos/empleados/nuevo" className="btn-primary py-1.5 text-xs flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" />
                Agregar empleado
              </Link>
            </div>
            
            <SueldosTableClient empleados={empleados} />
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
                title="Novedades del mes"
                desc="Registrar horas extras, licencias, eventualidades."
                icon={CalendarDays}
              />
              <QuickActionLink
                href={`/sueldos/liquidaciones?periodo=${stats.periodo}`}
                title="Liquidar Recibos"
                desc="Calcular conceptos, aportes y generar los PDF."
                icon={FileCheck}
              />
              <QuickActionLink
                href="/sueldos/sac"
                title="Liquidar SAC (Aguinaldo)"
                desc="Cálculo de primer o segundo SAC del año."
                icon={TrendingUp}
              />
              <QuickActionLink
                href="/sueldos/despido"
                title="Egreso o Despido"
                desc="Cálculo de indemnización y liquidación final."
                icon={UserMinus}
              />
            </div>
          </div>

          {/* Panel de Escalas */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Escalas SUTERH</h3>
            </div>
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

function StatCard({ label, value, icon: Icon, tooltip }: { label: string; value: string | number; icon: React.ComponentType<any>; tooltip?: string }) {
  return (
    <div className="card p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
      <div className="p-3 rounded-lg bg-gray-50 text-gray-500 shrink-0">
        <Icon className="w-5 h-5 text-brand-600" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
          {tooltip && (
            <div className="group relative inline-block">
              <HelpCircle className="w-3 h-3 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg text-center normal-case font-normal z-50">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </div>
        <p className="text-2xl font-extrabold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  );
}

function QuickActionLink({ href, title, desc, icon: Icon }: { href: string; title: string; desc: string; icon: React.ComponentType<any> }) {
  return (
    <Link
      href={href}
      className="flex gap-3.5 p-3 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50/20 transition-all group"
    >
      <div className="p-2 bg-gray-50 text-gray-500 rounded-lg group-hover:bg-brand-55 group-hover:text-brand-600 transition-colors shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="font-bold text-gray-800 group-hover:text-brand-700 text-sm transition-colors">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}

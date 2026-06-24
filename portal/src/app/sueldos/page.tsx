import Link from "next/link";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import { cleanPeriodo } from "@/lib/format";
import { DataTable } from "@/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
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

const columns: ColumnDef<EmpleadoRow>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900 flex items-center gap-1.5">
        {row.original.nombre}
        {row.original.tiene_vivienda && (
          <span className="text-xs text-blue-500" title="Con vivienda">🏠</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "cuil",
    header: "CUIL",
    cell: ({ row }) => <span className="text-gray-400 font-mono text-xs">{row.original.cuil}</span>,
  },
  {
    accessorKey: "funcion",
    header: "Función",
    cell: ({ row }) => {
      const f = row.original.funcion;
      const short = FUNCION_SHORT[f] ?? f;
      return <span className="text-gray-600 text-xs">{short}</span>;
    }
  },
  {
    accessorKey: "jornada",
    header: "Jornada",
    cell: ({ row }) => {
      const j = row.original.jornada;
      return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${JORNADA_BADGE[j] ?? 'bg-gray-100 text-gray-500'}`}>
          {j}
        </span>
      );
    }
  },
  {
    accessorKey: "categoria_edificio",
    header: "Cat.",
    cell: ({ row }) => <span className="text-gray-600 text-xs">{row.original.categoria_edificio}°</span>,
  },
  {
    accessorKey: "obra_social",
    header: "Obra Social",
    cell: ({ row }) => <span className="text-gray-500 text-xs">{row.original.obra_social}</span>,
  },
  {
    accessorKey: "banco",
    header: "Banco",
    cell: ({ row }) => <span className="text-gray-500 text-xs">{row.original.banco ?? '—'}</span>,
  },
  {
    id: "plus",
    header: "Plus",
    cell: ({ row }) => {
      const e = row.original;
      const plus = [
        e.retiro_residuos && '🗑️',
        e.plus_cocheras && '🚗',
        e.plus_movimiento_coches && '🔄',
        e.plus_jardin && '🌳',
        e.tiene_pileta && '🏊',
        e.plus_zona_desfavorable && '⚠️',
        e.tiene_titulo && '🎓',
      ].filter(Boolean);
      return <span className="text-sm">{plus.length > 0 ? plus.join(' ') : <span className="text-gray-300">—</span>}</span>;
    }
  },
  {
    accessorKey: "antiguedad_anios",
    header: "Ant.",
    cell: ({ row }) => {
      const a = row.original.antiguedad_anios;
      return <span className="text-gray-600 text-xs">{a > 0 ? `${a}a` : '<1a'}</span>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right pr-4">
        <Link
          href={`/sueldos/empleados/${row.original.cuil}/editar`}
          className="text-brand-600 hover:underline text-xs font-semibold"
        >
          Editar
        </Link>
      </div>
    )
  }
];

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
        <StatCard label="Empleados activos" value={stats.total_empleados} icon={Users} />
        <StatCard label="Liquidaciones generadas" value={stats.liquidaciones_mes} icon={Clock} />
        <StatCard label="Confirmadas" value={stats.confirmadas} icon={ShieldCheck} />
        <StatCard
          label="Total neto a pagar"
          value={`$${Number(stats.total_neto).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`}
          icon={Wallet}
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
              <Link href="/sueldos/empleados/nuevo" className="btn-primary py-1.5 text-xs flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" />
                Agregar empleado
              </Link>
            </div>
            
            <DataTable columns={columns} data={empleados} emptyMessage="No hay empleados activos en este consorcio." />
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

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<any> }) {
  return (
    <div className="card p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
      <div className="p-3 rounded-lg bg-gray-50 text-gray-500 shrink-0">
        <Icon className="w-5 h-5 text-brand-600" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
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

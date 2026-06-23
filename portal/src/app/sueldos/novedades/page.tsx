import { getEmpleados, getNovedadesPeriodo } from "../actions";
import { PeriodNav } from "@/components/ui/PeriodNav";
import NovedadesForm from "./NovedadesForm";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import { pool } from "@/lib/db";
import { cleanPeriodo } from "@/lib/format";

interface Props {
  searchParams: Promise<{ periodo?: string }>;
}

export default async function NovedadesPage({ searchParams }: Props) {
  const { periodo: periodoParam } = await searchParams;
  const cleanedPeriodo = cleanPeriodo(periodoParam);
  
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";
  const activePeriodo = cleanPeriodo(cookieStore.get("active_periodo")?.value);

  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const periodo = cleanedPeriodo || activePeriodo || defaultPeriod;

  // Get consorcios for fallback
  const { rows: consorciosRows } = await pool.query(
    "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
  );

  if (!activeCuit) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Novedades del mes</h1>
        <ConsorcioRequerido consorcios={consorciosRows} seccion="las novedades de sueldos" />
      </div>
    );
  }

  const consorcioFiltro = activeCuit;

  const [empleados, novedades] = await Promise.all([
    getEmpleados(),
    getNovedadesPeriodo(periodo),
  ]);

  const novedadesMap = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    novedades.map((n: any) => [n.empleado_cuil, n])
  );

  const label = new Date(periodo).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  // Group by consorcio
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const consorcios = Array.from(new Map(empleados.map((e: any) => [e.consorcio_cuit, e.consorcio_nombre])).entries())
    .sort((a, b) => String(a[1]).localeCompare(String(b[1])));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = empleados.filter((e: any) => String(e.consorcio_cuit) === consorcioFiltro);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const grouped = consorcios
    .map(([cuit, nombre]) => ({
      cuit,
      nombre,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      empleados: filtered.filter((e: any) => e.consorcio_cuit === cuit),
    }))
    .filter((g) => g.empleados.length > 0);

  const cargados = Object.keys(novedadesMap).filter(cuil => filtered.some((e: any) => e.cuil === cuil)).length;

  const activeConsorcioNombre = consorcios.find(([cuit]) => cuit === activeCuit)?.[1] || activeCuit;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novedades del mes</h1>
          <p className="text-gray-500 text-sm mt-1 capitalize">{label}</p>
        </div>
        <div className="flex gap-2 items-center">
          <PeriodNav periodo={periodo} />
        </div>
      </div>

      {/* Filtro + resumen */}
      <div className="flex items-center gap-4 mb-6 bg-white p-4 border border-gray-200 rounded-lg">
        <span className="text-sm text-gray-600 font-medium">
          Consorcio: <span className="text-brand-600 font-bold">{String(activeConsorcioNombre)}</span>
        </span>
        <span className="text-gray-300">|</span>
        <span className="text-sm text-gray-500">
          {cargados} de {filtered.length} empleados con novedades cargadas
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No hay empleados activos.</p>
      ) : (
        <div className="space-y-6">
          {grouped.map((g) => (
            <div key={String(g.cuit)}>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{String(g.nombre)}</h2>
                <span className="text-xs text-gray-400">{g.empleados.length} empleado{g.empleados.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {g.empleados.map((emp: any) => (
                  <NovedadesForm
                    key={emp.cuil}
                    empleado={emp}
                    periodo={periodo}
                    novedades={novedadesMap[emp.cuil] ?? null}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

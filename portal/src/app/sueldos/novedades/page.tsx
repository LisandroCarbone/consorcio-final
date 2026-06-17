export const dynamic = "force-dynamic";

import { getEmpleados, getNovedadesPeriodo } from "../actions";
import { PeriodNav } from "@/components/ui/PeriodNav";
import NovedadesForm from "./NovedadesForm";

interface Props {
  searchParams: Promise<{ periodo?: string; consorcio?: string }>;
}

export default async function NovedadesPage({ searchParams }: Props) {
  const { periodo: periodoParam, consorcio: consorcioFiltro } = await searchParams;
  const now = new Date();
  const periodo =
    periodoParam ??
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [empleados, novedades] = await Promise.all([
    getEmpleados(),
    getNovedadesPeriodo(periodo),
  ]);

  const novedadesMap = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    novedades.map((n: any) => [n.empleado_id, n])
  );

  const label = new Date(periodo).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  // Group by consorcio
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const consorcios = Array.from(new Map(empleados.map((e: any) => [e.consorcio_id, e.consorcio_nombre])).entries())
    .sort((a, b) => String(a[1]).localeCompare(String(b[1])));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = consorcioFiltro
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? empleados.filter((e: any) => String(e.consorcio_id) === consorcioFiltro)
    : empleados;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const grouped = consorcios
    .map(([id, nombre]) => ({
      id,
      nombre,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      empleados: filtered.filter((e: any) => e.consorcio_id === id),
    }))
    .filter((g) => g.empleados.length > 0);

  const cargados = Object.keys(novedadesMap).length;

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
      <div className="flex items-center gap-4 mb-6">
        <form method="GET" className="flex items-center gap-2">
          <input type="hidden" name="periodo" value={periodo} />
          <select
            name="consorcio"
            defaultValue={consorcioFiltro ?? ""}
            onChange={(e) => (e.target.form as HTMLFormElement).submit()}
            className="input text-sm py-1.5 pr-8"
          >
            <option value="">Todos los consorcios</option>
            {consorcios.map(([id, nombre]) => (
              <option key={id} value={id}>{String(nombre)}</option>
            ))}
          </select>
          <button type="submit" className="btn-secondary text-sm">Filtrar</button>
        </form>
        <span className="text-sm text-gray-400">
          {cargados} de {empleados.length} empleados con novedades cargadas
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No hay empleados activos.</p>
      ) : (
        <div className="space-y-6">
          {grouped.map((g) => (
            <div key={String(g.id)}>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{String(g.nombre)}</h2>
                <span className="text-xs text-gray-400">{g.empleados.length} empleado{g.empleados.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {g.empleados.map((emp: any) => (
                  <NovedadesForm
                    key={emp.id}
                    empleado={emp}
                    periodo={periodo}
                    novedades={novedadesMap[emp.id] ?? null}
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

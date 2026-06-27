import { query } from "@/lib/db";
import { formatMoney, formatMonth, formatDate, cleanPeriodo } from "@/lib/format";
import { createPeriodo, calcularExpensas, regenerarGastosFijos } from "./actions";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import { AddGastoForm } from "./AddGastoForm";
import { ExpensasTableClient } from "./ExpensasTableClient";
import { CalendarDays } from "lucide-react";

async function getData(activeCuit?: string) {
  const params: unknown[] = [];
  let where = "";
  if (activeCuit) {
    params.push(activeCuit);
    where = "WHERE p.consorcio_cuit = $1";
  }

  const [periodos, consorcios] = await Promise.all([
    query<{
      id: number; consorcio_id: string; consorcio_nombre: string;
      anio: number; mes: number; estado: string; fecha_vencimiento: string | null;
      total_gastos: string; total_expensas: string; pagadas: string;
    }>(
      `SELECT p.id, p.consorcio_cuit AS consorcio_id, c.nombre AS consorcio_nombre,
              p.anio, p.mes, p.estado, p.fecha_vencimiento,
              COALESCE((SELECT SUM(monto) FROM app.gastos_periodo WHERE periodo_id=p.id), 0) AS total_gastos,
              (SELECT COUNT(*) FROM app.res_cuenta_periodo WHERE periodo_id=p.id) AS total_expensas,
              (SELECT COUNT(*) FROM app.res_cuenta_periodo WHERE periodo_id=p.id AND estado='pagada') AS pagadas
       FROM app.periodos_expensas p
       JOIN app.consorcios c ON c.cuit = p.consorcio_cuit
       ${where}
       GROUP BY p.id, c.nombre, p.anio, p.mes, p.estado, p.fecha_vencimiento
       ORDER BY p.anio DESC, p.mes DESC`,
      params
    ),
    query<{ id: string; nombre: string }>("SELECT cuit AS id, nombre FROM app.consorcios ORDER BY nombre"),
  ]);
  return { periodos, consorcios };
}

async function getPeriodoDetail(periodoId: number, consorcioCuit: string) {
  const [gastos, unidades] = await Promise.all([
    query<{ id: number; concepto: string; monto: string; tipo: string; categoria: number }>(
      "SELECT id, descripcion AS concepto, monto::numeric, tipo, categoria FROM app.gastos_periodo WHERE periodo_id=$1 ORDER BY categoria, tipo, descripcion",
      [periodoId]
    ),
    query<{ id: number; uf: number }>(
      "SELECT id, uf FROM app.unidades WHERE consorcio_cuit=$1 ORDER BY uf",
      [consorcioCuit]
    ),
  ]);
  return { gastos, unidades };
}


export default async function ExpensasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const sp = await searchParams;
  const selectedPeriodo = sp.periodo ? Number(sp.periodo) : null;

  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  const { periodos, consorcios } = await getData(activeCuit);

  if (!activeCuit) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Expensas</h2>
        <ConsorcioRequerido
          consorcios={consorcios.map((c) => ({ cuit: c.id, nombre: c.nombre }))}
          seccion="las expensas"
        />
      </div>
    );
  }

  const activePeriodoRaw = cookieStore.get("active_periodo")?.value;
  const activePeriodo = cleanPeriodo(activePeriodoRaw);
  let activeYear = 0;
  let activeMonth = 0;
  if (activePeriodo) {
    const parts = activePeriodo.split("-");
    activeYear = Number(parts[0]);
    activeMonth = Number(parts[1]);
  }
  if (!activeYear || isNaN(activeYear) || activeYear < 2000 || !activeMonth || isNaN(activeMonth)) {
    const now = new Date();
    activeYear = now.getFullYear();
    activeMonth = now.getMonth() + 1;
  }

  const matchedPeriod = periodos.find(
    (p) => p.consorcio_id === activeCuit && p.anio === activeYear && p.mes === activeMonth
  );

  const selected = selectedPeriodo
    ? periodos.find((p) => p.id === selectedPeriodo)
    : matchedPeriod || null;

  const detail = selected
    ? await getPeriodoDetail(selected.id, selected.consorcio_id)
    : null;

  // El botón "Recalcular prorrateo" solo aparece en el período más reciente del consorcio.
  // periodos viene ordenado por anio DESC, mes DESC, así que el primero con el mismo
  // consorcio_id es el más reciente.
  const ultimoPeriodoCuit = selected
    ? periodos.find((p) => p.consorcio_id === selected.consorcio_id)?.id
    : null;
  const isUltimoPeriodo = selected ? selected.id === ultimoPeriodoCuit : false;

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Expensas</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Períodos */}
        <div className="lg:col-span-1 order-2 lg:order-last">
          <div className="card mb-4">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <CalendarDays className="w-4.5 h-4.5 text-gray-400" />
              <h3 className="font-semibold text-gray-800">Períodos</h3>
            </div>
            <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {periodos.map((p) => {
                const isActive = selected?.id === p.id;
                return (
                  <li key={p.id}>
                    <a
                      href={`/expensas?periodo=${p.id}`}
                      className={`flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors border-l-4 ${
                        isActive
                          ? "border-brand-600 bg-brand-50/20"
                          : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CalendarDays className={`w-4 h-4 ${isActive ? "text-brand-600" : "text-gray-400"}`} />
                        <div>
                          <p className={`text-sm font-semibold ${isActive ? "text-brand-700" : "text-gray-700"}`}>
                            {formatMonth(p.anio, p.mes)}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{p.consorcio_nombre}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`badge text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            p.estado === "liquidado"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {p.estado}
                        </span>
                        <p className="text-xs font-semibold text-gray-600 mt-1 font-mono">{formatMoney(p.total_gastos)}</p>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Nuevo período */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Nuevo período</h3>
            <form action={createPeriodo} className="space-y-3">
              <div>
                <label className="label">Consorcio *</label>
                <select disabled value={activeCuit} className="input bg-gray-50 cursor-not-allowed">
                  {consorcios.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <input type="hidden" name="consorcio_id" value={activeCuit} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Año *</label>
                  <input name="anio" type="number" defaultValue={new Date().getFullYear()} required className="input" />
                </div>
                <div>
                  <label className="label">Mes *</label>
                  <input name="mes" type="number" min="1" max="12" defaultValue={new Date().getMonth() + 1} required className="input" />
                </div>
              </div>
              <div>
                <label className="label">Vencimiento</label>
                <input name="fecha_vencimiento" type="date" className="input" />
              </div>
              <button type="submit" className="btn-primary w-full justify-center">Crear período</button>
            </form>
          </div>
        </div>

        {/* Detalle del período seleccionado */}
        <div className="lg:col-span-2 order-1 lg:order-first">
          {!selected ? (
            <div className="card p-12 text-center">
              <p className="text-3xl mb-2">💰</p>
              <h4 className="font-semibold text-gray-800 mb-1">Período no inicializado</h4>
              <p className="text-gray-500 text-sm mb-4">
                No existe el período para {formatMonth(activeYear, activeMonth)} en este consorcio.
              </p>
              <div className="max-w-sm mx-auto bg-gray-50 p-5 rounded-lg border border-gray-100 text-left">
                <h5 className="text-xs font-bold text-gray-700 uppercase mb-2">Crear período ahora</h5>
                <form action={createPeriodo} className="space-y-3">
                  <input type="hidden" name="consorcio_id" value={activeCuit} />
                  <input type="hidden" name="anio" value={activeYear} />
                  <input type="hidden" name="mes" value={activeMonth} />
                  <div>
                    <label className="label">Vencimiento</label>
                    <input
                      name="fecha_vencimiento"
                      type="date"
                      className="input"
                      defaultValue={new Date(activeYear, activeMonth - 1, 10).toISOString().slice(0, 10)}
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center">
                    Crear período {formatMonth(activeYear, activeMonth)}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {formatMonth(selected.anio, selected.mes)} — {selected.consorcio_nombre}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Vencimiento: {formatDate(selected.fecha_vencimiento)} · Estado: <strong>{selected.estado}</strong>
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <form action={regenerarGastosFijos.bind(null, selected.id)}>
                      <button type="submit" className="btn-secondary text-amber-700 border-amber-300 hover:bg-amber-50">
                        ⚡ Regenerar Cat. 1
                      </button>
                    </form>
                    {isUltimoPeriodo && (
                      <form action={calcularExpensas.bind(null, selected.id)}>
                        <button type="submit" className="btn-primary">
                          🔁 Recalcular prorrateo
                        </button>
                      </form>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Total gastos</p>
                    <p className="font-bold text-gray-800">{formatMoney(selected.total_gastos)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Unidades</p>
                    <p className="font-bold text-gray-800">{selected.total_expensas}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Pagadas</p>
                    <p className="font-bold text-green-600">{selected.pagadas} / {selected.total_expensas}</p>
                  </div>
                </div>
              </div>

              {/* Gastos */}
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 text-base">Gastos del período</h3>
                  <p className="text-lg font-bold text-gray-900">{formatMoney(selected.total_gastos)}</p>
                </div>
                <ExpensasTableClient gastos={detail?.gastos ?? []} />
                <AddGastoForm
                  periodoId={selected.id}
                  unidades={detail?.unidades ?? []}
                />
              </div>


            </div>
          )}
        </div>
      </div>
    </div>
  );
}

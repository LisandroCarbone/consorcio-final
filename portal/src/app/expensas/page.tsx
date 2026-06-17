export const dynamic = 'force-dynamic';

import { query } from "@/lib/db";
import { formatMoney, formatMonth, formatDate } from "@/lib/format";
import { createPeriodo, addGasto, calcularExpensas, marcarPagada } from "./actions";

async function getData() {
  const [periodos, consorcios] = await Promise.all([
    query<{
      id: number; consorcio_id: number; consorcio_nombre: string;
      anio: number; mes: number; estado: string; fecha_vencimiento: string | null;
      total_gastos: string; total_expensas: string; pagadas: string;
    }>(
      `SELECT p.*, c.nombre AS consorcio_nombre,
              COALESCE((SELECT SUM(monto) FROM gastos WHERE periodo_id=p.id), 0) AS total_gastos,
              COUNT(e.id) AS total_expensas,
              COUNT(e.id) FILTER (WHERE e.estado='pagada') AS pagadas
       FROM periodos p
       JOIN consorcios c ON c.id = p.consorcio_id
       LEFT JOIN expensas e ON e.periodo_id = p.id
       GROUP BY p.id, c.nombre
       ORDER BY p.anio DESC, p.mes DESC`
    ),
    query<{ id: number; nombre: string }>("SELECT id, nombre FROM consorcios ORDER BY nombre"),
  ]);
  return { periodos, consorcios };
}

async function getPeriodoDetail(periodoId: number) {
  const [gastos, expensas] = await Promise.all([
    query<{ id: number; concepto: string; monto: string; tipo: string }>(
      "SELECT * FROM gastos WHERE periodo_id=$1 ORDER BY tipo, concepto",
      [periodoId]
    ),
    query<{
      id: number; unidad_numero: string; monto_total: string;
      estado: string; ocupante_nombre: string | null; ocupante_email: string | null;
    }>(
      `SELECT e.id, u.numero AS unidad_numero, e.monto_total, e.estado,
              p.nombre||' '||p.apellido AS ocupante_nombre, p.email AS ocupante_email
       FROM expensas e
       JOIN unidades u ON u.id=e.unidad_id
       LEFT JOIN ocupantes o ON o.unidad_id=u.id AND o.activo=true AND o.rol='propietario'
       LEFT JOIN personas p ON p.id=o.persona_id
       WHERE e.periodo_id=$1 ORDER BY u.numero`,
      [periodoId]
    ),
  ]);
  return { gastos, expensas };
}

const TIPO_COLORS: Record<string, string> = {
  ordinario: "bg-blue-50 text-blue-700",
  extraordinario: "bg-purple-50 text-purple-700",
  fondo_reserva: "bg-green-50 text-green-700",
};

export default async function ExpensasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const sp = await searchParams;
  const selectedPeriodo = sp.periodo ? Number(sp.periodo) : null;
  const { periodos, consorcios } = await getData();
  const selected = selectedPeriodo ? periodos.find((p) => p.id === selectedPeriodo) : null;
  const detail = selectedPeriodo ? await getPeriodoDetail(selectedPeriodo) : null;

  return (
    <div className="max-w-6xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Expensas</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Períodos */}
        <div className="lg:col-span-1">
          <div className="card mb-4">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Períodos</h3>
            </div>
            <ul className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {periodos.map((p) => (
                <li key={p.id}>
                  <a
                    href={`/expensas?periodo=${p.id}`}
                    className={`flex items-center justify-between px-5 py-3 hover:bg-gray-50 ${selectedPeriodo === p.id ? "bg-brand-50" : ""}`}
                  >
                    <div>
                      <p className="text-sm font-medium">{formatMonth(p.anio, p.mes)}</p>
                      <p className="text-xs text-gray-500">{p.consorcio_nombre}</p>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${p.estado === "liquidado" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {p.estado}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{formatMoney(p.total_gastos)}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Nuevo período */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Nuevo período</h3>
            <form action={createPeriodo} className="space-y-3">
              <div>
                <label className="label">Consorcio *</label>
                <select name="consorcio_id" required className="input">
                  {consorcios.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
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
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="card p-12 text-center text-gray-400">
              <p className="text-3xl mb-2">💰</p>
              <p>Seleccioná un período para ver el detalle</p>
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
                  {selected.estado !== "liquidado" && (
                    <form action={calcularExpensas.bind(null, selected.id)}>
                      <button type="submit" className="btn-primary">⚙️ Calcular expensas</button>
                    </form>
                  )}
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
              <div className="card">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">Gastos del período</h3>
                  <p className="text-sm font-bold">{formatMoney(selected.total_gastos)}</p>
                </div>
                {detail?.gastos.map((g) => (
                  <div key={g.id} className="flex items-center justify-between px-5 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${TIPO_COLORS[g.tipo] ?? ""}`}>{g.tipo}</span>
                      <span className="text-sm">{g.concepto}</span>
                    </div>
                    <span className="text-sm font-mono">{formatMoney(g.monto)}</span>
                  </div>
                ))}
                {/* Add gasto form */}
                <form action={addGasto} className="flex gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <input type="hidden" name="periodo_id" value={selected.id} />
                  <input name="concepto" required placeholder="Concepto" className="input flex-1" />
                  <input name="monto" type="number" step="0.01" required placeholder="Monto" className="input w-28" />
                  <select name="tipo" className="input w-36">
                    <option value="ordinario">Ordinario</option>
                    <option value="extraordinario">Extraordinario</option>
                    <option value="fondo_reserva">Fondo reserva</option>
                  </select>
                  <button type="submit" className="btn-primary shrink-0">+ Agregar</button>
                </form>
              </div>

              {/* Expensas por unidad */}
              {detail && detail.expensas.length > 0 && (
                <div className="card">
                  <div className="px-5 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700">Expensas por unidad</h3>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="th">Unidad</th>
                        <th className="th">Propietario</th>
                        <th className="th text-right">Total</th>
                        <th className="th text-center">Estado</th>
                        <th className="th"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.expensas.map((e) => (
                        <tr key={e.id} className="table-row hover:bg-gray-50">
                          <td className="td font-medium">{e.unidad_numero}</td>
                          <td className="td text-gray-600 text-sm">{e.ocupante_nombre ?? "—"}</td>
                          <td className="td text-right font-mono text-sm">{formatMoney(e.monto_total)}</td>
                          <td className="td text-center">
                            <span className={`badge ${e.estado === "pagada" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {e.estado}
                            </span>
                          </td>
                          <td className="td">
                            {e.estado === "pendiente" && (
                              <form action={marcarPagada.bind(null, e.id)}>
                                <button type="submit" className="text-xs text-brand-600 hover:underline">Marcar pagada</button>
                              </form>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

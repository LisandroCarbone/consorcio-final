import React from "react";
import { query } from "@/lib/db";
import { formatMoney, formatMonth } from "@/lib/format";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import { agregarDeudaHistorica } from "../actions";
import { FileClock } from "lucide-react";

interface DeudaRow {
  id: number;
  unidad_numero: string;
  anio: number;
  mes: number;
  monto_original: string;
  monto_capital_pendiente: string;
  estado: string;
  [key: string]: unknown;
}

interface UnidadOption {
  id: number;
  unidad_numero: string;
  [key: string]: unknown;
}

async function getDeudaHistorica(consorcioCuit: string): Promise<DeudaRow[]> {
  return query<DeudaRow>(
    `SELECT dp.id,
            COALESCE(u.uf_numero::text, u.uf::text) AS unidad_numero,
            pe.anio, pe.mes,
            dp.monto_original::text, dp.monto_capital_pendiente::text, dp.estado
     FROM app.deuda_periodo dp
     JOIN app.unidades u ON u.id = dp.unidad_id
     JOIN app.periodos_expensas pe ON pe.id = dp.periodo_id
     WHERE u.consorcio_cuit = $1
     ORDER BY pe.anio DESC, pe.mes DESC, unidad_numero`,
    [consorcioCuit]
  );
}

async function getUnidades(consorcioCuit: string): Promise<UnidadOption[]> {
  return query<UnidadOption>(
    `SELECT id, COALESCE(uf_numero::text, uf::text) AS unidad_numero
     FROM app.unidades
     WHERE consorcio_cuit = $1
     ORDER BY uf_numero NULLS LAST, uf`,
    [consorcioCuit]
  );
}

export default async function DeudaHistoricaPage() {
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  const [consorcios, deudas, unidades] = await Promise.all([
    query<{ cuit: string; nombre: string }>(
      "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
    ),
    activeCuit ? getDeudaHistorica(activeCuit) : Promise.resolve([] as DeudaRow[]),
    activeCuit ? getUnidades(activeCuit) : Promise.resolve([] as UnidadOption[]),
  ]);

  if (!activeCuit) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Deuda Histórica</h2>
        <ConsorcioRequerido consorcios={consorcios} seccion="la carga de deuda histórica" />
      </div>
    );
  }

  const selectedConsorcio = consorcios.find((c) => c.cuit === activeCuit);
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Deuda Histórica</h2>
        <p className="text-gray-500 text-sm mt-1">
          Carga de deuda pre-existente por período, para que el motor de intereses la tome como punto de partida — <strong>{selectedConsorcio?.nombre}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <FileClock className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-800">
                Deuda por período <span className="text-gray-400 font-normal text-sm">({deudas.length})</span>
              </h3>
            </div>
            {deudas.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="th">Unidad</th>
                    <th className="th">Período</th>
                    <th className="th text-right">Monto original</th>
                    <th className="th text-right">Capital pendiente</th>
                    <th className="th text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {deudas.map((d) => (
                    <tr key={d.id} className="table-row hover:bg-gray-50">
                      <td className="td font-medium">{d.unidad_numero}</td>
                      <td className="td text-gray-500">{formatMonth(d.anio, d.mes)}</td>
                      <td className="td text-right font-mono">{formatMoney(d.monto_original)}</td>
                      <td className="td text-right font-mono">{formatMoney(d.monto_capital_pendiente)}</td>
                      <td className="td text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          d.estado === "pagada" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {d.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-6 text-sm text-gray-500 text-center">No hay deuda histórica cargada para este consorcio.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Cargar deuda de un período</h3>
            <form action={agregarDeudaHistorica} className="space-y-3">
              <input type="hidden" name="consorcio_cuit" value={activeCuit} />
              <div>
                <label className="label">Unidad *</label>
                <select name="unidad_id" required className="input">
                  <option value="">Seleccionar...</option>
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>{u.unidad_numero}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Año *</label>
                  <input name="anio" type="number" min="2000" defaultValue={currentYear} required className="input" />
                </div>
                <div>
                  <label className="label">Mes *</label>
                  <select name="mes" required className="input">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Monto adeudado *</label>
                <input name="monto_original" type="number" step="0.01" min="0.01" required className="input" placeholder="0.00" />
              </div>
              <button type="submit" className="btn-primary w-full justify-center">Cargar deuda</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

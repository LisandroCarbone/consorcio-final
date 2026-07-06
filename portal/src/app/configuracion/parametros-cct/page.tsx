import React from "react";
import { query } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { agregarParametroCCT, eliminarParametroCCT } from "./actions";

interface ParametroCCT {
  id: number;
  fecha_desde: string;
  detraccion_fija_mensual: string;
  created_at: string;
  [key: string]: unknown;
}

export default async function ParametrosCCTPage() {
  const params = await query<ParametroCCT>(
    "SELECT id, fecha_desde::text, detraccion_fija_mensual::numeric, created_at::text FROM app.parametros_cct ORDER BY fecha_desde DESC"
  );

  const vigente = params[0];

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Parámetros CCT</h2>
        <p className="text-sm text-gray-500 mt-1">
          Valores del Convenio Colectivo 589/10 que aplican a todos los consorcios.
          Actualizá cuando AFIP emita una nueva resolución.
        </p>
      </div>

      {/* Valor vigente */}
      {vigente && (
        <div className="card p-5 mb-6 border-l-4 border-brand-500">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">Vigente desde {vigente.fecha_desde}</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">{formatMoney(vigente.detraccion_fija_mensual)}</span>
            <span className="text-sm text-gray-500">Detracción F.931 mensual (encargado permanente jornada completa)</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Media jornada: {formatMoney(Number(vigente.detraccion_fija_mensual) / 2)} · SAC (×1.5): {formatMoney(Number(vigente.detraccion_fija_mensual) * 1.5)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historial */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Historial de detracción F.931</h3>
          </div>
          {params.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">Sin registros</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="th">Vigente desde</th>
                  <th className="th text-right">Detracción</th>
                  <th className="th" />
                </tr>
              </thead>
              <tbody>
                {params.map((p, i) => (
                  <tr key={p.id} className={`table-row hover:bg-gray-50 ${i === 0 ? "font-semibold" : "text-gray-500"}`}>
                    <td className="td text-sm">
                      {p.fecha_desde}
                      {i === 0 && <span className="ml-2 badge bg-green-100 text-green-700 text-[10px]">actual</span>}
                    </td>
                    <td className="td text-right font-mono text-sm">{formatMoney(p.detraccion_fija_mensual)}</td>
                    <td className="td text-right">
                      {params.length > 1 && i === 0 && (
                        <form action={eliminarParametroCCT.bind(null, p.id)}>
                          <button
                            type="submit"
                            className="text-xs text-red-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Formulario */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Actualizar detracción</h3>
          <form action={agregarParametroCCT} className="space-y-4">
            <div>
              <label className="label">Vigente desde *</label>
              <input
                name="fecha_desde"
                type="date"
                required
                className="input"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Los períodos anteriores a esta fecha siguen usando el valor anterior.
              </p>
            </div>
            <div>
              <label className="label">Detracción mensual (encargado jornada completa) *</label>
              <input
                name="detraccion_fija_mensual"
                type="number"
                step="0.01"
                required
                placeholder="12003.68"
                className="input"
              />
              <p className="text-xs text-gray-400 mt-1">
                Fuente: Resolución General AFIP. Media jornada y suplentes se calculan automáticamente.
              </p>
            </div>
            <button type="submit" className="btn-primary w-full justify-center">
              Guardar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

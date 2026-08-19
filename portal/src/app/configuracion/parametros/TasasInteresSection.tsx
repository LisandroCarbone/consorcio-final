"use client";

import { formatDate } from "@/lib/format";
import { crearTasaInteres } from "@/app/finanzas/actions";
import { eliminarTasaInteres } from "./actions";

export type TasaRow = {
  id: number;
  tasa: string;
  fecha_desde: string;
  fecha_hasta: string | null;
  [key: string]: unknown;
};

interface Props {
  tasas: TasaRow[];
  consorcioCuit: string;
  consorcioNombre: string;
}

export function TasasInteresSection({ tasas, consorcioCuit, consorcioNombre }: Props) {
  if (!consorcioCuit) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Tasas de interés moratorio</h3>
        <p className="text-sm text-amber-600">
          Seleccion&aacute; un consorcio desde el selector global para ver y editar sus tasas de inter&eacute;s.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Tasas de interés moratorio</h3>
        <p className="text-sm text-gray-500 mt-1">
          Registro histórico de tasas de interés moratorio de{" "}
          <span className="font-semibold text-gray-700">{consorcioNombre}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Historial de tasas</h3>
          </div>
          {tasas.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">Sin tasas registradas para este consorcio</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="th">Vigente desde</th>
                    <th className="th">Vigente hasta</th>
                    <th className="th text-right">Tasa mensual (%)</th>
                    <th className="th" />
                  </tr>
                </thead>
                <tbody>
                  {tasas.map((t, i) => (
                    <tr
                      key={t.id}
                      className={`group table-row hover:bg-gray-50 ${
                        i === 0 ? "font-semibold" : "text-gray-500"
                      }`}
                    >
                      <td className="td text-sm whitespace-nowrap">
                        {formatDate(t.fecha_desde)}
                        {i === 0 && <span className="ml-2 badge bg-green-100 text-green-700 text-[10px]">actual</span>}
                      </td>
                      <td className="td text-gray-500">{t.fecha_hasta ? formatDate(t.fecha_hasta) : "Vigente"}</td>
                      <td className="td text-right font-mono text-xs">{(Number(t.tasa) * 100).toFixed(2)}%</td>
                      <td className="td text-right whitespace-nowrap">
                        <div className="flex gap-1 justify-end">
                          {tasas.length > 1 && i === 0 && (
                            <form action={eliminarTasaInteres.bind(null, t.id)}>
                              <button
                                type="submit"
                                className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                                title="Eliminar"
                              >
                                X
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Nueva tasa</h3>
          <form action={crearTasaInteres} className="space-y-4">
            <input type="hidden" name="consorcio_cuit" value={consorcioCuit} />
            <div>
              <label className="label">Tasa mensual (%) *</label>
              <input
                name="tasa_pct"
                type="number"
                step="0.01"
                min="0"
                required
                className="input"
                placeholder="Ej: 3"
              />
            </div>
            <div>
              <label className="label">Vigente desde *</label>
              <input name="fecha_desde" type="date" required className="input" />
            </div>
            <button type="submit" className="btn-primary w-full justify-center">
              Agregar tasa
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

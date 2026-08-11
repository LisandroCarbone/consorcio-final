import React from "react";
import { query } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import { crearTasaInteres } from "../actions";
import { Percent } from "lucide-react";

interface TasaRow {
  id: number;
  tasa: string;
  fecha_desde: string;
  fecha_hasta: string | null;
  [key: string]: unknown;
}

async function getTasas(consorcioCuit: string): Promise<TasaRow[]> {
  return query<TasaRow>(
    `SELECT id, tasa::text, fecha_desde::text, fecha_hasta::text
     FROM app.tasas_interes
     WHERE consorcio_cuit = $1
     ORDER BY fecha_desde DESC`,
    [consorcioCuit]
  );
}

export default async function TasasInteresPage() {
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  const [consorcios, tasas] = await Promise.all([
    query<{ cuit: string; nombre: string }>(
      "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
    ),
    activeCuit ? getTasas(activeCuit) : Promise.resolve([] as TasaRow[]),
  ]);

  if (!activeCuit) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tasas de Interés</h2>
        <ConsorcioRequerido consorcios={consorcios} seccion="las tasas de interés" />
      </div>
    );
  }

  const selectedConsorcio = consorcios.find((c) => c.cuit === activeCuit);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tasas de Interés</h2>
        <p className="text-gray-500 text-sm mt-1">
          Registro histórico de tasas de interés moratorio — <strong>{selectedConsorcio?.nombre}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Percent className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-800">
                Tasas registradas <span className="text-gray-400 font-normal text-sm">({tasas.length})</span>
              </h3>
            </div>
            {tasas.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="th">Vigente desde</th>
                    <th className="th">Vigente hasta</th>
                    <th className="th text-right">Tasa mensual</th>
                  </tr>
                </thead>
                <tbody>
                  {tasas.map((t) => (
                    <tr key={t.id} className="table-row hover:bg-gray-50">
                      <td className="td font-medium">{formatDate(t.fecha_desde)}</td>
                      <td className="td text-gray-500">{t.fecha_hasta ? formatDate(t.fecha_hasta) : "Vigente"}</td>
                      <td className="td text-right font-mono">{(Number(t.tasa) * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-6 text-sm text-gray-500 text-center">No hay tasas registradas para este consorcio.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Nueva tasa</h3>
            <form action={crearTasaInteres} className="space-y-3">
              <input type="hidden" name="consorcio_cuit" value={activeCuit} />
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
              <button type="submit" className="btn-primary w-full justify-center">Agregar tasa</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

import { pool } from "@/lib/db";
import { PeriodoSelect } from "./PeriodoSelect";
import { TriggerN8nButton } from "./TriggerN8nButton";

async function getEscalasData(periodo?: string) {
  const { rows: periodos } = await pool.query(
    "SELECT DISTINCT periodo FROM app.escalas_suterh ORDER BY periodo DESC LIMIT 24"
  );
  if (periodos.length === 0) return { periodos: [], escalas: [], adicionales: [], selected: null };

  const selected = periodo ?? periodos[0].periodo;
  const [{ rows: escalas }, { rows: adicionales }] = await Promise.all([
    pool.query("SELECT * FROM app.escalas_suterh WHERE periodo = $1 ORDER BY funcion", [selected]),
    pool.query("SELECT * FROM app.adicionales_suterh WHERE periodo = $1 ORDER BY concepto", [selected]),
  ]);
  return { periodos, escalas, adicionales, selected };
}

const fmtPeriodo = (p: string) =>
  new Date(p).toLocaleDateString("es-AR", { month: "long", year: "numeric", timeZone: "UTC" });

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function EscalasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo: periodoParam } = await searchParams;
  const { periodos, escalas, adicionales, selected } = await getEscalasData(periodoParam);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Escalas SUTERH</h1>
          {selected && (
            <p className="text-gray-500 text-sm mt-1 capitalize">{fmtPeriodo(selected)}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {periodos.length > 1 && (
            <PeriodoSelect
              periodos={periodos}
              selected={selected ?? ''}
              fmtPeriodo={fmtPeriodo}
            />
          )}
          <TriggerN8nButton />
          <a
            href="https://suterh.org.ar/planillas-salariales/"
            target="_blank"
            rel="noopener"
            className="btn-secondary text-sm"
          >
            Ver en SUTERH ↗
          </a>
        </div>
      </div>

      {escalas.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <p className="mb-2">No hay escalas cargadas todavía.</p>
          <p className="text-sm">
            Se actualizan automáticamente el día 1 de cada mes vía el workflow de n8n.
            <br />
            Para cargar manualmente, activá el workflow "Actualizar Escalas SUTERH" en n8n.
          </p>
        </div>
      ) : (
        <>
          <div className="card mb-6 overflow-x-auto">
            <p className="font-semibold text-gray-700 mb-3">Sueldos básicos por función y categoría</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500 text-left">
                  <th className="pb-2 pr-4">Función</th>
                  <th className="pb-2 pr-3 text-right">1° Cat.</th>
                  <th className="pb-2 pr-3 text-right">2° Cat.</th>
                  <th className="pb-2 pr-3 text-right">3° Cat.</th>
                  <th className="pb-2 text-right">4° Cat.</th>
                </tr>
              </thead>
              <tbody>
                {escalas.map((e: any) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-gray-800">{e.funcion}</td>
                    {[e.cat_1, e.cat_2, e.cat_3, e.cat_4].map((v, i) => (
                      <td key={i} className="py-2 pr-3 text-right text-gray-700">
                        {v ? `$${Number(v).toLocaleString("es-AR", { maximumFractionDigits: 0 })}` : "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {adicionales.length > 0 && (
            <div className="card overflow-x-auto">
              <p className="font-semibold text-gray-700 mb-3">Valores adicionales</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500 text-left">
                    <th className="pb-2 pr-4">Concepto</th>
                    <th className="pb-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {adicionales.map((a: any) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-gray-800">{a.concepto}</td>
                      <td className="py-2 text-right text-gray-700">
                        ${Number(a.valor).toLocaleString("es-AR", { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

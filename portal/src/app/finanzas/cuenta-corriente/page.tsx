import React from "react";
import { query } from "@/lib/db";
import { formatMoney, formatDate } from "@/lib/format";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import ManagePaymentsModal from "./ManagePaymentsModal";
import { CuentaCorrienteTableClient, CuentaCorrienteRow } from "./CuentaCorrienteTableClient";
import CobrosChartClient from "./CobrosChartClient";
import { Landmark } from "lucide-react";

async function getCuentaCorriente(consorcioCuit: string): Promise<CuentaCorrienteRow[]> {
  return query<CuentaCorrienteRow>(
    `SELECT
       u.id AS unidad_id,
       u.uf::text AS unidad_numero,
       NULLIF(TRIM(COALESCE(p.nombre,'') || ' ' || COALESCE(p.apellido,'')), '') AS propietario,
       COALESCE((SELECT SUM(total_pagar) FROM app.res_cuenta_periodo WHERE unidad_id=u.id), 0)::text            AS total_expensas,
       COALESCE((SELECT SUM(monto) FROM app.pagos WHERE unidad_id=u.id), 0)::text                               AS total_pagado,
       COALESCE((SELECT COUNT(*) FROM app.pagos WHERE unidad_id=u.id), 0)::int                                  AS total_pagado_count,
       COALESCE((SELECT SUM(total_pagar) FROM app.res_cuenta_periodo WHERE unidad_id=u.id AND estado='pendiente'), 0)::text AS saldo,
       (SELECT MAX(fecha)::text FROM app.pagos WHERE unidad_id=u.id)                                            AS ultimo_pago,
       (SELECT id FROM app.res_cuenta_periodo WHERE unidad_id=u.id AND estado='pendiente' ORDER BY id LIMIT 1)  AS expensa_pendiente_id,
       (SELECT total_pagar::text FROM app.res_cuenta_periodo WHERE unidad_id=u.id AND estado='pendiente' ORDER BY id LIMIT 1) AS expensa_pendiente_monto
     FROM app.unidades u
     LEFT JOIN app.ocupantes o ON o.unidad_id = u.id AND o.activo = true AND o.rol = 'propietario'
     LEFT JOIN app.personas  p ON p.id = o.persona_id
     WHERE u.consorcio_cuit = $1
     ORDER BY u.uf`,
    [consorcioCuit]
  );
}

async function getCobrosTrend(consorcioCuit: string) {
  const rows = await query<{ mes: string; cobrado: string; periodo_mes: string }>(
    `SELECT
       to_char(fecha, 'YYYY-MM') AS periodo_mes,
       to_char(fecha, 'MM/YYYY') AS mes,
       SUM(monto)::numeric AS cobrado
     FROM app.pagos p
     JOIN app.unidades u ON u.id = p.unidad_id
     WHERE u.consorcio_cuit = $1
     GROUP BY to_char(fecha, 'YYYY-MM'), to_char(fecha, 'MM/YYYY')
     ORDER BY periodo_mes DESC
     LIMIT 5`,
    [consorcioCuit]
  );
  return rows.reverse().map(r => ({
    mes: r.mes,
    cobrado: Number(r.cobrado)
  }));
}

export default async function CuentaCorrientePage({
  searchParams,
}: {
  searchParams: Promise<{
    pago?: string;
    consorcio?: string;
    ver_historial?: string;
    ver_pagos?: string;
  }>;
}) {
  const sp = await searchParams;

  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  const [consorcios, rows, cobrosTrend] = await Promise.all([
    query<{ cuit: string; nombre: string }>(
      "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
    ),
    activeCuit ? getCuentaCorriente(activeCuit) : Promise.resolve([] as CuentaCorrienteRow[]),
    activeCuit ? getCobrosTrend(activeCuit) : Promise.resolve([])
  ]);

  if (!activeCuit) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cuenta Corriente</h2>
        <ConsorcioRequerido consorcios={consorcios} seccion="la cuenta corriente" />
      </div>
    );
  }

  const selectedCuit = activeCuit;
  const selectedConsorcio = consorcios.find((c) => c.cuit === selectedCuit);

  const totalDeuda = rows.reduce((s, r) => s + Number(r.saldo), 0);
  const totalPagado = rows.reduce((s, r) => s + Number(r.total_pagado), 0);
  const unidadesDeudoras = rows.filter((r) => Number(r.saldo) > 0).length;

  // Query details if modals are active
  let historyUnitDetails: { uf: string; propietario: string }[] = [];
  let liquidaciones: { id: number; anio: number; mes: number; total_pagar: string; estado: string; fecha_pago: string | null }[] = [];
  let pagos: { id: number; fecha: string; monto: string; medio_pago: string; referencia: string | null; notas: string | null }[] = [];

  if (sp.ver_historial) {
    const historyUnidadId = Number(sp.ver_historial);
    const [unitRes, liqsRes, pagosRes] = await Promise.all([
      query<{ uf: string; propietario: string }>(
        `SELECT u.uf::text, NULLIF(TRIM(COALESCE(p.nombre,'') || ' ' || COALESCE(p.apellido,'')), '') AS propietario
         FROM app.unidades u
         LEFT JOIN app.ocupantes o ON o.unidad_id = u.id AND o.activo = true AND o.rol = 'propietario'
         LEFT JOIN app.personas p ON p.id = o.persona_id
         WHERE u.id = $1`,
        [historyUnidadId]
      ),
      query<{ id: number; anio: number; mes: number; total_pagar: string; estado: string; fecha_pago: string | null }>(
        `SELECT rcp.id, pe.anio, pe.mes, rcp.total_pagar::text, rcp.estado, rcp.fecha_pago::text
         FROM app.res_cuenta_periodo rcp
         JOIN app.periodos_expensas pe ON rcp.periodo_id = pe.id
         WHERE rcp.unidad_id = $1
         ORDER BY pe.anio DESC, pe.mes DESC`,
        [historyUnidadId]
      ),
      query<{ id: number; fecha: string; monto: string; medio_pago: string; referencia: string | null; notas: string | null }>(
        `SELECT id, fecha::text, monto::text, medio_pago, referencia, notas
         FROM app.pagos
         WHERE unidad_id = $1
         ORDER BY fecha DESC, id DESC`,
        [historyUnidadId]
      ),
    ]);
    historyUnitDetails = unitRes;
    liquidaciones = liqsRes;
    pagos = pagosRes;
  }

  let pagosUnitDetails: { uf: string; propietario: string }[] = [];
  let pagosList: { id: number; fecha: string; monto: string; medio_pago: string; referencia: string | null; notas: string | null }[] = [];

  if (sp.ver_pagos) {
    const pagosUnidadId = Number(sp.ver_pagos);
    const [unitRes, pagosRes] = await Promise.all([
      query<{ uf: string; propietario: string }>(
        `SELECT u.uf::text, NULLIF(TRIM(COALESCE(p.nombre,'') || ' ' || COALESCE(p.apellido,'')), '') AS propietario
         FROM app.unidades u
         LEFT JOIN app.ocupantes o ON o.unidad_id = u.id AND o.activo = true AND o.rol = 'propietario'
         LEFT JOIN app.personas p ON p.id = o.persona_id
         WHERE u.id = $1`,
        [pagosUnidadId]
      ),
      query<{ id: number; fecha: string; monto: string; medio_pago: string; referencia: string | null; notas: string | null }>(
        `SELECT id, fecha::text, monto::text, medio_pago, referencia, notas
         FROM app.pagos
         WHERE unidad_id = $1
         ORDER BY fecha DESC, id DESC`,
        [pagosUnidadId]
      ),
    ]);
    pagosUnitDetails = unitRes;
    pagosList = pagosRes;
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cuenta Corriente</h2>
        <p className="text-gray-500 text-sm mt-1">
          Saldo por unidad · pagos registrados — <strong>{selectedConsorcio?.nombre}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Izquierdo (2/3 de ancho) - Grilla y Totales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary cards */}
          {selectedCuit && (
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Deuda total</p>
                <p className="text-xl font-bold text-red-600">{formatMoney(totalDeuda)}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Cobrado histórico</p>
                <p className="text-xl font-bold text-green-600">{formatMoney(totalPagado)}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Unidades con deuda</p>
                <p className="text-xl font-bold text-gray-800">{unidadesDeudoras} / {rows.length}</p>
              </div>
            </div>
          )}

          {/* Grilla principal */}
          {rows.length > 0 ? (
            <div className="card overflow-hidden">
              <CuentaCorrienteTableClient consorcioCuit={selectedCuit} data={rows} />
            </div>
          ) : (
            selectedCuit && (
              <div className="card p-12 text-center text-gray-400">
                <p className="text-3xl mb-2">📊</p>
                <p>No hay unidades en este consorcio aún.</p>
              </div>
            )
          )}
        </div>

        {/* Lado Derecho (1/3 de ancho) - Gráfico de cobranza */}
        <div className="lg:col-span-1 space-y-6">
          {selectedCuit && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Landmark className="w-5 h-5 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Histórico de Cobranzas</h3>
              </div>
              <CobrosChartClient data={cobrosTrend} />
            </div>
          )}
        </div>
      </div>

      {/* Modal Historial (6A) */}
      {sp.ver_historial && historyUnitDetails.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <a
            href={`?consorcio=${selectedCuit}`}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          ></a>
          
          <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Historial de Cuenta Corriente</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Unidad {historyUnitDetails[0].uf} · Propietario: {historyUnitDetails[0].propietario ?? "—"}
                </p>
              </div>
              <a
                href={`?consorcio=${selectedCuit}`}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </a>
            </div>

            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col min-h-0">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📋</span> Liquidaciones Mensuales
                </h4>
                <div className="overflow-x-auto flex-1 max-h-[50vh]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Período</th>
                        <th className="py-2 px-3 text-right">Total a pagar</th>
                        <th className="py-2 px-3 text-center">Estado</th>
                        <th className="py-2 px-3 text-center">Fecha Pago</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {liquidaciones.map((l) => (
                        <tr key={l.id} className="hover:bg-gray-50/50">
                          <td className="py-2 px-3 font-medium">
                            {String(l.mes).padStart(2, "0")}/{l.anio}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            {formatMoney(l.total_pagar)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              l.estado === 'pagada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {l.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center text-gray-500">
                            {l.fecha_pago ? formatDate(l.fecha_pago) : '—'}
                          </td>
                        </tr>
                      ))}
                      {liquidaciones.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-400">
                            No hay liquidaciones registradas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col min-h-0">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>💰</span> Pagos Realizados
                </h4>
                <div className="overflow-x-auto flex-1 max-h-[50vh]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Fecha</th>
                        <th className="py-2 px-3 text-right">Monto</th>
                        <th className="py-2 px-3">Medio / Ref</th>
                        <th className="py-2 px-3">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pagos.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/50">
                          <td className="py-2 px-3 text-gray-600">{formatDate(p.fecha)}</td>
                          <td className="py-2 px-3 text-right font-mono text-green-700 font-semibold">
                            {formatMoney(p.monto)}
                          </td>
                          <td className="py-2 px-3">
                            <p className="font-medium capitalize">{p.medio_pago.replace("_", " ")}</p>
                            {p.referencia && <p className="text-[10px] text-gray-400 font-mono">{p.referencia}</p>}
                          </td>
                          <td className="py-2 px-3 text-gray-500 italic max-w-[120px] truncate" title={p.notas || ""}>
                            {p.notas || "—"}
                          </td>
                        </tr>
                      ))}
                      {pagos.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-400">
                            No hay pagos registrados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <a href={`?consorcio=${selectedCuit}`} className="btn-secondary">
                Cerrar
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gestionar Pagos (6B) */}
      {sp.ver_pagos && pagosUnitDetails.length > 0 && (
        <ManagePaymentsModal
          consorcioCuit={selectedCuit}
          unidadId={Number(sp.ver_pagos)}
          uf={pagosUnitDetails[0].uf}
          propietario={pagosUnitDetails[0].propietario ?? ""}
          pagos={pagosList}
        />
      )}
    </div>
  );
}

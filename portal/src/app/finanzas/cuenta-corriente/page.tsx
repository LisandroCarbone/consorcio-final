import React from "react";
import { query } from "@/lib/db";
import { formatMoney, formatDate } from "@/lib/format";
import { registrarPago } from "../actions";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import ManagePaymentsModal from "./ManagePaymentsModal";

type Row = {
  unidad_id: number;
  unidad_numero: string;
  propietario: string | null;
  total_expensas: string;
  total_pagado: string;
  total_pagado_count: number;
  saldo: string;
  ultimo_pago: string | null;
  expensa_pendiente_id: number | null;
  expensa_pendiente_monto: string | null;
  [key: string]: unknown;
};

async function getCuentaCorriente(consorcioCuit: string): Promise<Row[]> {
  return query<Row>(
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

export default async function CuentaCorrientePage({
  searchParams,
}: {
  searchParams: Promise<{
    pago?: string;
    consorcio?: string;
    ver_historial?: string;
    ver_pagos?: string;
    sort?: string;
    dir?: string;
  }>;
}) {
  const sp = await searchParams;
  const sortCol = sp.sort || "";
  const sortDir = sp.dir === "desc" ? "desc" : "asc";

  const consorcios = await query<{ cuit: string; nombre: string }>(
    "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
  );

  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

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
  const rows = await getCuentaCorriente(selectedCuit);
  const pagoUnidadId = sp.pago ? Number(sp.pago) : null;

  const totalDeuda = rows.reduce((s, r) => s + Number(r.saldo), 0);
  const totalPagado = rows.reduce((s, r) => s + Number(r.total_pagado), 0);
  const unidadesDeudoras = rows.filter((r) => Number(r.saldo) > 0).length;

  // Apply sorting in memory
  const sortedRows = [...rows];
  if (sortCol === "unidad") {
    sortedRows.sort((a, b) => {
      const valA = a.unidad_numero || "";
      const valB = b.unidad_numero || "";
      return sortDir === "asc"
        ? valA.localeCompare(valB, undefined, { numeric: true })
        : valB.localeCompare(valA, undefined, { numeric: true });
    });
  } else if (sortCol === "propietario") {
    sortedRows.sort((a, b) => {
      const valA = a.propietario || "";
      const valB = b.propietario || "";
      return sortDir === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }

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

      {/* Summary cards */}
      {selectedCuit && (
        <div className="grid grid-cols-3 gap-4 mb-6">
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

      {/* Table */}
      {sortedRows.length > 0 && (
        <div className="card overflow-hidden w-full">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="th">
                  <a
                    href={`?consorcio=${selectedCuit}&sort=unidad&dir=${sortCol === "unidad" && sortDir === "asc" ? "desc" : "asc"}`}
                    className="hover:text-brand-600 transition-colors inline-flex items-center gap-1 font-semibold text-gray-700 select-none"
                  >
                    Unidad {sortCol === "unidad" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                  </a>
                </th>
                <th className="th">
                  <a
                    href={`?consorcio=${selectedCuit}&sort=propietario&dir=${sortCol === "propietario" && sortDir === "asc" ? "desc" : "asc"}`}
                    className="hover:text-brand-600 transition-colors inline-flex items-center gap-1 font-semibold text-gray-700 select-none"
                  >
                    Propietario {sortCol === "propietario" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                  </a>
                </th>
                <th className="th text-right">Expensas emitidas</th>
                <th className="th text-right">Pagado</th>
                <th className="th text-right">Saldo</th>
                <th className="th text-center">Último pago</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r) => {
                const deuda = Number(r.saldo);
                const isOpen = pagoUnidadId === r.unidad_id;
                return (
                  <React.Fragment key={r.unidad_id}>
                    <tr className={`border-b border-gray-50 ${deuda > 0 ? "bg-red-50/30" : ""}`}>
                      <td className="td font-semibold">{r.unidad_numero}</td>
                      <td className="td text-gray-600">{r.propietario ?? "—"}</td>
                      <td className="td text-right font-mono">{formatMoney(r.total_expensas)}</td>
                      <td className="td text-right font-mono text-green-700">{formatMoney(r.total_pagado)}</td>
                      <td className="td text-right font-mono font-bold">
                        {deuda > 0 ? (
                          <span className="text-red-600">- {formatMoney(deuda)}</span>
                        ) : (
                          <span className="text-green-600">Al día</span>
                        )}
                      </td>
                      <td className="td text-center text-xs">
                        {deuda > 0 && Number(r.total_pagado) > 0 && (
                          <span className="badge bg-orange-100 text-orange-700">Pago Parcial</span>
                        )}
                        {deuda === 0 && Number(r.total_pagado) > 0 && (
                          <span className="badge bg-green-100 text-green-700">Al día</span>
                        )}
                        {r.ultimo_pago && (
                          <p className="text-gray-400 mt-0.5">{formatDate(r.ultimo_pago)}</p>
                        )}
                      </td>
                      <td className="td">
                        <div className="flex flex-col gap-1 items-end">
                          <a
                            href={`?consorcio=${selectedCuit}&pago=${isOpen ? "" : r.unidad_id}`}
                            className="text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline whitespace-nowrap"
                          >
                            {isOpen ? "Cerrar" : "Registrar pago"}
                          </a>
                          <a
                            href={`?consorcio=${selectedCuit}&ver_historial=${r.unidad_id}`}
                            className="text-xs text-gray-500 hover:text-gray-900 hover:underline whitespace-nowrap"
                          >
                            Ver Historial
                          </a>
                          {r.total_pagado_count > 0 && (
                            <a
                              href={`?consorcio=${selectedCuit}&ver_pagos=${r.unidad_id}`}
                              className="text-xs text-amber-600 hover:text-amber-800 hover:underline whitespace-nowrap font-medium"
                            >
                              Gestionar pagos ({r.total_pagado_count})
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`form-${r.unidad_id}`} className="bg-blue-50 border-b border-blue-100">
                        <td colSpan={7} className="px-5 py-4">
                          <form action={registrarPago} className="grid grid-cols-2 gap-3 max-w-lg">
                            <input type="hidden" name="consorcio_id" value={selectedCuit} />
                            <input type="hidden" name="unidad_id" value={r.unidad_id} />
                            {r.expensa_pendiente_id && (
                              <input type="hidden" name="expensa_id" value={r.expensa_pendiente_id} />
                            )}
                            <div>
                              <label className="label">Fecha *</label>
                              <input
                                name="fecha"
                                type="date"
                                defaultValue={new Date().toISOString().slice(0, 10)}
                                required
                                className="input"
                              />
                            </div>
                            <div>
                              <label className="label">Monto *</label>
                              <input
                                name="monto"
                                type="number"
                                step="0.01"
                                min="0.01"
                                defaultValue={r.expensa_pendiente_monto ?? ""}
                                required
                                className="input"
                              />
                            </div>
                            <div>
                              <label className="label">Medio de pago *</label>
                              <select name="medio_pago" className="input">
                                <option value="transferencia">Transferencia</option>
                                <option value="deposito">Depósito</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="debito_automatico">Débito automático</option>
                                <option value="cheque">Cheque</option>
                                <option value="otro">Otro</option>
                              </select>
                            </div>
                            <div>
                              <label className="label">Referencia / Nro. operación</label>
                              <input name="referencia" type="text" placeholder="Ej: TRF-20240601-123" className="input" />
                            </div>
                            <div className="col-span-2">
                              <label className="label">Notas</label>
                              <input name="notes" type="text" className="input" />
                            </div>
                            <div className="col-span-2 flex gap-2">
                              <button type="submit" className="btn-primary">Registrar pago</button>
                              <a href={`?consorcio=${selectedCuit}`} className="btn-secondary">Cancelar</a>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rows.length === 0 && selectedCuit && (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">📊</p>
          <p>No hay unidades en este consorcio aún.</p>
        </div>
      )}

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

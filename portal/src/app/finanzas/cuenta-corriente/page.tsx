import React from "react";
import { query } from "@/lib/db";
import { formatMoney, formatDate } from "@/lib/format";
import { registrarPago } from "../actions";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";

type Row = {
  unidad_id: number;
  unidad_numero: string;
  propietario: string | null;
  total_expensas: string;
  total_pagado: string;
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
  searchParams: Promise<{ pago?: string }>;
}) {
  const sp = await searchParams;
  const consorcios = await query<{ cuit: string; nombre: string }>(
    "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
  );

  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  if (!activeCuit) {
    return (
      <div className="max-w-5xl">
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

  return (
    <div className="max-w-5xl">
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
      {rows.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="th">Unidad</th>
                <th className="th">Propietario</th>
                <th className="th text-right">Expensas emitidas</th>
                <th className="th text-right">Pagado</th>
                <th className="th text-right">Saldo</th>
                <th className="th text-center">Último pago</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
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
                        <span className={deuda > 0 ? "text-red-600" : "text-green-600"}>
                          {deuda > 0 ? `- ${formatMoney(deuda)}` : "Al día"}
                        </span>
                      </td>
                      <td className="td text-center text-xs text-gray-500">
                        {r.ultimo_pago ? formatDate(r.ultimo_pago) : "—"}
                      </td>
                      <td className="td">
                        <a
                          href={`?consorcio=${selectedCuit}&pago=${isOpen ? "" : r.unidad_id}`}
                          className="text-xs text-brand-600 hover:underline whitespace-nowrap"
                        >
                          {isOpen ? "Cerrar" : "Registrar pago"}
                        </a>
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
                              <input name="notas" type="text" className="input" />
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
    </div>
  );
}

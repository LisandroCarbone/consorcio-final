"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { agregarParametroCCT, eliminarParametroCCT, agregarParametroART, eliminarParametroART } from "./actions";

export type ParametroCCTRow = {
  id: number;
  fecha_desde: string;
  detraccion_fija_mensual: string;
  detraccion_fija_empleador: string;
  pct_suterh: string;
  pct_fateryh: string;
  pct_seracarh: string;
  sv_costo_fijo: string;
  pct_aportes_ss: string;
  pct_aportes_os: string;
  pct_contrib_os: string;
  pct_contrib_ss: string;
  pct_contrib_anssal: string;
  fateryh_art19bis: string;
  [key: string]: unknown;
};

export type ARTRow = {
  id: number;
  fecha_desde: string;
  art_pct_variable: string;
  art_costo_fijo: string;
  [key: string]: unknown;
};

function formatPct(value: string | number): string {
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function decToHuman(value: string | number): string {
  return (Number(value) * 100).toFixed(2);
}

type Props = {
  params: ParametroCCTRow[];
  artParams: ARTRow[];
  consorcioCuit: string;
  consorcioNombre: string;
};

export function ParametrosCCTClient({ params, artParams, consorcioCuit, consorcioNombre }: Props) {
  const [editing, setEditing] = useState<ParametroCCTRow | null>(null);
  const [editingART, setEditingART] = useState<ARTRow | null>(null);

  const formDefaults = editing
    ? {
        fecha_desde: editing.fecha_desde,
        detraccion_fija_mensual: Number(editing.detraccion_fija_mensual).toString(),
        detraccion_fija_empleador: Number(editing.detraccion_fija_empleador).toString(),
        pct_suterh: decToHuman(editing.pct_suterh),
        pct_fateryh: decToHuman(editing.pct_fateryh),
        pct_seracarh: decToHuman(editing.pct_seracarh),
        sv_costo_fijo: Number(editing.sv_costo_fijo).toString(),
        pct_aportes_ss: decToHuman(editing.pct_aportes_ss),
        pct_aportes_os: decToHuman(editing.pct_aportes_os),
        pct_contrib_os: decToHuman(editing.pct_contrib_os),
        pct_contrib_ss: decToHuman(editing.pct_contrib_ss),
        pct_contrib_anssal: decToHuman(editing.pct_contrib_anssal),
        fateryh_art19bis: Number(editing.fateryh_art19bis).toString(),
      }
    : null;

  const artDefaults = editingART
    ? {
        fecha_desde: editingART.fecha_desde,
        art_pct_variable: decToHuman(editingART.art_pct_variable),
        art_costo_fijo: Number(editingART.art_costo_fijo).toString(),
      }
    : null;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historial CCT */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Historial de parámetros CCT</h3>
          </div>
          {params.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">Sin registros</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="th">Vigente desde</th>
                    <th className="th text-right">Detracción</th>
                    <th className="th text-right">SUTERH</th>
                    <th className="th text-right">FATERYH</th>
                    <th className="th text-right">SERACARH</th>
                    <th className="th text-right">SCVO</th>
                    <th className="th text-right">Ap. SS</th>
                    <th className="th text-right">Ap. OS</th>
                    <th className="th text-right">Con. OS</th>
                    <th className="th text-right">Con. SS</th>
                    <th className="th text-right">Con. ANSSAL</th>
                    <th className="th" />
                  </tr>
                </thead>
                <tbody>
                  {params.map((p, i) => (
                    <tr
                      key={p.id}
                      className={`group table-row hover:bg-gray-50 ${
                        i === 0 ? "font-semibold" : "text-gray-500"
                      } ${editing?.id === p.id ? "bg-brand-50/30" : ""}`}
                    >
                      <td className="td text-sm whitespace-nowrap">
                        {p.fecha_desde}
                        {i === 0 && <span className="ml-2 badge bg-green-100 text-green-700 text-[10px]">actual</span>}
                      </td>
                      <td className="td text-right font-mono text-xs">{formatMoney(p.detraccion_fija_mensual)}</td>
                      <td className="td text-right font-mono text-xs">{formatPct(p.pct_suterh)}</td>
                      <td className="td text-right font-mono text-xs">{formatPct(p.pct_fateryh)}</td>
                      <td className="td text-right font-mono text-xs">{formatPct(p.pct_seracarh)}</td>
                      <td className="td text-right font-mono text-xs">{formatMoney(p.sv_costo_fijo)}</td>
                      <td className="td text-right font-mono text-xs">{formatPct(p.pct_aportes_ss)}</td>
                      <td className="td text-right font-mono text-xs">{formatPct(p.pct_aportes_os)}</td>
                      <td className="td text-right font-mono text-xs">{formatPct(p.pct_contrib_os)}</td>
                      <td className="td text-right font-mono text-xs">{formatPct(p.pct_contrib_ss)}</td>
                      <td className="td text-right font-mono text-xs">{formatPct(p.pct_contrib_anssal)}</td>
                      <td className="td text-right whitespace-nowrap">
                        <div className="flex gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditing(editing?.id === p.id ? null : p)}
                            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          {params.length > 1 && i === 0 && (
                            <form action={eliminarParametroCCT.bind(null, p.id)}>
                              <button
                                type="submit"
                                className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                                title="Eliminar"
                              >
                                🗑️
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

        {/* Formulario CCT */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {editing ? `Editando registro ${editing.fecha_desde}` : "Nuevo registro"}
            </h3>
            {editing && (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕ Cancelar edición
              </button>
            )}
          </div>
          <form key={editing?.id ?? "new"} action={agregarParametroCCT} className="space-y-5">
            <div>
              <label className="label">Vigente desde *</label>
              <input
                name="fecha_desde"
                type="date"
                required
                className="input"
                defaultValue={formDefaults?.fecha_desde ?? new Date().toISOString().slice(0, 10)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Los períodos anteriores a esta fecha siguen usando el valor anterior.
              </p>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Detracción F.931</legend>
              <div>
                <label className="label">Detracción mensual (encargado jornada completa) *</label>
                <input
                  name="detraccion_fija_mensual"
                  type="number"
                  step="0.01"
                  required
                  placeholder="12003.68"
                  className="input"
                  defaultValue={formDefaults?.detraccion_fija_mensual}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Fuente: Resolución General AFIP. Media jornada y suplentes se calculan automáticamente.
                </p>
              </div>
              <div>
                <label className="label">Detracción fija empleador (contribuciones) *</label>
                <input
                  name="detraccion_fija_empleador"
                  type="number"
                  step="0.01"
                  required
                  placeholder="1800"
                  className="input"
                  defaultValue={formDefaults?.detraccion_fija_empleador}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Se resta una vez del total F.931 por empleador, no por empleado.
                </p>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sindicales</legend>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label">SUTERH %</label>
                  <input name="pct_suterh" type="number" step="0.01" required placeholder="4.50" className="input"
                    defaultValue={formDefaults?.pct_suterh} />
                </div>
                <div>
                  <label className="label">FATERYH %</label>
                  <input name="pct_fateryh" type="number" step="0.01" required placeholder="6.50" className="input"
                    defaultValue={formDefaults?.pct_fateryh} />
                </div>
                <div>
                  <label className="label">SERACARH %</label>
                  <input name="pct_seracarh" type="number" step="0.01" required placeholder="0.50" className="input"
                    defaultValue={formDefaults?.pct_seracarh} />
                </div>
              </div>
              <div>
                <label className="label">FATERYH Art.19bis (monto fijo mensual)</label>
                <input name="fateryh_art19bis" type="number" step="0.01" required placeholder="48424" className="input"
                  defaultValue={formDefaults?.fateryh_art19bis} />
                <p className="text-xs text-gray-400 mt-1">
                  Aporte fijo mensual por empleado permanente. Se suma al FATERYH % variable.
                </p>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Seguro</legend>
              <div>
                <label className="label">SCVO costo fijo *</label>
                <input name="sv_costo_fijo" type="number" step="0.01" required placeholder="430.62" className="input"
                  defaultValue={formDefaults?.sv_costo_fijo} />
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">AFIP F.931 alícuotas</legend>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Aportes SS %</label>
                  <input name="pct_aportes_ss" type="number" step="0.01" required placeholder="14.45" className="input"
                    defaultValue={formDefaults?.pct_aportes_ss} />
                </div>
                <div>
                  <label className="label">Aportes OS %</label>
                  <input name="pct_aportes_os" type="number" step="0.01" required placeholder="2.55" className="input"
                    defaultValue={formDefaults?.pct_aportes_os} />
                </div>
                <div>
                  <label className="label">Contrib. OS %</label>
                  <input name="pct_contrib_os" type="number" step="0.01" required placeholder="5.10" className="input"
                    defaultValue={formDefaults?.pct_contrib_os} />
                </div>
                <div>
                  <label className="label">Contrib. SS %</label>
                  <input name="pct_contrib_ss" type="number" step="0.01" required placeholder="18.00" className="input"
                    defaultValue={formDefaults?.pct_contrib_ss} />
                </div>
                <div>
                  <label className="label">Contrib. ANSSAL %</label>
                  <input name="pct_contrib_anssal" type="number" step="0.01" required placeholder="0.90" className="input"
                    defaultValue={formDefaults?.pct_contrib_anssal} />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Ingresá los porcentajes en formato humano (ej. 4.5 significa 4.50%).
              </p>
            </fieldset>

            <button type="submit" className="btn-primary w-full justify-center">
              {editing ? "Guardar cambios" : "Guardar"}
            </button>
          </form>
        </div>
      </div>

      {/* ART por consorcio */}
      <div className="mt-8">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">ART por consorcio</h3>
          {consorcioCuit ? (
            <p className="text-sm text-gray-500 mt-1">
              Póliza ART de <span className="font-semibold text-gray-700">{consorcioNombre}</span>.
              Cambiá el consorcio activo desde el selector global para ver otro.
            </p>
          ) : (
            <p className="text-sm text-amber-600 mt-1">
              Seleccioná un consorcio desde el selector global para ver y editar sus parámetros ART.
            </p>
          )}
        </div>

        {consorcioCuit && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Historial ART */}
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Historial ART — {consorcioNombre}</h3>
              </div>
              {artParams.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">Sin registros ART para este consorcio</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="th">Vigente desde</th>
                        <th className="th text-right">ART % variable</th>
                        <th className="th text-right">ART costo fijo</th>
                        <th className="th" />
                      </tr>
                    </thead>
                    <tbody>
                      {artParams.map((a, i) => (
                        <tr
                          key={a.id}
                          className={`group table-row hover:bg-gray-50 ${
                            i === 0 ? "font-semibold" : "text-gray-500"
                          } ${editingART?.id === a.id ? "bg-brand-50/30" : ""}`}
                        >
                          <td className="td text-sm whitespace-nowrap">
                            {a.fecha_desde}
                            {i === 0 && <span className="ml-2 badge bg-green-100 text-green-700 text-[10px]">actual</span>}
                          </td>
                          <td className="td text-right font-mono text-xs">{formatPct(a.art_pct_variable)}</td>
                          <td className="td text-right font-mono text-xs">{formatMoney(a.art_costo_fijo)}</td>
                          <td className="td text-right whitespace-nowrap">
                            <div className="flex gap-1 justify-end">
                              <button
                                type="button"
                                onClick={() => setEditingART(editingART?.id === a.id ? null : a)}
                                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              {artParams.length > 1 && i === 0 && (
                                <form action={eliminarParametroART.bind(null, a.id)}>
                                  <button
                                    type="submit"
                                    className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Eliminar"
                                  >
                                    🗑️
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

            {/* Formulario ART */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  {editingART ? `Editando ART ${editingART.fecha_desde}` : "Nuevo registro ART"}
                </h3>
                {editingART && (
                  <button
                    type="button"
                    onClick={() => setEditingART(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕ Cancelar edición
                  </button>
                )}
              </div>
              <form key={`art-${editingART?.id ?? "new"}`} action={agregarParametroART} className="space-y-4">
                <input type="hidden" name="consorcio_cuit" value={consorcioCuit} />
                <div>
                  <label className="label">Vigente desde *</label>
                  <input
                    name="fecha_desde"
                    type="date"
                    required
                    className="input"
                    defaultValue={artDefaults?.fecha_desde ?? new Date().toISOString().slice(0, 10)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">ART % variable *</label>
                    <div className="relative">
                      <input
                        name="art_pct_variable"
                        type="number"
                        step="0.0001"
                        min="0"
                        max="100"
                        required
                        className="input pr-8"
                        placeholder="7.40"
                        defaultValue={artDefaults?.art_pct_variable}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="label">ART costo fijo (por empleado)</label>
                    <div className="relative">
                      <input
                        name="art_costo_fijo"
                        type="number"
                        step="0.01"
                        min="0"
                        className="input pl-6"
                        placeholder="0"
                        defaultValue={artDefaults?.art_costo_fijo}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Cuota fija mensual por trabajador</p>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full justify-center">
                  {editingART ? "Guardar cambios" : "Guardar"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

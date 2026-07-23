"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import MaskedInput from "@/components/ui/MaskedInput";
import { agregarParametroCCT, eliminarParametroCCT, agregarParametroART, eliminarParametroART, guardarSCVORenovacion } from "./actions";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

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
  scvoRenovacionMes: number | null;
  scvoRenovacionMonto: string;
};

export function ParametrosCCTClient({
  params,
  artParams,
  consorcioCuit,
  consorcioNombre,
  scvoRenovacionMes,
  scvoRenovacionMonto,
}: Props) {
  const [editing, setEditing] = useState<ParametroCCTRow | null>(null);
  const [editingART, setEditingART] = useState<ARTRow | null>(null);

  const source = editing ?? params[0] ?? null;
  const formDefaults = source
    ? {
        fecha_desde: editing ? editing.fecha_desde : new Date().toISOString().slice(0, 10),
        detraccion_fija_mensual: Number(source.detraccion_fija_mensual).toString(),
        detraccion_fija_empleador: Number(source.detraccion_fija_empleador).toString(),
        pct_suterh: decToHuman(source.pct_suterh),
        pct_fateryh: decToHuman(source.pct_fateryh),
        pct_seracarh: decToHuman(source.pct_seracarh),
        sv_costo_fijo: Number(source.sv_costo_fijo).toString(),
        pct_aportes_ss: decToHuman(source.pct_aportes_ss),
        pct_aportes_os: decToHuman(source.pct_aportes_os),
        pct_contrib_os: decToHuman(source.pct_contrib_os),
        pct_contrib_ss: decToHuman(source.pct_contrib_ss),
        pct_contrib_anssal: decToHuman(source.pct_contrib_anssal),
        fateryh_art19bis: Number(source.fateryh_art19bis).toString(),
      }
    : null;

  const artSource = editingART ?? artParams[0] ?? null;
  const artDefaults = artSource
    ? {
        fecha_desde: editingART ? editingART.fecha_desde : new Date().toISOString().slice(0, 10),
        art_pct_variable: decToHuman(artSource.art_pct_variable),
        art_costo_fijo: Number(artSource.art_costo_fijo).toString(),
      }
    : null;

  return (
    <>
      <div className="flex gap-6 items-start">
        {/* Historial CCT */}
        <div className="card flex-1 min-w-0">
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
                    <th className="th text-right">Detr. Empl.</th>
                    <th className="th text-right">Art.19bis</th>
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
                      <td className="td text-right font-mono text-xs">{formatMoney(p.detraccion_fija_empleador)}</td>
                      <td className="td text-right font-mono text-xs">{formatMoney(p.fateryh_art19bis)}</td>
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
        <div className="card p-4 w-72 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              {editing ? `Editando ${editing.fecha_desde}` : "Nuevo registro"}
            </h3>
            {editing && (
              <button type="button" onClick={() => setEditing(null)}
                className="text-xs text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>
          <form
            key={editing?.id ?? "new"}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              agregarParametroCCT(fd).then(() => window.location.reload());
            }}
            className="space-y-3"
          >
            <div>
              <label className="label">Vigente desde *</label>
              <input name="fecha_desde" type="date" required className="input text-sm"
                defaultValue={formDefaults?.fecha_desde ?? new Date().toISOString().slice(0, 10)} />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Detracción F.931</legend>
              <div>
                <label className="label">Mensual (jornada completa)</label>
                <MaskedInput preset="money" name="detraccion_fija_mensual" required
                  placeholder="7003.68" className="input text-sm" defaultValue={formDefaults?.detraccion_fija_mensual} />
              </div>
              <div>
                <label className="label">Fija empleador</label>
                <MaskedInput preset="money" name="detraccion_fija_empleador" required
                  placeholder="1800" className="input text-sm" defaultValue={formDefaults?.detraccion_fija_empleador} />
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sindicales</legend>
              <div className="grid grid-cols-3 gap-1">
                <div>
                  <label className="label">SUT %</label>
                  <MaskedInput preset="percentage" name="pct_suterh" required placeholder="4.50"
                    className="input text-sm" defaultValue={formDefaults?.pct_suterh} />
                </div>
                <div>
                  <label className="label">FAT %</label>
                  <MaskedInput preset="percentage" name="pct_fateryh" required placeholder="6.50"
                    className="input text-sm" defaultValue={formDefaults?.pct_fateryh} />
                </div>
                <div>
                  <label className="label">SER %</label>
                  <MaskedInput preset="percentage" name="pct_seracarh" required placeholder="0.50"
                    className="input text-sm" defaultValue={formDefaults?.pct_seracarh} />
                </div>
              </div>
              <div>
                <label className="label">Art.19bis (fijo mensual)</label>
                <MaskedInput preset="money" name="fateryh_art19bis" required placeholder="145272"
                  className="input text-sm" defaultValue={formDefaults?.fateryh_art19bis} />
                <p className="text-[10px] text-gray-400 mt-0.5">Por empleado permanente. ×1.5 en SAC.</p>
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SCVO</legend>
              <MaskedInput preset="money" name="sv_costo_fijo" required placeholder="424.62"
                className="input text-sm" defaultValue={formDefaults?.sv_costo_fijo} />
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">AFIP F.931</legend>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="label">Ap. SS %</label>
                  <MaskedInput preset="percentage" name="pct_aportes_ss" required placeholder="14.00"
                    className="input text-sm" defaultValue={formDefaults?.pct_aportes_ss} />
                </div>
                <div>
                  <label className="label">Ap. OS %</label>
                  <MaskedInput preset="percentage" name="pct_aportes_os" required placeholder="3.00"
                    className="input text-sm" defaultValue={formDefaults?.pct_aportes_os} />
                </div>
                <div>
                  <label className="label">C. OS %</label>
                  <MaskedInput preset="percentage" name="pct_contrib_os" required placeholder="5.10"
                    className="input text-sm" defaultValue={formDefaults?.pct_contrib_os} />
                </div>
                <div>
                  <label className="label">C. SS %</label>
                  <MaskedInput preset="percentage" name="pct_contrib_ss" required placeholder="18.00"
                    className="input text-sm" defaultValue={formDefaults?.pct_contrib_ss} />
                </div>
                <div>
                  <label className="label">ANSSAL %</label>
                  <MaskedInput preset="percentage" name="pct_contrib_anssal" required placeholder="0.90"
                    className="input text-sm" defaultValue={formDefaults?.pct_contrib_anssal} />
                </div>
              </div>
              <p className="text-[10px] text-gray-400">Formato humano (4.5 = 4.50%)</p>
            </fieldset>

            <button type="submit" className="btn-primary w-full justify-center text-sm">
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
              <form
                key={`art-${editingART?.id ?? "new"}`}
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  agregarParametroART(fd).then(() => window.location.reload());
                }}
                className="space-y-4"
              >
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
                      <MaskedInput
                        preset="percentage"
                        name="art_pct_variable"
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
                      <MaskedInput
                        preset="money"
                        name="art_costo_fijo"
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

      {/* SCVO Renovación anual */}
      <div className="mt-8">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">SCVO Renovación anual</h3>
          {consorcioCuit ? (
            <p className="text-sm text-gray-500 mt-1">
              Renovación anual del Seguro Colectivo de Vida Obligatorio de{" "}
              <span className="font-semibold text-gray-700">{consorcioNombre}</span>.
            </p>
          ) : (
            <p className="text-sm text-amber-600 mt-1">
              Seleccioná un consorcio desde el selector global para configurar su renovación de SCVO.
            </p>
          )}
        </div>

        {consorcioCuit && (
          <div className="card p-5 w-full lg:w-1/2">
            {scvoRenovacionMes && (
              <p className="text-xs text-gray-500 mb-3">
                Actual: renueva en <span className="font-semibold text-gray-700">{MESES[scvoRenovacionMes - 1]}</span> por{" "}
                <span className="font-semibold text-gray-700">{formatMoney(scvoRenovacionMonto)}</span>
              </p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                guardarSCVORenovacion(fd).then(() => window.location.reload());
              }}
              className="space-y-4"
            >
              <input type="hidden" name="consorcio_cuit" value={consorcioCuit} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Mes de renovación *</label>
                  <select
                    name="scvo_renovacion_mes"
                    required
                    className="input"
                    defaultValue={scvoRenovacionMes ?? ""}
                  >
                    <option value="" disabled>
                      Seleccioná un mes
                    </option>
                    {MESES.map((mes, i) => (
                      <option key={mes} value={i + 1}>
                        {mes}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Monto anual</label>
                  <MaskedInput
                    preset="money"
                    name="scvo_renovacion_monto"
                    className="input"
                    placeholder="0"
                    defaultValue={Number(scvoRenovacionMonto).toString()}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full justify-center">
                Guardar
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

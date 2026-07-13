import React from "react";
import { cookies } from "next/headers";
import { query, queryOne } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { ParametrosCCTClient, type ParametroCCTRow, type ARTRow } from "./ParametrosCCTClient";

type ParametroCCT = {
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
  created_at: string;
  [key: string]: unknown;
};

type ARTParam = {
  id: number;
  fecha_desde: string;
  art_pct_variable: string;
  art_costo_fijo: string;
  [key: string]: unknown;
};

function formatPct(value: string | number): string {
  return `${(Number(value) * 100).toFixed(2)}%`;
}

export default async function ParametrosCCTPage() {
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  const params = await query<ParametroCCT>(
    `SELECT id, fecha_desde::text, detraccion_fija_mensual::numeric, detraccion_fija_empleador::numeric,
            pct_suterh::numeric, pct_fateryh::numeric, pct_seracarh::numeric,
            sv_costo_fijo::numeric,
            pct_aportes_ss::numeric, pct_aportes_os::numeric,
            pct_contrib_os::numeric, pct_contrib_ss::numeric, pct_contrib_anssal::numeric,
            fateryh_art19bis::numeric,
            created_at::text
     FROM app.parametros_cct ORDER BY fecha_desde DESC`
  );

  let artParams: ARTParam[] = [];
  let consorcioNombre = "";
  if (activeCuit) {
    artParams = await query<ARTParam>(
      `SELECT id, fecha_desde::text, art_pct_variable::numeric, art_costo_fijo::numeric
       FROM app.parametros_art_consorcio
       WHERE consorcio_cuit = $1
       ORDER BY fecha_desde DESC`,
      [activeCuit]
    );
    const c = await queryOne<{ nombre: string }>(
      "SELECT nombre FROM app.consorcios WHERE cuit = $1",
      [activeCuit]
    );
    consorcioNombre = c?.nombre || activeCuit;
  }

  const vigente = params[0];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Parámetros</h2>
        <p className="text-sm text-gray-500 mt-1">
          Valores del Convenio Colectivo 589/10 y alícuotas AFIP que aplican a todos los consorcios.
          Actualizá cuando AFIP emita una nueva resolución.
        </p>
      </div>

      {/* Valor vigente */}
      {vigente && (
        <div className="card p-5 mb-6 border-l-4 border-brand-500">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">Vigente desde {vigente.fecha_desde}</p>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">{formatMoney(vigente.detraccion_fija_mensual)}</span>
            <span className="text-sm text-gray-500">Detracción F.931 mensual (encargado permanente jornada completa)</span>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            Media jornada: {formatMoney(Number(vigente.detraccion_fija_mensual) / 2)} · SAC (×1.5): {formatMoney(Number(vigente.detraccion_fija_mensual) * 1.5)}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Detracción fija empleador (contribuciones): {formatMoney(vigente.detraccion_fija_empleador)}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">SUTERH</p>
              <p className="font-semibold text-gray-800">{formatPct(vigente.pct_suterh)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">FATERYH</p>
              <p className="font-semibold text-gray-800">{formatPct(vigente.pct_fateryh)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">SERACARH</p>
              <p className="font-semibold text-gray-800">{formatPct(vigente.pct_seracarh)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">SCVO costo fijo</p>
              <p className="font-semibold text-gray-800">{formatMoney(vigente.sv_costo_fijo)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Aportes SS</p>
              <p className="font-semibold text-gray-800">{formatPct(vigente.pct_aportes_ss)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Aportes OS</p>
              <p className="font-semibold text-gray-800">{formatPct(vigente.pct_aportes_os)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Contrib. OS</p>
              <p className="font-semibold text-gray-800">{formatPct(vigente.pct_contrib_os)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Contrib. SS</p>
              <p className="font-semibold text-gray-800">{formatPct(vigente.pct_contrib_ss)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Contrib. ANSSAL</p>
              <p className="font-semibold text-gray-800">{formatPct(vigente.pct_contrib_anssal)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">FATERYH Art.19bis</p>
              <p className="font-semibold text-gray-800">{formatMoney(vigente.fateryh_art19bis)}</p>
            </div>
          </div>
        </div>
      )}

      <ParametrosCCTClient
        params={params as ParametroCCTRow[]}
        artParams={artParams as ARTRow[]}
        consorcioCuit={activeCuit}
        consorcioNombre={consorcioNombre}
      />
    </div>
  );
}

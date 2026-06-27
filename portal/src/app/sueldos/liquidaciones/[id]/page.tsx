export const dynamic = "force-dynamic";

import { getLiquidacionDetalle } from "../queries";
import { notFound } from "next/navigation";
import { PrintButton } from "./PrintButton";
import { numberToWords } from "@/lib/format";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmt0 = (n: number) =>
  n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;


// ─── SVG Pie chart ───────────────────────────────────────────────────────────

function PieChart({
  slices,
}: {
  slices: { label: string; value: number; color: string }[];
}) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  const cx = 70;
  const cy = 70;
  const r = 60;
  let startAngle = -Math.PI / 2;

  const paths: { d: string; color: string; label: string; pct: string; value: number }[] = [];

  for (const sl of slices) {
    const angle = (sl.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    paths.push({
      d: `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`,
      color: sl.color,
      label: sl.label,
      pct: ((sl.value / total) * 100).toFixed(1),
      value: sl.value,
    });
    startAngle = endAngle;
  }

  return (
    <div className="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140" className="flex-shrink-0">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth="1.5" />
        ))}
      </svg>
      <table className="text-xs w-full">
        <tbody>
          {paths.map((p, i) => (
            <tr key={i}>
              <td className="py-0.5 pr-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm mr-1.5 align-middle"
                  style={{ background: p.color }}
                />
                {p.label}
              </td>
              <td className="py-0.5 text-right font-medium pr-2">{p.pct}%</td>
              <td className="py-0.5 text-right text-gray-500">${fmt(p.value)}</td>
            </tr>
          ))}
          <tr className="border-t font-semibold">
            <td className="pt-1">Costo laboral total</td>
            <td />
            <td className="pt-1 text-right">${fmt(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ReciboPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const liq = await getLiquidacionDetalle(Number(id));
  if (!liq) notFound();

  const haberes = liq.conceptos.filter((c: any) => c.tipo === "haber");
  const descuentos = liq.conceptos.filter((c: any) => c.tipo === "descuento");

  const bruto = Number(liq.remuneracion_bruta);
  const totalDesc = Number(liq.total_descuentos_empleado);
  const neto = Number(liq.neto_a_pagar);

  // ── Non-remunerative concepts ──────────────────────────────────────────────
  const NO_REMUNERATIVOS = new Set(["Descuento Vivienda"]);

  // ── Unidad / Valor Unitario inference ─────────────────────────────────────
  function inferUnidadValor(
    concepto: string,
    importe: number,
    opts: { anios?: number } = {}
  ): { unidad: string; valorUnit: string } {
    const c = concepto.toLowerCase();
    const i = Number(importe);

    if (c.includes("retiro de residuos")) {
      // Unit price not available in recibo context — show total only
      return { unidad: "—", valorUnit: fmt(i) };
    }
    if (c.includes("clasificación de residuos") || c.includes("clasificacion")) {
      return { unidad: "—", valorUnit: fmt(i) };
    }
    if (c.includes("vivienda")) {
      return { unidad: "—", valorUnit: fmt(i) };
    }
    // "Plus Antigüedad" (engine stores without years in name)
    if (c === "plus antigüedad" && opts.anios && opts.anios > 0) {
      return {
        unidad: `${opts.anios} años`,
        valorUnit: fmt(Math.round((i / opts.anios) * 100) / 100),
      };
    }
    // Antigüedad: "Plus Antigüedad (18 año/s)" (old format)
    const antigMatch = concepto.match(/\((\d+)\s+año/i);
    if (antigMatch) {
      const anios = parseInt(antigMatch[1]);
      return { unidad: `${anios} años`, valorUnit: fmt(Math.round((i / anios) * 100) / 100) };
    }
    // Horas extras: "Horas Extras 50% (36hs)"
    const hsMatch = concepto.match(/\((\d+(?:\.\d+)?)\s*hs?\)/i);
    if (hsMatch) {
      const hs = parseFloat(hsMatch[1]);
      return { unidad: `${hs} hs`, valorUnit: fmt(Math.round((i / hs) * 100) / 100) };
    }
    // Percentage-based descuentos
    const pctMap: Record<string, number> = {
      jubilación: 11, pami: 3, "obra social": 3,
      suterh: 2, "caja protección": 1, fateryh: 1, "seguro vitalicio": 0.75,
    };
    for (const [key, pct] of Object.entries(pctMap)) {
      if (c.includes(key) && !c.includes("diferencia")) return { unidad: `${pct}%`, valorUnit: "—" };
    }
    if (c.includes("diferencia obra social")) return { unidad: "—", valorUnit: "—" };
    return { unidad: "—", valorUnit: "—" };
  }

  // ── Redondeo ───────────────────────────────────────────────────────────────
  // Use integer cents to avoid floating-point accumulation when summing many lines.
  // The neto is displayed rounded to whole pesos; the difference is shown as Redondeo.
  const toCents = (v: number) => Math.round(v * 100);
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const sumHaberesCents    = haberes.reduce((s: number, h: any)   => s + toCents(Number(h.importe)), 0);
  const sumDescuentosCents = descuentos.reduce((s: number, d: any) => s + toCents(Number(d.importe)), 0);
  const sumHaberesDisp     = sumHaberesCents / 100;
  const sumDescuentosDisp  = sumDescuentosCents / 100;
  const netoRedondeado     = Math.round(neto);           // pesos enteros, lo que se paga
  const netoDesdeConceptos = (sumHaberesCents - sumDescuentosCents) / 100;
  const redondeo           = Math.abs(netoRedondeado - netoDesdeConceptos);

  // Contribuciones patronales — match engine values exactly (Art. 140 LCT / Decreto 407/2026)
  const pctJubilacion = Number(liq.pct_contrib_jubilacion ?? 0.18);
  const pctObraSocial = Number(liq.pct_contrib_obra_social ?? 0.06);
  const pctART = Number(liq.art_pct_variable ?? 0);
  const artFijo = Number(liq.art_fijo ?? 0);
  const scvo = Number(liq.sv_costo_fijo ?? 0) * Number(liq.sv_cant_cuiles ?? 1);
  const pctSuterh = Number(liq.pct_cct_suterh ?? 0.015);
  const pctFateryh = Number(liq.pct_cct_fateryh ?? 0.0475);
  const pctSeracarh = Number(liq.pct_cct_seracarh ?? 0.005);

  const patronalRows = [
    { concepto: "Contribución patronal jubilación (SIPA)", alicuota: pctJubilacion, importe: bruto * pctJubilacion },
    { concepto: "Contribución patronal obra social", alicuota: pctObraSocial, importe: bruto * pctObraSocial },
    ...(pctART > 0 || artFijo > 0 ? [{ concepto: "LRT – ART (Riesgos del Trabajo)", alicuota: pctART > 0 ? pctART : null, importe: bruto * pctART + artFijo }] : []),
    ...(scvo > 0 ? [{ concepto: "SCVO (Seguro Colectivo de Vida Obligatorio)", alicuota: null, importe: scvo }] : []),
    { concepto: "SUTERH (contribución patronal)", alicuota: pctSuterh, importe: bruto * pctSuterh },
    { concepto: "FATERYH (contribución patronal)", alicuota: pctFateryh, importe: bruto * pctFateryh },
    { concepto: "SERACARH (Servicio Conciliación)", alicuota: pctSeracarh, importe: bruto * pctSeracarh },
  ];
  const totalPatronal = patronalRows.reduce((s, r) => s + r.importe, 0);
  const costoTotal = bruto + totalPatronal;

  // Pie slices
  const PIE_COLORS = ["#2563eb", "#dc2626", "#0891b2", "#7c3aed", "#059669", "#d97706"];
  const pieSlices = [
    { label: "Neto empleado", value: neto, color: PIE_COLORS[0] },
    { label: "Descuentos empleado", value: totalDesc, color: PIE_COLORS[1] },
    { label: "Jubilación patronal", value: bruto * pctJubilacion, color: PIE_COLORS[2] },
    { label: "Obra Social patronal", value: bruto * pctObraSocial, color: PIE_COLORS[3] },
    { label: "ART / SCVO", value: bruto * pctART + artFijo + scvo, color: PIE_COLORS[4] },
    { label: "Sindical/Convencional", value: bruto * (pctSuterh + pctFateryh + pctSeracarh), color: PIE_COLORS[5] },
  ];

  const periodoDate = new Date(liq.periodo);
  const periodoYear = periodoDate.getUTCFullYear();
  const tipoLiq: string = liq.tipo ?? "mensual";
  let periodoLabelCap: string;
  if (tipoLiq === "sac_1") {
    periodoLabelCap = `SAC 1° Semestre ${periodoYear}`;
  } else if (tipoLiq === "sac_2") {
    periodoLabelCap = `SAC 2° Semestre ${periodoYear}`;
  } else if (tipoLiq === "indemnizacion") {
    periodoLabelCap = `Liquidación Final — ${periodoDate.toLocaleDateString("es-AR", { month: "long", year: "numeric", timeZone: "UTC" })}`;
  } else {
    const periodoLabel = periodoDate.toLocaleDateString("es-AR", { month: "long", year: "numeric", timeZone: "UTC" });
    periodoLabelCap = periodoLabel.charAt(0).toUpperCase() + periodoLabel.slice(1);
  }

  const fechaIngreso = liq.fecha_ingreso
    ? new Date(liq.fecha_ingreso).toLocaleDateString("es-AR", { timeZone: "UTC" })
    : "—";

  // Payment date: SAC 1 = 30/6, SAC 2 = 18/12, others = last day of month
  let fechaPago: string;
  if (tipoLiq === "sac_1") {
    fechaPago = new Date(periodoYear, 5, 30).toLocaleDateString("es-AR");
  } else if (tipoLiq === "sac_2") {
    fechaPago = new Date(periodoYear, 11, 18).toLocaleDateString("es-AR");
  } else {
    const lastDay = new Date(periodoDate.getUTCFullYear(), periodoDate.getUTCMonth() + 1, 0);
    fechaPago = lastDay.toLocaleDateString("es-AR");
  }

  const signingDate = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="bg-white min-h-screen print:text-[10px]">
      <div className="max-w-4xl mx-auto p-6 print:p-2">

        {/* Toolbar */}
        <div className="print:hidden mb-4">
          <p className="text-sm text-gray-500">
            <a href="/sueldos" className="hover:underline text-brand-600">Sueldos</a>
            {" / "}
            <a href="/sueldos/liquidaciones" className="hover:underline text-brand-600">Liquidaciones</a>
            {" / "}
            <span>Recibo</span>
          </p>
        </div>

        <div className="print:hidden flex justify-between items-center mb-4">
          <a href="/sueldos/liquidaciones" className="btn-secondary text-sm flex items-center gap-1">
            ← Volver a liquidaciones
          </a>
          <PrintButton liquidacionId={liq.id} empleadoEmail={liq.email} empleadoWhatsapp={liq.whatsapp} />
        </div>

        {/* ══════════════════════════════════════════════════
            BLOQUE 1 — ENCABEZADO EMPLEADOR / EMPLEADO
        ══════════════════════════════════════════════════ */}
        <div className="border-2 border-gray-800 mb-0">
          {/* Title bar */}
          <div className="bg-gray-800 text-white text-center py-1.5 text-sm font-bold tracking-wide">
            {tipoLiq === "sac_1" || tipoLiq === "sac_2"
              ? "RECIBO DE SUELDO ANUAL COMPLEMENTARIO"
              : tipoLiq === "indemnizacion"
              ? "LIQUIDACIÓN FINAL POR EGRESO"
              : "RECIBO DE HABERES"}
          </div>

          {/* Employer + employee grid */}
          <div className="grid grid-cols-2 divide-x divide-gray-300">
            {/* Left: employer */}
            <div className="p-3 text-xs space-y-0.5">
              <p className="font-bold text-sm text-gray-900">{liq.consorcio_nombre}</p>
              <p className="text-gray-600">CUIT: {liq.consorcio_cuit}</p>
              {liq.nro_cta_suterh && (
                <p className="text-gray-600">N° Cuenta SUTERH: {liq.nro_cta_suterh}</p>
              )}
            </div>
            {/* Right: period + payment date */}
            <div className="p-3 text-xs grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-400 uppercase text-[10px] font-semibold">Período</p>
                <p className="font-bold text-gray-900">{periodoLabelCap}</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase text-[10px] font-semibold">Fecha de pago</p>
                <p className="font-bold text-gray-900">{fechaPago}</p>
              </div>
            </div>
          </div>

          {/* Employee row */}
          <div className="border-t border-gray-300 grid grid-cols-4 divide-x divide-gray-300 text-xs">
            <div className="p-2">
              <p className="text-gray-400 uppercase text-[10px] font-semibold">Legajo</p>
              <p className="font-semibold">{liq.legajo ?? "—"}</p>
            </div>
            <div className="p-2 col-span-1">
              <p className="text-gray-400 uppercase text-[10px] font-semibold">Apellido y Nombre</p>
              <p className="font-semibold">{liq.empleado_nombre}</p>
            </div>
            <div className="p-2">
              <p className="text-gray-400 uppercase text-[10px] font-semibold">CUIL</p>
              <p className="font-semibold">{liq.cuil}</p>
            </div>
            <div className="p-2">
              <p className="text-gray-400 uppercase text-[10px] font-semibold">Categoría / Función</p>
              <p className="font-semibold">{liq.funcion}</p>
            </div>
          </div>

          {/* Ingreso / antigüedad / sueldo básico */}
          <div className="border-t border-gray-300 grid grid-cols-4 divide-x divide-gray-300 text-xs">
            <div className="p-2">
              <p className="text-gray-400 uppercase text-[10px] font-semibold">Fecha de ingreso</p>
              <p className="font-semibold">{fechaIngreso}</p>
            </div>
            <div className="p-2">
              <p className="text-gray-400 uppercase text-[10px] font-semibold">Antigüedad</p>
              <p className="font-semibold">{liq.antiguedad_anios ?? "—"} años</p>
            </div>
            <div className="p-2">
              <p className="text-gray-400 uppercase text-[10px] font-semibold">Jornada</p>
              <p className="font-semibold">{liq.jornada}</p>
            </div>
            <div className="p-2">
              <p className="text-gray-400 uppercase text-[10px] font-semibold">Obra Social</p>
              <p className="font-semibold">{liq.obra_social ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            BLOQUE 2 — COSTO TOTAL EMPLEADOR (Decreto 407/2026)
            Orden mandado por el decreto: patronales primero, luego bruto/neto
        ══════════════════════════════════════════════════ */}
        <div className="border-x-2 border-t-2 border-gray-800 mt-0">
          {/* Header COSTO TOTAL EMPLEADOR con monto */}
          <div className="flex justify-between items-center bg-gray-200 px-3 py-1.5 border-b border-gray-400">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              COSTO TOTAL EMPLEADOR
            </span>
            <span className="text-sm font-bold text-gray-900">${fmt(costoTotal)}</span>
          </div>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-2 font-semibold text-gray-600 w-[46%]">Concepto</th>
                <th className="text-right p-2 font-semibold text-gray-600 w-[14%]">Unidad</th>
                <th className="text-right p-2 font-semibold text-gray-600 w-[20%]">Base</th>
                <th className="text-right p-2 font-semibold text-gray-600 w-[20%]">Monto</th>
              </tr>
            </thead>
            <tbody>
              {patronalRows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="p-1.5 pl-2 text-gray-800">{r.concepto}</td>
                  <td className="p-1.5 text-right text-gray-500">
                    {r.alicuota != null ? fmtPct(r.alicuota) : "Fijo"}
                  </td>
                  <td className="p-1.5 text-right text-gray-500">
                    {r.alicuota != null ? `$${fmt(bruto)}` : "—"}
                  </td>
                  <td className="p-1.5 text-right font-medium text-gray-900">${fmt(r.importe)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* SUB TOTAL CONTRIBUCIONES EMPLEADOR */}
          <div className="flex justify-between items-center bg-gray-100 px-3 py-1.5 border-t border-gray-300">
            <span className="text-xs font-semibold text-gray-700 uppercase">
              SUB TOTAL CONTRIBUCIONES EMPLEADOR
            </span>
            <span className="text-xs font-bold text-gray-900">${fmt(totalPatronal)}</span>
          </div>

          {/* SUELDO BRUTO header */}
          <div className="flex justify-between items-center bg-gray-200 px-3 py-1.5 border-t border-gray-400">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">SUELDO BRUTO</span>
            <span className="text-sm font-bold text-gray-900">${fmt(bruto)}</span>
          </div>

          {/* Haberes y Descuentos */}
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-2 font-semibold text-gray-600 w-[32%]">Concepto</th>
                <th className="text-right p-2 font-semibold text-gray-600 w-[10%]">Unidad / Alíc.</th>
                <th className="text-right p-2 font-semibold text-gray-600 w-[12%]">Valor Unit.</th>
                <th className="text-right p-2 font-semibold text-gray-600 w-[14%]">Remunerativo</th>
                <th className="text-right p-2 font-semibold text-gray-600 w-[14%]">No Remuner.</th>
                <th className="text-right p-2 font-semibold text-gray-600 w-[14%]">Descuentos</th>
              </tr>
            </thead>
            <tbody>
              {haberes.map((h: any, i: number) => {
                const esNoRem = NO_REMUNERATIVOS.has(h.concepto);
                const val = Number(h.importe);
                const isNegative = val < 0;
                const { unidad, valorUnit } = inferUnidadValor(h.concepto, Math.abs(val), { anios: liq.antiguedad_anios ?? 0 });
                return (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="p-1.5 pl-2 text-gray-800">{h.concepto}</td>
                    <td className="p-1.5 text-right text-gray-500">{unidad}</td>
                    <td className="p-1.5 text-right text-gray-500">{valorUnit}</td>
                    <td className={`p-1.5 text-right font-medium ${isNegative ? "text-red-700" : "text-gray-900"}`}>
                      {!esNoRem ? `${isNegative ? "-" : ""}$${fmt(Math.abs(val))}` : ""}
                    </td>
                    <td className="p-1.5 text-right font-medium text-blue-700">
                      {esNoRem ? `$${fmt(Math.abs(val))}` : ""}
                    </td>
                    <td className="p-1.5" />
                  </tr>
                );
              })}
              {descuentos.map((d: any, i: number) => {
                const { unidad, valorUnit } = inferUnidadValor(d.concepto, Number(d.importe));
                return (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="p-1.5 pl-2 text-gray-800">{d.concepto}</td>
                    <td className="p-1.5 text-right text-gray-500">{unidad}</td>
                    <td className="p-1.5 text-right text-gray-500">{valorUnit}</td>
                    <td className="p-1.5" />
                    <td className="p-1.5" />
                    <td className="p-1.5 text-right font-medium text-red-700">${fmt(Number(d.importe))}</td>
                  </tr>
                );
              })}
              {/* Redondeo — last row, after all descuentos */}
              {redondeo > 0.005 && (
                <tr className="border-b border-gray-100 text-gray-400 italic">
                  <td className="p-1.5 pl-2">Redondeo</td>
                  <td className="p-1.5 text-right">—</td>
                  <td className="p-1.5 text-right">—</td>
                  <td className="p-1.5" />
                  <td className="p-1.5 text-right font-medium text-blue-700">${fmt(redondeo)}</td>
                  <td className="p-1.5" />
                </tr>
              )}
            </tbody>
            <tfoot>
              {/* COMPOSICION SALARIAL row */}
              <tr className="border-t border-gray-300 bg-gray-50 text-xs">
                <td className="p-2 font-semibold text-gray-700" colSpan={3}>COMPOSICIÓN SALARIAL</td>
                <td className="p-2 text-right text-gray-700">
                  Rem.: ${fmt(haberes.filter((h: any) => !NO_REMUNERATIVOS.has(h.concepto)).reduce((s: number, h: any) => s + r2(Number(h.importe)), 0))}
                </td>
                <td className="p-2 text-right text-blue-700">
                  {(() => {
                    const noRemTotal = haberes.filter((h: any) => NO_REMUNERATIVOS.has(h.concepto)).reduce((s: number, h: any) => s + r2(Number(h.importe)), 0);
                    const redondeoTotal = redondeo > 0.005 ? redondeo : 0;
                    const total = noRemTotal + redondeoTotal;
                    return total > 0 ? `No Rem.: $${fmt(total)}` : "—";
                  })()}
                </td>
                <td className="p-2 text-right text-red-700">
                  Desc.: ${fmt(sumDescuentosDisp)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ══════════════════════════════════════════════════
            BLOQUE 3 — NETO + TEXTO DE RECIBO
        ══════════════════════════════════════════════════ */}
        <div className="border-2 border-gray-800 border-t-0 p-3 text-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="italic text-gray-700">
                Recibí el pago de la presente liquidación —{" "}
                <span className="font-semibold not-italic text-gray-900">
                  {numberToWords(netoRedondeado)}
                </span>
              </p>
              {liq.cbu && (
                <p className="mt-1 text-gray-600">
                  Depósito bancario — Banco: <span className="font-medium">{liq.banco ?? "—"}</span>
                  {"  "}CBU:{" "}
                  <span className="font-mono font-medium tracking-wider">{liq.cbu}</span>
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-gray-400 uppercase text-[10px] font-semibold">SUELDO NETO $</p>
              <p className="text-2xl font-bold text-gray-900">${fmt0(netoRedondeado)}</p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            BLOQUE 4 — GRÁFICO COSTO LABORAL
        ══════════════════════════════════════════════════ */}
        <div className="border-2 border-gray-800 border-t-0 mt-0">
          <div className="border-t border-gray-200 p-4">
            <p className="text-[10px] text-gray-400 uppercase font-semibold mb-3">
              Composición del costo laboral — Decreto 407/2026
            </p>
            <PieChart slices={pieSlices} />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            BLOQUE 5 — FIRMAS
        ══════════════════════════════════════════════════ */}
        <div className="border-2 border-gray-800 border-t-0 grid grid-cols-2 divide-x divide-gray-300">
          {/* Firma empleador */}
          <div className="p-4 text-center">
            <div className="h-12 flex items-end justify-center pb-1 mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/firma-empleador.png" alt="" style={{ height: 44, maxWidth: 160, objectFit: "contain" }} />
            </div>
            <div className="border-t border-gray-400 pt-2 mt-1 text-xs">
              <p className="font-semibold text-gray-800">{liq.consorcio_nombre}</p>
              <p className="text-gray-500">CUIT: {liq.consorcio_cuit}</p>
              <p className="text-gray-400 text-[10px] mt-0.5">Firma y Sello del Empleador</p>
              <p className="text-gray-400 text-[10px]">{signingDate}</p>
            </div>
          </div>

          {/* Firma empleado */}
          <div className="p-4 text-center">
            <div className="h-12 mb-1" />
            <div className="border-t border-gray-400 pt-2 mt-1 text-xs">
              <p className="font-semibold text-gray-800">{liq.empleado_nombre}</p>
              <p className="text-gray-500">CUIL: {liq.cuil}</p>
              <p className="text-gray-400 text-[10px] mt-0.5">Aclaración y Firma del Trabajador</p>
              <p className="text-gray-400 text-[10px]">&nbsp;</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-300 text-center mt-3 print:block hidden">
          Recibo emitido electrónicamente · Decreto 407/2026 · Art. 140 LCT
        </p>
      </div>
    </div>
  );
}

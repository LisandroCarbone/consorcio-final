import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";

const MONTH_NAMES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const CATEGORIAS: Record<number, string> = {
  1: "Sueldos y Cargas Sociales",
  2: "Servicios Públicos y Tasas",
  3: "Abonos de Servicios",
  4: "Mantenimiento de Partes Comunes",
  5: "Reparaciones en Unidades",
  6: "Gastos Bancarios",
  7: "Limpieza",
  8: "Gastos de Administración",
  9: "Seguros",
  10: "Otros",
};

function money(n: number | string | null): string {
  const num = Number(n ?? 0);
  return new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(num);
}

function moneyCompact(n: number | string | null): string {
  const num = Number(n ?? 0);
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(num);
}

function formatDate(d: string | Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-AR", { timeZone: "UTC" });
}

function pct(n: number | string | null): string {
  return `${(Number(n ?? 0) * 100).toFixed(2)}`;
}

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

type PeriodoRow = {
  periodo_id: number;
  anio: number;
  mes: number;
  fecha_vencimiento: string | null;
  fecha_vencimiento_2: string | null;
  interest_rate_2: string | null;
  notas: string | null;
  consorcio_nombre: string;
  consorcio_direccion: string;
  consorcio_cuit: string;
  interest_rate: string | null;
  banco: string | null;
  bank_titular: string | null;
  bank_account_number: string | null;
  cbu: string | null;
  bank_alias: string | null;
  admin_sociedad: string | null;
  admin_nombre: string | null;
  admin_cuit: string | null;
  admin_matricula: string | null;
  admin_email: string | null;
  admin_telefono: string | null;
  admin_celular: string | null;
  admin_domicilio: string | null;
  admin_horario: string | null;
  admin_categoria_afip: string | null;
}

type ConceptoLiq = {
  concepto: string;
  importe: number;
  tipo: string;
};

type GastoRow = {
  descripcion: string;
  monto: string;
  tipo: string;
  categoria: number;
  liquidacion_id: number | null;
  liq_bruto: string | null;
  liq_descuentos: string | null;
  liq_neto: string | null;
  liq_tipo: string | null;
  conceptos: ConceptoLiq[] | string | null;
}

type UfRow = {
  id: number;
  uf: string;
  uf_numero: number | null;
  propietario: string | null;
  saldo_anterior: string;
  su_pago: string;
  coef_a: string;
  expensas_a: string;
  coef_b: string;
  expensas_b: string;
  total_mes: string;
  deuda: string;
  intereses: string;
  total_pagar: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ periodoId: string }> }
) {
  const { periodoId } = await params;
  const id = Number(periodoId);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "ID de período inválido" }, { status: 400 });
  }

  const periodo = await queryOne<PeriodoRow>(
    `SELECT p.id AS periodo_id, p.anio, p.mes, p.fecha_vencimiento,
            p.fecha_vencimiento_2, p.interest_rate_2, p.notas,
            c.nombre AS consorcio_nombre, c.direccion AS consorcio_direccion, c.cuit AS consorcio_cuit,
            c.interest_rate,
            c.banco, c.bank_titular, c.bank_account_number, c.cbu, c.bank_alias,
            a.nombre_sociedad AS admin_sociedad, a.nombre_administrador AS admin_nombre,
            a.cuit AS admin_cuit, a.matricula_rpa AS admin_matricula,
            a.email AS admin_email, a.telefono AS admin_telefono,
            a.celular_urgencias AS admin_celular, a.domicilio AS admin_domicilio,
            a.horario_atencion AS admin_horario, a.categoria_afip AS admin_categoria_afip
     FROM app.periodos_expensas p
     JOIN app.consorcios c ON c.cuit = p.consorcio_cuit
     LEFT JOIN app.administradores a ON a.id = c.administrador_id
     WHERE p.id = $1`,
    [id]
  );

  if (!periodo) {
    return new Response("<h1>Período no encontrado</h1>", {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  const [gastos, ufRows] = await Promise.all([
    query<GastoRow>(
      `SELECT g.descripcion, g.monto::numeric, g.tipo, g.categoria,
              g.liquidacion_id,
              l.remuneracion_bruta::numeric AS liq_bruto,
              l.total_descuentos_empleado::numeric AS liq_descuentos,
              l.neto_a_pagar::numeric AS liq_neto,
              l.tipo AS liq_tipo,
              (SELECT json_agg(json_build_object('concepto', c.concepto, 'importe', c.importe::numeric, 'tipo', c.tipo) ORDER BY c.orden)
               FROM app.conceptos_liquidacion c WHERE c.liquidacion_id = l.id) AS conceptos
       FROM app.gastos_periodo g
       LEFT JOIN app.liquidaciones_sueldo l ON l.id = g.liquidacion_id
       WHERE g.periodo_id = $1
       ORDER BY g.categoria,
         CASE
           WHEN g.liquidacion_id IS NOT NULL AND l.tipo = 'mensual' THEN 1
           WHEN g.liquidacion_id IS NOT NULL AND l.tipo IN ('sac_1','sac_2') THEN 2
           WHEN g.liquidacion_id IS NOT NULL THEN 3
           ELSE 4
         END,
         g.descripcion`,
      [id]
    ),
    query<UfRow>(
      `SELECT rcp.id, u.uf, u.uf_numero,
              NULLIF(TRIM(COALESCE(per.nombre,'') || ' ' || COALESCE(per.apellido,'')), '') AS propietario,
              rcp.saldo_anterior::numeric, rcp.su_pago::numeric,
              rcp.coef_a::numeric, rcp.expensas_a::numeric,
              rcp.coef_b::numeric, rcp.expensas_b::numeric,
              rcp.total_mes::numeric, rcp.deuda::numeric, rcp.intereses::numeric,
              rcp.total_pagar::numeric
       FROM app.res_cuenta_periodo rcp
       JOIN app.unidades u ON u.id = rcp.unidad_id
       LEFT JOIN app.ocupantes o ON o.unidad_id = u.id AND o.activo = true AND o.rol = 'propietario'
       LEFT JOIN app.personas per ON per.id = o.persona_id
       WHERE rcp.periodo_id = $1
       ORDER BY u.uf_numero NULLS LAST, u.uf`,
      [id]
    ),
  ]);

  // Group gastos by category
  const gastosPorCategoria = new Map<number, GastoRow[]>();
  for (const g of gastos) {
    const list = gastosPorCategoria.get(g.categoria) ?? [];
    list.push(g);
    gastosPorCategoria.set(g.categoria, list);
  }

  let totalGastosA = 0;
  let totalGastosB = 0;

  const categoriaSubtotals = [...gastosPorCategoria.entries()]
    .sort(([a], [b]) => a - b)
    .map(([categoria, items]) => {
      const subtotalA = items.filter(g => g.tipo === "A").reduce((s, g) => s + Number(g.monto), 0);
      const subtotalB = items.filter(g => g.tipo === "B").reduce((s, g) => s + Number(g.monto), 0);
      const subtotal = subtotalA + subtotalB;
      totalGastosA += subtotalA;
      totalGastosB += subtotalB;
      return { categoria, items, subtotal };
    });

  const totalGastos = totalGastosA + totalGastosB;

  const categoriaRows = categoriaSubtotals
    .map(({ categoria, items, subtotal }) => {
      const pctInc = totalGastos > 0 ? ((subtotal / totalGastos) * 100).toFixed(1) : "0.0";

      const itemRows = items.map(g => {
        let conceptRows = "";
        if (g.liquidacion_id && g.liq_bruto) {
          let conceptos: ConceptoLiq[] = [];
          if (g.conceptos) {
            try {
              conceptos = typeof g.conceptos === "string"
                ? JSON.parse(g.conceptos)
                : g.conceptos as ConceptoLiq[];
            } catch { /* ignore */ }
          }
          const haberes = conceptos.filter(c => c.tipo === "haber" || c.tipo === "no_remunerativo");
          const descuentos = conceptos.filter(c => c.tipo === "descuento");
          const bruto = Number(g.liq_bruto);
          const totalDesc = Number(g.liq_descuentos || 0);
          const neto = Number(g.liq_neto || 0);

          const haberRows = haberes.map(c => `
            <tr class="desglose-row">
              <td class="desglose-desc">${esc(c.concepto)}</td>
              <td class="r mono desglose-val">${moneyCompact(c.importe)}</td>
              <td></td><td></td>
            </tr>`).join("");

          const descRows = "";

          conceptRows = `
            ${haberRows}
            <tr class="desglose-row desglose-subtotal">
              <td class="desglose-desc"><strong>Total bruto</strong></td>
              <td class="r mono desglose-val"><strong>${moneyCompact(bruto)}</strong></td>
              <td></td><td></td>
            </tr>
            ${totalDesc > 0 ? `
            <tr class="desglose-row">
              <td class="desglose-desc desc-item">Descuentos</td>
              <td class="r mono desglose-val desc-val">-${moneyCompact(totalDesc)}</td>
              <td></td><td></td>
            </tr>` : ""}
            <tr class="desglose-row desglose-neto">
              <td class="desglose-desc"><strong>Neto a pagar</strong></td>
              <td class="r mono desglose-val"><strong>${moneyCompact(neto)}</strong></td>
              <td></td><td></td>
            </tr>`;
        }
        return `
        <tr>
          <td class="gasto-desc">${esc(g.descripcion)}</td>
          <td class="r mono">${g.tipo === "A" ? moneyCompact(g.monto) : ""}</td>
          <td class="r mono">${g.tipo === "B" ? moneyCompact(g.monto) : ""}</td>
          <td></td>
        </tr>${conceptRows}`;
      }).join("");

      return `
        <tr class="cat-row">
          <td><strong>${categoria}. ${esc(CATEGORIAS[categoria] ?? "Otros")}</strong></td>
          <td class="r mono" colspan="2"><strong>${money(subtotal)}</strong></td>
          <td class="r mono"><strong>${pctInc}%</strong></td>
        </tr>
        ${itemRows}`;
    }).join("");

  // UF table totals
  const totales = ufRows.reduce(
    (acc, r) => ({
      saldo_anterior: acc.saldo_anterior + Number(r.saldo_anterior),
      su_pago: acc.su_pago + Number(r.su_pago),
      expensas_a: acc.expensas_a + Number(r.expensas_a),
      expensas_b: acc.expensas_b + Number(r.expensas_b),
      total_mes: acc.total_mes + Number(r.total_mes),
      deuda: acc.deuda + Number(r.deuda),
      intereses: acc.intereses + Number(r.intereses),
      total_pagar: acc.total_pagar + Number(r.total_pagar),
    }),
    { saldo_anterior: 0, su_pago: 0, expensas_a: 0, expensas_b: 0, total_mes: 0, deuda: 0, intereses: 0, total_pagar: 0 }
  );

  const ufTableRows = ufRows.map(r => `
    <tr>
      <td class="c mono">${r.uf_numero ?? "—"}</td>
      <td>${esc(r.uf)}</td>
      <td>${esc(r.propietario) || "—"}</td>
      <td class="r mono">${moneyCompact(r.saldo_anterior)}</td>
      <td class="r mono">${moneyCompact(r.su_pago)}</td>
      <td class="r mono">${pct(r.coef_a)}</td>
      <td class="r mono">${moneyCompact(r.expensas_a)}</td>
      <td class="r mono">${pct(r.coef_b)}</td>
      <td class="r mono">${moneyCompact(r.expensas_b)}</td>
      <td class="r mono">${moneyCompact(r.total_mes)}</td>
      <td class="r mono">${moneyCompact(r.deuda)}</td>
      <td class="r mono">${moneyCompact(r.intereses)}</td>
      <td class="r mono total-col">${moneyCompact(r.total_pagar)}</td>
    </tr>`).join("");

  const deudores = ufRows.filter(r => Number(r.total_pagar) > 0 && Number(r.deuda) > 0);
  const deudoresRows = deudores.map(r => `
    <tr>
      <td class="c mono">${r.uf_numero ?? "—"}</td>
      <td>${esc(r.uf)}</td>
      <td>${esc(r.propietario) || "—"}</td>
      <td class="r mono">${money(r.deuda)}</td>
    </tr>`).join("");

  const deudoresSection = deudores.length > 0
    ? `
    <div class="section-title">PROPIETARIOS CON SALDO DEUDOR</div>
    <table class="prorrateo-table">
      <thead>
        <tr>
          <th class="c">UF</th>
          <th>Unidad</th>
          <th>Propietario</th>
          <th class="r">Deuda</th>
        </tr>
      </thead>
      <tbody>
        ${deudoresRows}
      </tbody>
    </table>`
    : "";

  const periodoLabel = `${MONTH_NAMES[periodo.mes] ?? periodo.mes} ${periodo.anio}`;
  const vencimientoSection = periodo.fecha_vencimiento_2
    ? `
    <div style="display:flex; gap:0;">
      <div class="vencimiento-bar" style="flex:1; background:#222;">
        1er VTO: ${formatDate(periodo.fecha_vencimiento)}${periodo.interest_rate ? ` — Interés: ${Number(periodo.interest_rate)}%` : ""}
      </div>
      <div class="vencimiento-bar" style="flex:1; background:#555;">
        2do VTO: ${formatDate(periodo.fecha_vencimiento_2)}${periodo.interest_rate_2 ? ` — Interés: ${Number(periodo.interest_rate_2)}%` : ""}
      </div>
    </div>`
    : `
    <div class="vencimiento-bar">
      FECHA DE VENCIMIENTO: ${formatDate(periodo.fecha_vencimiento)}${periodo.interest_rate ? ` — Interés: ${Number(periodo.interest_rate)}%` : ""}
    </div>`;

  const notasSection = periodo.notas
    ? `
    <div class="section-title">NOTAS</div>
    <div style="padding:8px; background:#f9f9f9; border:1px solid #e0e0e0; border-radius:3px; font-size:11px; white-space:pre-wrap;">${esc(periodo.notas)}</div>`
    : "";

  const hasAdmin = Boolean(periodo.admin_sociedad || periodo.admin_nombre);
  const adminHeader = hasAdmin
    ? `
    <div>
      <h1>${esc(periodo.admin_sociedad || periodo.admin_nombre)}</h1>
      ${periodo.admin_sociedad && periodo.admin_nombre ? `<div class="meta">${esc(periodo.admin_nombre)}</div>` : ""}
      ${(periodo.admin_cuit || periodo.admin_matricula) ? `<div class="meta">${periodo.admin_cuit ? `CUIT: ${esc(periodo.admin_cuit)}` : ""}${periodo.admin_cuit && periodo.admin_matricula ? " | " : ""}${periodo.admin_matricula ? `Mat. RPA: ${esc(periodo.admin_matricula)}` : ""}</div>` : ""}
      ${periodo.admin_domicilio ? `<div class="meta">${esc(periodo.admin_domicilio)}</div>` : ""}
      ${(periodo.admin_telefono || periodo.admin_celular) ? `<div class="meta">${periodo.admin_telefono ? `Tel: ${esc(periodo.admin_telefono)}` : ""}${periodo.admin_telefono && periodo.admin_celular ? " | " : ""}${periodo.admin_celular ? `Cel: ${esc(periodo.admin_celular)}` : ""}</div>` : ""}
      ${periodo.admin_email ? `<div class="meta">Email: ${esc(periodo.admin_email)}</div>` : ""}
      ${(periodo.admin_categoria_afip || periodo.admin_horario) ? `<div class="meta">${periodo.admin_categoria_afip ? esc(periodo.admin_categoria_afip) : ""}${periodo.admin_categoria_afip && periodo.admin_horario ? " | " : ""}${periodo.admin_horario ? `Horario: ${esc(periodo.admin_horario)}` : ""}</div>` : ""}
    </div>`
    : `
    <div>
      <h1>${esc(periodo.consorcio_nombre)}</h1>
      <div class="meta">${esc(periodo.consorcio_direccion)}</div>
      <div class="meta">CUIT: ${esc(periodo.consorcio_cuit)}</div>
    </div>`;

  const periodoBox = `
    <div class="periodo-box">
      ${hasAdmin ? `
      <div style="font-weight:700;font-size:14px;">${esc(periodo.consorcio_nombre)}</div>
      <div class="meta">${esc(periodo.consorcio_direccion)}</div>
      <div class="meta">CUIT: ${esc(periodo.consorcio_cuit)}</div>
      <div style="margin-top:8px;">Liquidación de Expensas</div>` : `<div>Liquidación de Expensas</div>`}
      <div class="periodo-value">${periodoLabel}</div>
    </div>`;

  const paymentSection = (periodo.banco || periodo.cbu)
    ? `
    <div class="section-title">FORMAS DE PAGO</div>
    <table class="payment-table">
      <tr>
        ${periodo.banco ? `<td><span class="label">Banco:</span> ${esc(periodo.banco)}</td>` : ""}
        ${periodo.bank_titular ? `<td><span class="label">Titular:</span> ${esc(periodo.bank_titular)}</td>` : ""}
      </tr>
      <tr>
        ${periodo.bank_account_number ? `<td><span class="label">Cuenta:</span> ${esc(periodo.bank_account_number)}</td>` : ""}
        ${periodo.cbu ? `<td><span class="label">CBU:</span> <strong>${esc(periodo.cbu)}</strong></td>` : ""}
      </tr>
      ${periodo.bank_alias ? `<tr><td><span class="label">Alias:</span> <strong>${esc(periodo.bank_alias)}</strong></td><td></td></tr>` : ""}
    </table>`
    : "";

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Liquidación Completa — ${esc(periodo.consorcio_nombre)} — ${periodoLabel}</title>
<style>
  @page {
    size: landscape;
    margin: 10mm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    color: #222;
    margin: 0 auto;
    padding: 20px;
    background: #fff;
    font-size: 11px;
    line-height: 1.4;
  }

  /* Header */
  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #222;
    padding-bottom: 10px;
    margin-bottom: 14px;
  }
  .doc-header h1 { font-size: 16px; letter-spacing: -0.3px; }
  .doc-header .meta { font-size: 10px; color: #444; margin-top: 2px; }
  .doc-header .periodo-box {
    text-align: right;
    font-size: 10px;
    color: #444;
  }
  .doc-header .periodo-box .periodo-value {
    font-size: 18px;
    font-weight: 700;
    color: #222;
    letter-spacing: -0.5px;
  }

  /* Section titles */
  .section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #444;
    border-bottom: 1px solid #bbb;
    padding-bottom: 3px;
    margin: 14px 0 6px;
  }

  /* Tables */
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: #555;
    font-weight: 600;
    padding: 4px 5px;
    border-bottom: 1px solid #999;
    text-align: left;
  }
  td { padding: 3px 5px; border-bottom: 1px solid #e8e8e8; }
  .r { text-align: right; }
  .c { text-align: center; }
  .mono { font-family: "Consolas", "Courier New", monospace; font-size: 10px; }

  /* Gastos table */
  .cat-row td {
    background: #f4f4f4;
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ddd;
    padding: 4px 5px;
    font-size: 10px;
  }
  .gasto-desc { padding-left: 14px; color: #333; }
  .desglose-row td { border-bottom: none; padding: 1px 5px; }
  .desglose-desc { padding-left: 28px !important; font-size: 9px; color: #666; }
  .desglose-val { font-size: 9px; color: #666; }
  .desc-item { color: #b44; }
  .desc-val { color: #b44; }
  .desglose-subtotal td { border-top: 1px dotted #ccc; }
  .desglose-neto td { border-top: 1px solid #999; border-bottom: 1px solid #ddd; }
  .desglose-neto .desglose-desc { color: #222; }
  .desglose-neto .desglose-val { color: #222; }
  .totales-row td {
    font-weight: 700;
    border-top: 2px solid #222;
    border-bottom: 2px solid #222;
    padding: 5px;
    background: #f4f4f4;
  }
  .total-col { font-weight: 700; }

  /* UF table */
  .prorrateo-table th { white-space: nowrap; }
  .prorrateo-table td { white-space: nowrap; font-size: 9.5px; }

  /* Payment */
  .payment-table { font-size: 11px; margin: 4px 0; }
  .payment-table td { border: none; padding: 2px 12px 2px 0; }
  .payment-table .label { color: #666; }

  /* Vencimiento */
  .vencimiento-bar {
    background: #222;
    color: #fff;
    text-align: center;
    padding: 8px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.3px;
    margin: 14px 0 6px;
  }
  .interest-note {
    text-align: center;
    font-size: 9px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  /* Print */
  @media print {
    body { padding: 0; }
    .no-print { display: none !important; }
  }
  .no-print {
    margin-top: 14px;
  }
  .no-print button {
    background: #222;
    color: #fff;
    border: none;
    padding: 8px 20px;
    font-size: 12px;
    cursor: pointer;
    border-radius: 4px;
  }
  .no-print button:hover { background: #444; }
</style>
</head>
<body>

  <div class="doc-header">
    ${adminHeader}
    ${periodoBox}
  </div>

  <div class="section-title">Pagos del Período — Gastos "A" y "B"</div>
  <table>
    <thead>
      <tr>
        <th style="width:55%">Descripción</th>
        <th class="r">Gastos "A"</th>
        <th class="r">Gastos "B"</th>
        <th class="r">% Inc.</th>
      </tr>
    </thead>
    <tbody>
      ${categoriaRows || `<tr><td colspan="4">Sin gastos registrados</td></tr>`}
      <tr class="totales-row">
        <td>TOTAL GASTOS</td>
        <td class="r mono">${money(totalGastosA)}</td>
        <td class="r mono">${money(totalGastosB)}</td>
        <td class="r mono">100.0%</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">Estado de Cuentas y Prorrateo de Gastos al ${formatDate(periodo.fecha_vencimiento)}</div>
  <table class="prorrateo-table">
    <thead>
      <tr>
        <th class="c">UF</th>
        <th>Unidad</th>
        <th>Nombre</th>
        <th class="r">Saldo Ant.</th>
        <th class="r">Su Pago</th>
        <th class="r">% A</th>
        <th class="r">Exp. A</th>
        <th class="r">% B</th>
        <th class="r">Exp. B</th>
        <th class="r">Total Mes</th>
        <th class="r">Deuda</th>
        <th class="r">Intereses</th>
        <th class="r">Total</th>
      </tr>
    </thead>
    <tbody>
      ${ufTableRows || `<tr><td colspan="13">Sin unidades liquidadas</td></tr>`}
      <tr class="totales-row">
        <td colspan="3">TOTALES</td>
        <td class="r mono">${moneyCompact(totales.saldo_anterior)}</td>
        <td class="r mono">${moneyCompact(totales.su_pago)}</td>
        <td></td>
        <td class="r mono">${moneyCompact(totales.expensas_a)}</td>
        <td></td>
        <td class="r mono">${moneyCompact(totales.expensas_b)}</td>
        <td class="r mono">${moneyCompact(totales.total_mes)}</td>
        <td class="r mono">${moneyCompact(totales.deuda)}</td>
        <td class="r mono">${moneyCompact(totales.intereses)}</td>
        <td class="r mono">${moneyCompact(totales.total_pagar)}</td>
      </tr>
    </tbody>
  </table>

  ${deudoresSection}

  ${vencimientoSection}

  ${paymentSection}

  ${notasSection}

  <div class="no-print">
    <button onclick="window.print()">Imprimir / Guardar PDF</button>
  </div>

</body>
</html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

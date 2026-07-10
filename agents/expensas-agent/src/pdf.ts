import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

const MONTH_NAMES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
}

export interface ExpensaReceipt {
  consorcio_nombre: string;
  consorcio_direccion: string;
  consorcio_cuit?: string;
  unidad_numero: string;
  ocupante_nombre: string;
  anio: number;
  mes: number;
  fecha_vencimiento?: string;
  monto_ordinario: number;
  monto_extraordinario: number;
  monto_fondo_reserva: number;
  monto_total: number;
  gastos?: Array<{ concepto: string; monto: number; tipo: string }>;
}

function buildHtml(d: ExpensaReceipt): string {
  const mesNombre = MONTH_NAMES[d.mes] ?? String(d.mes);
  const gastosRows = (d.gastos ?? [])
    .map((g) => `<tr><td>${g.concepto}</td><td class="tipo">${g.tipo}</td><td class="monto">${formatMoney(g.monto)}</td></tr>`)
    .join("");

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:12px;color:#333;padding:32px}
.header{border-bottom:3px solid #1a3c5e;padding-bottom:16px;margin-bottom:24px}
.header h1{font-size:20px;color:#1a3c5e}
.badge{display:inline-block;background:#1a3c5e;color:white;padding:4px 12px;border-radius:4px;font-size:11px;margin-top:8px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
.card{background:#f5f7fa;border-radius:6px;padding:14px}
.card h3{font-size:11px;text-transform:uppercase;color:#888;margin-bottom:8px}
.card p{font-size:14px;font-weight:600;color:#1a3c5e}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
th{background:#1a3c5e;color:white;padding:8px 10px;text-align:left;font-size:11px}
td{padding:7px 10px;border-bottom:1px solid #e8ecf0}
.monto{text-align:right;font-family:monospace}
.tipo{font-size:10px;color:#888}
.summary{background:#1a3c5e;color:white;border-radius:6px;padding:16px}
.summary table{margin-bottom:0}
.summary td{border-color:rgba(255,255,255,0.15);color:white}
.total-row td{font-size:16px;font-weight:700;border-top:2px solid rgba(255,255,255,0.4)}
.footer{margin-top:24px;font-size:10px;color:#aaa;text-align:center}
</style></head><body>
<div class="header">
  <h1>${d.consorcio_nombre}</h1>
  <p>${d.consorcio_direccion}</p>
  ${d.consorcio_cuit ? `<p>CUIT: ${d.consorcio_cuit}</p>` : ""}
  <span class="badge">Liquidación de Expensas — ${mesNombre} ${d.anio}</span>
</div>
<div class="grid">
  <div class="card"><h3>Unidad</h3><p>Depto. ${d.unidad_numero}</p></div>
  <div class="card"><h3>Propietario / Inquilino</h3><p>${d.ocupante_nombre}</p></div>
  <div class="card"><h3>Período</h3><p>${mesNombre} ${d.anio}</p></div>
  <div class="card"><h3>Vencimiento</h3><p>${d.fecha_vencimiento ?? "—"}</p></div>
</div>
${gastosRows ? `<table><thead><tr><th>Concepto</th><th>Tipo</th><th style="text-align:right">Monto</th></tr></thead><tbody>${gastosRows}</tbody></table>` : ""}
<div class="summary"><table>
  <tr><td>Expensas ordinarias</td><td class="monto">${formatMoney(d.monto_ordinario)}</td></tr>
  ${d.monto_extraordinario > 0 ? `<tr><td>Expensas extraordinarias</td><td class="monto">${formatMoney(d.monto_extraordinario)}</td></tr>` : ""}
  ${d.monto_fondo_reserva > 0 ? `<tr><td>Fondo de reserva</td><td class="monto">${formatMoney(d.monto_fondo_reserva)}</td></tr>` : ""}
  <tr class="total-row"><td><strong>TOTAL A PAGAR</strong></td><td class="monto"><strong>${formatMoney(d.monto_total)}</strong></td></tr>
</table></div>
<div class="footer">Generado automáticamente — ${d.consorcio_nombre}</div>
</body></html>`;
}

export async function generatePdf(data: ExpensaReceipt, outputDir: string): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });
  const safeUnidad = data.unidad_numero.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `expensa_${data.anio}_${String(data.mes).padStart(2, "0")}_u${safeUnidad}.pdf`;
  const filePath = path.join(outputDir, filename);

  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(buildHtml(data), { waitUntil: "networkidle0" });
    await page.pdf({ path: filePath, format: "A4", printBackground: true });
  } finally {
    await browser.close();
  }

  return filePath;
}

export interface SueldoReceipt {
  consorcio_nombre: string;
  consorcio_cuit: string;
  consorcio_direccion: string;
  empleado_nombre: string;
  empleado_cuil: string;
  empleado_legajo?: string;
  empleado_funcion: string;
  empleado_jornada: string;
  empleado_categoria_edificio: number;
  empleado_fecha_ingreso: string;
  obra_social?: string;
  cod_obra_social?: number;
  banco?: string;
  cbu?: string;
  periodo: string; // e.g. "2026-06-01"
  tipo: string; // mensual, sac_1, sac_2, indemnizacion
  remuneracion_bruta: number;
  total_descuentos_empleado: number;
  neto_a_pagar: number;
  conceptos: Array<{
    code: string;
    concepto: string;
    cantidad: number;
    importe: number;
    tipo: "remunerativo" | "no_remunerativo" | "descuento";
  }>;
}

function numberToWords(n: number): string {
  const ones = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
    "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
  const tens = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const hundreds = ["", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos",
    "seiscientos", "setecientos", "ochocientos", "novecientos"];

  const belowThousand = (num: number): string => {
    if (num === 0) return "";
    if (num === 100) return "cien";
    if (num < 20) return ones[num];
    if (num < 100) {
      const t = Math.floor(num / 10);
      const o = num % 10;
      return o === 0 ? tens[t] : `${tens[t]} y ${ones[o]}`;
    }
    const h = Math.floor(num / 100);
    const rest = num % 100;
    return rest === 0 ? hundreds[h] : `${hundreds[h]} ${belowThousand(rest)}`;
  };

  const integer = Math.floor(n);
  const cents = Math.round((n - integer) * 100);
  const millions = Math.floor(integer / 1_000_000);
  const thousands = Math.floor((integer % 1_000_000) / 1000);
  const remainder = integer % 1000;

  let words = "";
  if (millions > 0) words += millions === 1 ? "un millón " : `${belowThousand(millions)} millones `;
  if (thousands > 0) words += thousands === 1 ? "mil " : `${belowThousand(thousands)} mil `;
  if (remainder > 0) words += belowThousand(remainder) + " ";
  if (integer === 0) words = "cero ";

  const centsStr = cents === 0 ? "00/100" : `${cents}/100`;
  return `Son pesos ${words.trim()} con ${centsStr}`;
}

function buildSueldoHtml(d: SueldoReceipt): string {
  const dateObj = new Date(d.periodo);
  const mesNombre = MONTH_NAMES[dateObj.getUTCMonth() + 1] ?? "";
  const anio = dateObj.getUTCFullYear();

  const conceptosRows = d.conceptos
    .map((c) => {
      const rem = c.tipo === "remunerativo" ? formatMoney(c.importe) : "";
      const noRem = c.tipo === "no_remunerativo" ? formatMoney(c.importe) : "";
      const desc = c.tipo === "descuento" ? formatMoney(c.importe) : "";
      const cant = c.cantidad > 0 ? c.cantidad.toString() : "";
      return `<tr>
        <td style="font-family: monospace;">${c.code}</td>
        <td>${c.concepto}</td>
        <td style="text-align: center;">${cant}</td>
        <td class="monto">${rem}</td>
        <td class="monto">${noRem}</td>
        <td class="monto" style="color: #c2410c;">${desc}</td>
      </tr>`;
    })
    .join("");

  const words = numberToWords(d.neto_a_pagar);

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:11px;color:#333;padding:24px}
.header{border:2px solid #333;padding:12px;margin-bottom:12px}
.header-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.section-title{font-size:14px;font-weight:bold;text-align:center;background:#333;color:white;padding:4px;margin-bottom:8px;text-transform:uppercase}
.data-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;border:1px solid #ddd;padding:8px;background:#f9f9f9}
.data-label{font-size:9px;color:#666;text-transform:uppercase}
.data-val{font-weight:bold;color:#111}
table{width:100%;border-collapse:collapse;margin-bottom:16px}
th{background:#333;color:white;padding:6px 8px;text-align:left;font-size:10px}
td{padding:5px 8px;border-bottom:1px solid #ddd;font-size:10px}
.monto{text-align:right;font-family:monospace}
.footer-grid{display:grid;grid-template-columns:2fr 1fr;gap:12px;margin-top:24px;border-top:2px solid #333;padding-top:12px}
.signatures{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:48px;text-align:center}
.sig-line{border-top:1px dashed #333;margin-top:40px;padding-top:4px;font-size:9px}
</style></head><body>
<div class="section-title">
  ${d.tipo === "sac_1" || d.tipo === "sac_2" ? "Recibo de Sueldo Anual Complementario" : d.tipo === "indemnizacion" ? "Liquidación Final de Haberes" : "Recibo de Haberes"}
</div>
<div class="header">
  <div class="header-grid">
    <div>
      <p style="font-size:13px;font-weight:bold;">${d.consorcio_nombre}</p>
      <p>Domicilio: ${d.consorcio_direccion}</p>
      <p>CUIT: ${d.consorcio_cuit}</p>
    </div>
    <div style="text-align:right;">
      <p style="font-size:12px;font-weight:bold;">Período: ${mesNombre} ${anio}</p>
      <p>Tipo: ${d.tipo.toUpperCase()}</p>
    </div>
  </div>
</div>

<div class="data-grid">
  <div><p class="data-label">Empleado</p><p class="data-val">${d.empleado_nombre}</p></div>
  <div><p class="data-label">CUIL</p><p class="data-val">${d.empleado_cuil}</p></div>
  <div><p class="data-label">Legajo</p><p class="data-val">${d.empleado_legajo ?? "—"}</p></div>
  <div><p class="data-label">Fecha Ingreso</p><p class="data-val">${new Date(d.empleado_fecha_ingreso).toLocaleDateString("es-AR", { timeZone: "UTC" })}</p></div>
  <div><p class="data-label">Función</p><p class="data-val">${d.empleado_funcion}</p></div>
  <div><p class="data-label">Jornada / Cat.</p><p class="data-val">${d.empleado_jornada} · ${d.empleado_categoria_edificio}° Cat</p></div>
  <div><p class="data-label">Obra Social</p><p class="data-val">${d.obra_social ?? "—"} (${d.cod_obra_social ?? "—"})</p></div>
  <div><p class="data-label">Banco / CBU</p><p class="data-val">${d.banco ?? "—"} / ${d.cbu ?? "—"}</p></div>
</div>

<table>
  <thead>
    <tr>
      <th style="width: 60px;">Cód.</th>
      <th>Concepto</th>
      <th style="width: 50px; text-align: center;">Cant.</th>
      <th style="width: 90px; text-align: right;">Remunerativo</th>
      <th style="width: 90px; text-align: right;">No Remunerativo</th>
      <th style="width: 90px; text-align: right;">Descuentos</th>
    </tr>
  </thead>
  <tbody>
    ${conceptosRows}
    <tr style="font-weight: bold; background: #f5f5f5;">
      <td colspan="3">TOTALES</td>
      <td class="monto">${formatMoney(d.remuneracion_bruta)}</td>
      <td class="monto">${formatMoney(d.conceptos.filter(c => c.tipo === "no_remunerativo").reduce((sum, c) => sum + c.importe, 0))}</td>
      <td class="monto" style="color: #c2410c;">${formatMoney(d.total_descuentos_empleado)}</td>
    </tr>
  </tbody>
</table>

<div style="background: #333; color: white; padding: 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: bold;">
  <span>NETO A COBRAR:</span>
  <span style="font-size: 16px; font-family: monospace;">${formatMoney(d.neto_a_pagar)}</span>
</div>
<p style="margin-top: 8px; font-style: italic; font-size: 10px; color: #555;">${words}</p>

<div class="signatures">
  <div>
    <div class="sig-line">Firma del Empleador</div>
  </div>
  <div>
    <div class="sig-line">Firma del Empleado</div>
  </div>
</div>
</body></html>`;
}

export async function generateSueldoPdf(data: SueldoReceipt, outputDir: string): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });
  const safeCuil = data.empleado_cuil.replace(/[^0-9]/g, "");
  const dateObj = new Date(data.periodo);
  const periodStr = `${dateObj.getUTCFullYear()}_${String(dateObj.getUTCMonth() + 1).padStart(2, "0")}`;
  const filename = `recibo_${periodStr}_c${safeCuil}.pdf`;
  const filePath = path.join(outputDir, filename);

  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(buildSueldoHtml(data), { waitUntil: "networkidle0" });
    await page.pdf({ path: filePath, format: "A4", printBackground: true });
  } finally {
    await browser.close();
  }

  return filePath;
}

// ---------------------------------------------------------------------------
// Monthly and Annual Financial Reports Types
// ---------------------------------------------------------------------------

export interface MonthlyReportData {
  consorcio_nombre: string;
  consorcio_direccion: string;
  consorcio_cuit: string;
  anio: number;
  mes: number;
  total_gastos: number;
  total_pagos: number;
  total_prorrateado: number;
  gastos: Array<{
    categoria: number;
    descripcion: string;
    monto: number;
    tipo: string;
  }>;
  resCuentas: Array<{
    uf: string;
    propietario: string;
    coef_a: number;
    coef_b: number;
    saldo_anterior: number;
    su_pago: number;
    expensas_a: number;
    expensas_b: number;
    s_asamblea: number;
    otros: number;
    gast_part: number;
    deuda: number;
    intereses: number;
    total_pagar: number;
  }>;
}

export interface AnnualReportData {
  consorcio_nombre: string;
  consorcio_direccion: string;
  consorcio_cuit: string;
  anio: number;
  gastosPorCategoria: Array<{
    categoria: number;
    nombre: string;
    mensual: number[]; // 12 elements (Jan-Dec)
    total: number;
  }>;
  totalGastosMensual: number[]; // 12 elements
  totalGastosAnual: number;
  deudores: Array<{
    uf: string;
    propietario: string;
    saldo_pendiente: number;
  }>;
  fondoReservaMensual: number[]; // 12 elements
  totalFondoReservaAnual: number;
}

// ---------------------------------------------------------------------------
// HTML Builders for Reports
// ---------------------------------------------------------------------------

const CATEGORIA_LABELS: Record<number, string> = {
  1: "Sueldos y Cargas",
  2: "Servicios Públicos",
  3: "Abonos de Servicios",
  4: "Mantenimiento Común",
  5: "Reparaciones en Unidades",
  6: "Gastos Bancarios",
  7: "Gastos de Limpieza",
  8: "Gastos Administración",
  9: "Seguros",
  10: "Otros Gastos",
};

function buildMonthlyReportHtml(d: MonthlyReportData): string {
  const mesNombre = MONTH_NAMES[d.mes] ?? String(d.mes);

  // Group expenses by category
  const gastosGrouped: Record<number, typeof d.gastos> = {};
  d.gastos.forEach((g) => {
    const cat = g.categoria || 10;
    if (!gastosGrouped[cat]) gastosGrouped[cat] = [];
    gastosGrouped[cat].push(g);
  });

  let gastosRows = "";
  Object.keys(gastosGrouped)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((cat) => {
      const catLabel = CATEGORIA_LABELS[cat] ?? `Categoría ${cat}`;
      const items = gastosGrouped[cat];
      const catTotal = items.reduce((sum, g) => sum + g.monto, 0);

      gastosRows += `<tr class="category-header"><td colspan="3">${catLabel}</td><td class="monto">${formatMoney(catTotal)}</td></tr>`;
      items.forEach((g) => {
        const typeLabel = g.tipo === "A" ? "Ord. A" : g.tipo === "B" ? "Ext. B" : "Part.";
        gastosRows += `<tr>
          <td style="padding-left: 20px;">${g.descripcion}</td>
          <td style="text-align: center; color: #666; font-size: 10px;">${typeLabel}</td>
          <td colspan="2" class="monto" style="color: #444;">${formatMoney(g.monto)}</td>
        </tr>`;
      });
    });

  // Prorrateo rows
  let prRows = "";
  let totCoefA = 0, totCoefB = 0, totSaldoAnt = 0, totSuPago = 0, totDeuda = 0, totInt = 0;
  let totExpA = 0, totExpB = 0, totFondo = 0, totPart = 0, totMes = 0, totPagar = 0;

  d.resCuentas.forEach((r) => {
    const coefA = Number(r.coef_a || 0);
    const coefB = Number(r.coef_b || 0);
    const saldoAnt = Number(r.saldo_anterior || 0);
    const suPago = Number(r.su_pago || 0);
    const deuda = Number(r.deuda || 0);
    const intereses = Number(r.intereses || 0);
    const expA = Number(r.expensas_a || 0);
    const expB = Number(r.expensas_b || 0);
    const fondo = Number(r.s_asamblea || 0) + Number(r.otros || 0);
    const part = Number(r.gast_part || 0);
    const totalMes = expA + expB + r.s_asamblea + r.otros + part;
    const totalPagar = Number(r.total_pagar || 0);

    totCoefA += coefA; totCoefB += coefB; totSaldoAnt += saldoAnt; totSuPago += suPago;
    totDeuda += deuda; totInt += intereses; totExpA += expA; totExpB += expB;
    totFondo += fondo; totPart += part; totMes += totalMes; totPagar += totalPagar;

    prRows += `<tr>
      <td style="font-weight: bold; text-align: center;">${r.uf}</td>
      <td style="font-size: 10px; max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${r.propietario || "—"}</td>
      <td class="monto" style="font-size: 10px;">${coefA.toFixed(4)}%</td>
      <td class="monto" style="font-size: 10px;">${coefB.toFixed(4)}%</td>
      <td class="monto">${formatMoney(saldoAnt)}</td>
      <td class="monto" style="color: green;">${formatMoney(suPago)}</td>
      <td class="monto">${formatMoney(deuda)}</td>
      <td class="monto">${formatMoney(intereses)}</td>
      <td class="monto">${formatMoney(expA)}</td>
      <td class="monto">${formatMoney(expB)}</td>
      <td class="monto">${formatMoney(fondo)}</td>
      <td class="monto">${formatMoney(part)}</td>
      <td class="monto" style="font-weight: bold;">${formatMoney(totalMes)}</td>
      <td class="monto" style="font-weight: bold; background: #f9fafb;">${formatMoney(totalPagar)}</td>
    </tr>`;
  });

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:11px;color:#333;padding:24px}
.header{border-bottom:3px solid #1a3c5e;padding-bottom:12px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end}
.header h1{font-size:18px;color:#1a3c5e}
.header p{font-size:11px;color:#555;margin-top:2px}
.badge{background:#1a3c5e;color:white;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:bold;text-align:right}
.page-title{font-size:14px;font-weight:bold;text-transform:uppercase;color:#1a3c5e;margin-bottom:12px;border-bottom:1px solid #1a3c5e;padding-bottom:4px}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
th{background:#1a3c5e;color:white;padding:6px 8px;text-align:left;font-size:10px}
td{padding:5px 8px;border-bottom:1px solid #e8ecf0}
.monto{text-align:right;font-family:monospace;font-size:10.5px}
.category-header{background:#f1f5f9;font-weight:bold;color:#1e293b}
.category-header td{border-top:1px solid #cbd5e1;border-bottom:1.5px solid #94a3b8}
.total-row td{font-size:11px;font-weight:bold;background:#e2e8f0;border-top:2px solid #64748b}
.page-break{page-break-before:always}
.summary-box{display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;margin-top:24px}
.card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;text-align:center}
.card h3{font-size:10px;text-transform:uppercase;color:#64748b;margin-bottom:6px}
.card p{font-size:16px;font-weight:bold;color:#1a3c5e}
</style></head><body>

<!-- PAGE 1: GASTOS -->
<div class="header">
  <div>
    <h1>${d.consorcio_nombre}</h1>
    <p>${d.consorcio_direccion} | CUIT: ${d.consorcio_cuit}</p>
  </div>
  <div class="badge">Rendición Mensual — ${mesNombre} ${d.anio}</div>
</div>

<div class="page-title">Detalle de Gastos del Período</div>
<table>
  <thead>
    <tr>
      <th>Descripción del Gasto</th>
      <th style="width: 80px; text-align: center;">Tipo</th>
      <th style="width: 120px; text-align: right;" colspan="2">Monto</th>
    </tr>
  </thead>
  <tbody>
    ${gastosRows}
    <tr class="total-row">
      <td colspan="2">TOTAL GASTOS EXPENSAS</td>
      <td class="monto" colspan="2" style="font-size:12px;">${formatMoney(d.total_gastos)}</td>
    </tr>
  </tbody>
</table>

<!-- PAGE 2: PRORRATEO (LANDSCAPE-BREAK) -->
<div class="page-break"></div>
<div class="header">
  <div>
    <h1>${d.consorcio_nombre}</h1>
    <p>Planilla de Prorrateo, Saldos y Cobranzas</p>
  </div>
  <div class="badge">${mesNombre} ${d.anio}</div>
</div>

<div class="page-title">Distribución y Cuenta Corriente de Co-propietarios</div>
<table style="width: 100%; table-layout: fixed;">
  <thead>
    <tr style="font-size: 9px;">
      <th style="width: 32px; text-align: center; padding: 4px 2px;">UF</th>
      <th style="width: 130px; padding: 4px 2px;">Propietario</th>
      <th style="width: 50px; text-align: right; padding: 4px 2px;">Coef A</th>
      <th style="width: 50px; text-align: right; padding: 4px 2px;">Coef B</th>
      <th style="width: 65px; text-align: right; padding: 4px 2px;">Saldo Ant.</th>
      <th style="width: 65px; text-align: right; padding: 4px 2px;">Pago Mes</th>
      <th style="width: 65px; text-align: right; padding: 4px 2px;">Deuda</th>
      <th style="width: 45px; text-align: right; padding: 4px 2px;">Int.</th>
      <th style="width: 65px; text-align: right; padding: 4px 2px;">Exp. A</th>
      <th style="width: 65px; text-align: right; padding: 4px 2px;">Exp. B</th>
      <th style="width: 60px; text-align: right; padding: 4px 2px;">Fondo/Otr</th>
      <th style="width: 50px; text-align: right; padding: 4px 2px;">Part.</th>
      <th style="width: 70px; text-align: right; padding: 4px 2px;">Total Mes</th>
      <th style="width: 75px; text-align: right; padding: 4px 2px;">Total Pagar</th>
    </tr>
  </thead>
  <tbody>
    ${prRows}
    <tr class="total-row" style="font-size: 9.5px;">
      <td style="text-align: center;">-</td>
      <td>TOTALES CONSOLIDADOS</td>
      <td class="monto" style="font-size: 9.5px;">${totCoefA.toFixed(2)}%</td>
      <td class="monto" style="font-size: 9.5px;">${totCoefB.toFixed(2)}%</td>
      <td class="monto">${formatMoney(totSaldoAnt)}</td>
      <td class="monto" style="color: green;">${formatMoney(totSuPago)}</td>
      <td class="monto">${formatMoney(totDeuda)}</td>
      <td class="monto">${formatMoney(totInt)}</td>
      <td class="monto">${formatMoney(totExpA)}</td>
      <td class="monto">${formatMoney(totExpB)}</td>
      <td class="monto">${formatMoney(totFondo)}</td>
      <td class="monto">${formatMoney(totPart)}</td>
      <td class="monto">${formatMoney(totMes)}</td>
      <td class="monto" style="font-size: 11px;">${formatMoney(totPagar)}</td>
    </tr>
  </tbody>
</table>

<!-- PAGE 3: SUMMARY -->
<div class="page-break"></div>
<div class="header">
  <div>
    <h1>${d.consorcio_nombre}</h1>
    <p>Consolidación de Caja y Estado Financiero</p>
  </div>
  <div class="badge">${mesNombre} ${d.anio}</div>
</div>

<div class="page-title">Conciliación de Cuentas del Período</div>
<div class="summary-box">
  <div class="card">
    <h3>Total Facturado en el Mes</h3>
    <p>${formatMoney(totMes)}</p>
  </div>
  <div class="card" style="border-color: #bbf7d0; background: #f0fdf4;">
    <h3>Total Recaudado (Cobranzas)</h3>
    <p style="color: #166534;">${formatMoney(totSuPago)}</p>
  </div>
  <div class="card" style="border-color: #fecaca; background: #fdf2f2;">
    <h3>Saldo Pendiente Acumulado</h3>
    <p style="color: #991b1b;">${formatMoney(totPagar)}</p>
  </div>
</div>

<table style="margin-top: 40px; width: 600px; margin-left: auto; margin-right: auto;">
  <thead>
    <tr>
      <th colspan="2" style="text-align: center;">Resumen General Contable</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Gastos del Mes (Total Prorrateado A y B)</td>
      <td class="monto" style="font-weight: bold;">${formatMoney(d.total_gastos)}</td>
    </tr>
    <tr>
      <td>Sobre cuota Asamblea (Fondo de Reserva / Otros) Facturado</td>
      <td class="monto">${formatMoney(totFondo)}</td>
    </tr>
    <tr>
      <td>Gastos Particulares Facturados</td>
      <td class="monto">${formatMoney(totPart)}</td>
    </tr>
    <tr style="background: #f8fafc; font-weight: bold;">
      <td>Total Billed (Total Mes)</td>
      <td class="monto">${formatMoney(totMes)}</td>
    </tr>
    <tr>
      <td>Saldos Anteriores no Cancelados (Arrastre)</td>
      <td class="monto">${formatMoney(totSaldoAnt)}</td>
    </tr>
    <tr style="background: #f1f5f9; font-weight: bold; font-size: 12px; color: #1a3c5e;">
      <td>Subtotal General a Cobrar</td>
      <td class="monto">${formatMoney(totSaldoAnt + totMes)}</td>
    </tr>
  </tbody>
</table>

</body></html>`;
}

function buildAnnualReportHtml(d: AnnualReportData): string {
  // Build categories table
  let catRows = "";
  d.gastosPorCategoria.forEach((cat) => {
    let monthlyCells = "";
    cat.mensual.forEach((monto) => {
      monthlyCells += `<td class="monto" style="font-size: 9px;">${monto > 0 ? formatMoney(monto).replace("$", "") : "—"}</td>`;
    });
    catRows += `<tr>
      <td style="font-weight: bold; font-size: 9.5px; width: 140px;">${cat.nombre}</td>
      ${monthlyCells}
      <td class="monto" style="font-weight: bold; background: #f8fafc;">${formatMoney(cat.total)}</td>
    </tr>`;
  });

  // Build total monthly row
  let monthlyTotalCells = "";
  d.totalGastosMensual.forEach((monto) => {
    monthlyTotalCells += `<td class="monto" style="font-weight: bold; font-size: 9.5px;">${monto > 0 ? formatMoney(monto).replace("$", "") : "—"}</td>`;
  });

  // Build reserve fund monthly row
  let fundMonthlyCells = "";
  d.fondoReservaMensual.forEach((monto) => {
    fundMonthlyCells += `<td class="monto" style="font-size: 9px; color: #475569;">${monto > 0 ? formatMoney(monto).replace("$", "") : "—"}</td>`;
  });

  // Build debtors list
  let debRows = "";
  let totDeudaCierre = 0;
  if (d.deudores.length === 0) {
    debRows = `<tr><td colspan="3" style="text-align: center; color: #888; padding: 12px;">Sin propietarios deudores al cierre del ejercicio.</td></tr>`;
  } else {
    d.deudores.forEach((deb) => {
      totDeudaCierre += deb.saldo_pendiente;
      debRows += `<tr>
        <td style="text-align: center; font-weight: bold;">UF ${deb.uf}</td>
        <td>${deb.propietario || "—"}</td>
        <td class="monto" style="color: #991b1b; font-weight: bold;">${formatMoney(deb.saldo_pendiente)}</td>
      </tr>`;
    });
  }

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:10.5px;color:#333;padding:24px}
.header{border-bottom:3px solid #1a3c5e;padding-bottom:12px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end}
.header h1{font-size:18px;color:#1a3c5e}
.header p{font-size:11px;color:#555;margin-top:2px}
.badge{background:#1a3c5e;color:white;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:bold;text-align:right}
.page-title{font-size:14px;font-weight:bold;text-transform:uppercase;color:#1a3c5e;margin-bottom:12px;border-bottom:1px solid #1a3c5e;padding-bottom:4px}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
th{background:#1a3c5e;color:white;padding:6px 8px;text-align:left;font-size:9.5px}
td{padding:5px 6px;border-bottom:1px solid #e8ecf0}
.monto{text-align:right;font-family:monospace}
.total-row td{font-size:10px;font-weight:bold;background:#e2e8f0;border-top:2px solid #64748b}
.page-break{page-break-before:always}
.grid-2{display:grid;grid-template-columns:1.5fr 1fr;gap:24px}
</style></head><body>

<!-- PAGE 1: ANUAL MATRIX -->
<div class="header">
  <div>
    <h1>${d.consorcio_nombre}</h1>
    <p>${d.consorcio_direccion} | CUIT: ${d.consorcio_cuit}</p>
  </div>
  <div class="badge">Rendición Anual de Cuentas — Ejercicio ${d.anio}</div>
</div>

<div class="page-title">Evolución Mensual de Gastos por Categoría</div>
<table style="width: 100%;">
  <thead>
    <tr>
      <th>Categoría del Gasto</th>
      <th style="width: 50px; text-align: right;">Ene</th>
      <th style="width: 50px; text-align: right;">Feb</th>
      <th style="width: 50px; text-align: right;">Mar</th>
      <th style="width: 50px; text-align: right;">Abr</th>
      <th style="width: 50px; text-align: right;">May</th>
      <th style="width: 50px; text-align: right;">Jun</th>
      <th style="width: 50px; text-align: right;">Jul</th>
      <th style="width: 50px; text-align: right;">Ago</th>
      <th style="width: 50px; text-align: right;">Sep</th>
      <th style="width: 50px; text-align: right;">Oct</th>
      <th style="width: 50px; text-align: right;">Nov</th>
      <th style="width: 50px; text-align: right;">Dic</th>
      <th style="width: 70px; text-align: right; background: #132b43;">Total Anual</th>
    </tr>
  </thead>
  <tbody>
    ${catRows}
    <tr class="total-row">
      <td>TOTAL GASTOS ORDINARIOS / EXTRAORDINARIOS</td>
      ${monthlyTotalCells}
      <td class="monto" style="font-size:11px; background: #cbd5e1;">${formatMoney(d.total_gastosAnual)}</td>
    </tr>
  </tbody>
</table>

<!-- PAGE 2: DEBTORS & RESERVES -->
<div class="page-break"></div>
<div class="header">
  <div>
    <h1>${d.consorcio_nombre}</h1>
    <p>Saldos de Cierre y Fondos de Reserva</p>
  </div>
  <div class="badge">Ejercicio ${d.anio}</div>
</div>

<div class="grid-2">
  <div>
    <div class="page-title">Estado de Deudas al Cierre de Ejercicio (31/12)</div>
    <table>
      <thead>
        <tr>
          <th style="width: 60px; text-align: center;">Unidad</th>
          <th>Propietario / Co-propietario</th>
          <th style="width: 100px; text-align: right;">Saldo Pendiente</th>
        </tr>
      </thead>
      <tbody>
        ${debRows}
        <tr class="total-row" style="background: #fecaca; color: #991b1b;">
          <td colspan="2">DEUDA CONSOLIDADA TOTAL AL CIERRE</td>
          <td class="monto" style="font-size: 11px;">${formatMoney(totDeudaCierre)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div>
    <div class="page-title">Evolución de Fondos de Reserva Facturados</div>
    <table style="margin-top: 10px;">
      <thead>
        <tr>
          <th>Mes</th>
          <th style="text-align: right;">Monto Facturado</th>
        </tr>
      </thead>
      <tbody>
        ${MONTH_NAMES.slice(1).map((mNombre, idx) => {
          const val = d.fondoReservaMensual[idx] || 0;
          return `<tr>
            <td style="font-weight: bold;">${mNombre}</td>
            <td class="monto">${val > 0 ? formatMoney(val) : "—"}</td>
          </tr>`;
        }).join("")}
        <tr class="total-row" style="background: #e2e8f0;">
          <td>TOTAL FONDO RECAUDADO</td>
          <td class="monto">${formatMoney(d.totalFondoReservaAnual)}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

</body></html>`;
}

export async function generateMonthlyReportPdf(data: MonthlyReportData, outputDir: string): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });
  const filename = `rendicion_mensual_${data.anio}_${String(data.mes).padStart(2, "0")}.pdf`;
  const filePath = path.join(outputDir, filename);

  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(buildMonthlyReportHtml(data), { waitUntil: "networkidle0" });
    
    // We render as Landscape A4 to fit the multi-column table beautifully
    await page.pdf({ 
      path: filePath, 
      format: "A4", 
      landscape: true, 
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" }
    });
  } finally {
    await browser.close();
  }

  return filePath;
}

export async function generateAnnualReportPdf(data: AnnualReportData, outputDir: string): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });
  const filename = `informe_anual_${data.anio}.pdf`;
  const filePath = path.join(outputDir, filename);

  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(buildAnnualReportHtml(data), { waitUntil: "networkidle0" });
    
    // A4 Landscape for annual matrix table
    await page.pdf({ 
      path: filePath, 
      format: "A4", 
      landscape: true, 
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" }
    });
  } finally {
    await browser.close();
  }

  return filePath;
}


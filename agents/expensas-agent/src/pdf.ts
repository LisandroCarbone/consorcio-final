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

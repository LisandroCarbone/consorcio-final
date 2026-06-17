export interface ExpensaData {
  // Consorcio
  consorcio_nombre: string;
  consorcio_direccion: string;
  consorcio_cuit?: string;

  // Unidad
  unidad_numero: string;
  ocupante_nombre: string;

  // Periodo
  anio: number;
  mes: number;
  fecha_vencimiento?: string;

  // Montos
  monto_ordinario: number;
  monto_extraordinario: number;
  monto_fondo_reserva: number;
  monto_total: number;

  // Gastos detallados (opcional)
  gastos?: Array<{ concepto: string; monto: number; tipo: string }>;
}

const MONTH_NAMES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
}

export function buildExpensaHtml(data: ExpensaData): string {
  const mesNombre = MONTH_NAMES[data.mes] ?? String(data.mes);
  const gastosRows = (data.gastos ?? [])
    .map(
      (g) => `
      <tr>
        <td>${g.concepto}</td>
        <td class="tipo ${g.tipo}">${g.tipo}</td>
        <td class="monto">${formatMoney(g.monto)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #333; padding: 32px; }
    .header { border-bottom: 3px solid #1a3c5e; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 20px; color: #1a3c5e; }
    .header p { color: #666; margin-top: 4px; }
    .badge { display: inline-block; background: #1a3c5e; color: white; padding: 4px 12px; border-radius: 4px; font-size: 11px; margin-top: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .card { background: #f5f7fa; border-radius: 6px; padding: 14px; }
    .card h3 { font-size: 11px; text-transform: uppercase; color: #888; margin-bottom: 8px; letter-spacing: 0.5px; }
    .card p { font-size: 14px; font-weight: 600; color: #1a3c5e; }
    .card .sub { font-size: 11px; color: #666; font-weight: normal; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #1a3c5e; color: white; padding: 8px 10px; text-align: left; font-size: 11px; }
    td { padding: 7px 10px; border-bottom: 1px solid #e8ecf0; }
    tr:last-child td { border-bottom: none; }
    .monto { text-align: right; font-family: monospace; }
    .tipo { font-size: 10px; color: #888; }
    .summary { background: #1a3c5e; color: white; border-radius: 6px; padding: 16px; }
    .summary table { margin-bottom: 0; }
    .summary td { border-color: rgba(255,255,255,0.15); color: white; }
    .summary .total-row td { font-size: 16px; font-weight: 700; border-top: 2px solid rgba(255,255,255,0.4); }
    .footer { margin-top: 24px; font-size: 10px; color: #aaa; text-align: center; }
    .vencimiento { background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 8px 12px; margin-bottom: 16px; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.consorcio_nombre}</h1>
    <p>${data.consorcio_direccion}</p>
    ${data.consorcio_cuit ? `<p>CUIT: ${data.consorcio_cuit}</p>` : ""}
    <span class="badge">Liquidación de Expensas — ${mesNombre} ${data.anio}</span>
  </div>

  <div class="grid">
    <div class="card">
      <h3>Unidad</h3>
      <p>Depto. ${data.unidad_numero}</p>
    </div>
    <div class="card">
      <h3>Propietario / Inquilino</h3>
      <p>${data.ocupante_nombre}</p>
    </div>
    <div class="card">
      <h3>Período</h3>
      <p>${mesNombre} ${data.anio}</p>
    </div>
    <div class="card">
      <h3>Vencimiento</h3>
      <p>${data.fecha_vencimiento ?? "—"}</p>
      ${data.fecha_vencimiento ? '<p class="sub">Pasada esta fecha aplican intereses</p>' : ""}
    </div>
  </div>

  ${
    data.fecha_vencimiento
      ? `<div class="vencimiento">⚠️ Abonando después del <strong>${data.fecha_vencimiento}</strong> corresponde recargo por mora.</div>`
      : ""
  }

  ${
    gastosRows
      ? `<table>
      <thead><tr><th>Concepto</th><th>Tipo</th><th style="text-align:right">Monto</th></tr></thead>
      <tbody>${gastosRows}</tbody>
    </table>`
      : ""
  }

  <div class="summary">
    <table>
      <tr><td>Expensas ordinarias</td><td class="monto">${formatMoney(data.monto_ordinario)}</td></tr>
      ${data.monto_extraordinario > 0 ? `<tr><td>Expensas extraordinarias</td><td class="monto">${formatMoney(data.monto_extraordinario)}</td></tr>` : ""}
      ${data.monto_fondo_reserva > 0 ? `<tr><td>Fondo de reserva</td><td class="monto">${formatMoney(data.monto_fondo_reserva)}</td></tr>` : ""}
      <tr class="total-row"><td><strong>TOTAL A PAGAR</strong></td><td class="monto"><strong>${formatMoney(data.monto_total)}</strong></td></tr>
    </table>
  </div>

  <div class="footer">
    Este comprobante fue generado automáticamente por el sistema de administración de ${data.consorcio_nombre}.
  </div>
</body>
</html>`;
}

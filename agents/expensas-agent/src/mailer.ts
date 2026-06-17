import nodemailer from "nodemailer";

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

function getMailConfig(): MailConfig {
  return {
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "",
  };
}

export async function sendExpensaEmail(opts: {
  to: string;
  ocupante_nombre: string;
  consorcio_nombre: string;
  unidad_numero: string;
  mes_nombre: string;
  anio: number;
  monto_total: number;
  fecha_vencimiento?: string;
  pdf_path: string;
}): Promise<void> {
  const cfg = getMailConfig();
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });

  const montoStr = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(opts.monto_total);
  const vencStr = opts.fecha_vencimiento ? `<p>📅 <strong>Fecha de vencimiento:</strong> ${opts.fecha_vencimiento}</p>` : "";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1a3c5e;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="color:white;margin:0">${opts.consorcio_nombre}</h2>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0">Liquidación de Expensas — ${opts.mes_nombre} ${opts.anio}</p>
      </div>
      <div style="background:#f5f7fa;padding:24px;border-radius:0 0 8px 8px">
        <p>Estimado/a <strong>${opts.ocupante_nombre}</strong>,</p>
        <p style="margin-top:12px">Le informamos que ya está disponible la liquidación de expensas correspondiente al mes de <strong>${opts.mes_nombre} ${opts.anio}</strong> para la unidad <strong>${opts.unidad_numero}</strong>.</p>
        <div style="background:white;border:1px solid #e8ecf0;border-radius:6px;padding:16px;margin:20px 0;text-align:center">
          <p style="color:#888;font-size:12px;margin:0">TOTAL A PAGAR</p>
          <p style="font-size:32px;font-weight:700;color:#1a3c5e;margin:8px 0">${montoStr}</p>
          ${vencStr}
        </div>
        <p style="font-size:12px;color:#666">Encontrará el recibo detallado adjunto a este correo.</p>
        <p style="font-size:12px;color:#999;margin-top:24px">Este mensaje fue generado automáticamente. Por consultas, responda este email.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${opts.consorcio_nombre}" <${cfg.from}>`,
    to: opts.to,
    subject: `Expensas ${opts.mes_nombre} ${opts.anio} — Unidad ${opts.unidad_numero} — ${montoStr}`,
    html,
    attachments: [
      {
        filename: `Expensas_${opts.mes_nombre}_${opts.anio}_${opts.unidad_numero}.pdf`,
        path: opts.pdf_path,
      },
    ],
  });
}

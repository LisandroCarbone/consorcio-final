import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as twilio from "./providers/twilio.js";
import * as meta from "./providers/meta.js";

const server = new McpServer({ name: "mcp-whatsapp", version: "0.1.0" });

// Which provider to use: "twilio" (default) or "meta"
const PROVIDER = (process.env.WA_PROVIDER ?? "twilio") as "twilio" | "meta";

async function doSend(to: string, body: string): Promise<string> {
  if (PROVIDER === "meta") return meta.sendMessage(to, body);
  return twilio.sendMessage(to, body);
}

// ── send_message ─────────────────────────────────────────────────────────────
server.tool(
  "send_whatsapp_message",
  "Send a WhatsApp message to a single recipient. Phone number must include country code (e.g. +5491112345678).",
  {
    to: z.string().describe("Recipient phone number with country code, e.g. +5491112345678"),
    message: z.string().min(1).describe("Message text to send"),
  },
  async ({ to, message }) => {
    try {
      const msgId = await doSend(to, message);
      return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, message_id: msgId, to }) }] };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text" as const, text: `Error: ${msg}` }], isError: true };
    }
  }
);

// ── send_bulk ─────────────────────────────────────────────────────────────────
server.tool(
  "send_whatsapp_bulk",
  "Send the same WhatsApp message to multiple recipients (e.g. circular to all residents). Returns per-recipient results.",
  {
    recipients: z.array(z.object({
      phone: z.string(),
      name: z.string().optional(),
    })).min(1),
    message: z.string().min(1).describe("Message text. Use {{name}} to personalize with recipient name."),
    delay_ms: z.number().int().min(0).default(300).describe("Delay between messages in milliseconds to avoid rate limiting"),
  },
  async ({ recipients, message, delay_ms }) => {
    const results: Array<{ phone: string; success: boolean; message_id?: string; error?: string }> = [];

    for (const recipient of recipients) {
      const personalizedMsg = recipient.name
        ? message.replace(/\{\{name\}\}/g, recipient.name)
        : message;

      try {
        const msgId = await doSend(recipient.phone, personalizedMsg);
        results.push({ phone: recipient.phone, success: true, message_id: msgId });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        results.push({ phone: recipient.phone, success: false, error: errMsg });
      }

      if (delay_ms > 0) {
        await new Promise((r) => setTimeout(r, delay_ms));
      }
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ sent, failed, results }),
      }],
    };
  }
);

// ── send_expensa_notification ─────────────────────────────────────────────────
server.tool(
  "send_expensa_whatsapp_notification",
  "Send a WhatsApp notification to a resident about their monthly expensa.",
  {
    to: z.string(),
    ocupante_nombre: z.string(),
    consorcio_nombre: z.string(),
    unidad_numero: z.string(),
    mes_nombre: z.string(),
    anio: z.number().int(),
    monto_total: z.number(),
    fecha_vencimiento: z.string().optional(),
  },
  async (args) => {
    try {
      const montoStr = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(args.monto_total);
      const venc = args.fecha_vencimiento ? `\n📅 Vencimiento: *${args.fecha_vencimiento}*` : "";

      const message = [
        `🏢 *${args.consorcio_nombre}*`,
        ``,
        `Hola ${args.ocupante_nombre} 👋`,
        ``,
        `Tu liquidación de expensas de *${args.mes_nombre} ${args.anio}* ya está disponible.`,
        ``,
        `🏠 Unidad: *${args.unidad_numero}*`,
        `💰 Total a pagar: *${montoStr}*${venc}`,
        ``,
        `Te enviamos el recibo por email. Ante cualquier consulta, respondé este mensaje.`,
      ].join("\n");

      const msgId = await doSend(args.to, message);
      return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, message_id: msgId }) }] };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text" as const, text: `Error: ${msg}` }], isError: true };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`mcp-whatsapp server running (provider: ${PROVIDER})`);

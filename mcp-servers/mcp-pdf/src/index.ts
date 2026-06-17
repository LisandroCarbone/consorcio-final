import fs from "fs/promises";
import path from "path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import puppeteer from "puppeteer";
import { z } from "zod";
import { buildExpensaHtml, type ExpensaData } from "./template.js";

const server = new McpServer({ name: "mcp-pdf", version: "0.1.0" });

const OUTPUT_DIR = process.env.PDF_OUTPUT_DIR ?? "./pdfs";

async function ensureOutputDir(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function htmlToPdf(html: string, filename: string): Promise<string> {
  await ensureOutputDir();
  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const filePath = path.join(OUTPUT_DIR, filename);
    await page.pdf({ path: filePath, format: "A4", margin: { top: "0", bottom: "0", left: "0", right: "0" } });
    return filePath;
  } finally {
    await browser.close();
  }
}

// Tool: generate_expensa_pdf
server.tool(
  "generate_expensa_pdf",
  "Generate a PDF receipt for an expensa and save it to disk. Returns the file path.",
  {
    consorcio_nombre: z.string(),
    consorcio_direccion: z.string(),
    consorcio_cuit: z.string().optional(),
    unidad_numero: z.string(),
    ocupante_nombre: z.string(),
    anio: z.number().int(),
    mes: z.number().int().min(1).max(12),
    fecha_vencimiento: z.string().optional(),
    monto_ordinario: z.number(),
    monto_extraordinario: z.number().default(0),
    monto_fondo_reserva: z.number().default(0),
    monto_total: z.number(),
    gastos: z
      .array(z.object({ concepto: z.string(), monto: z.number(), tipo: z.string() }))
      .optional(),
    filename: z.string().optional(),
  },
  async (args) => {
    try {
      const data = args as unknown as ExpensaData;
      const safeUnidad = String(args.unidad_numero).replace(/[^a-zA-Z0-9]/g, "_");
      const filename = String(args.filename ?? `expensa_${args.anio}_${String(args.mes).padStart(2, "0")}_u${safeUnidad}.pdf`);
      const html = buildExpensaHtml(data);
      const filePath = await htmlToPdf(html, filename);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ success: true, path: filePath, filename }) }],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text" as const, text: `Error: ${msg}` }], isError: true };
    }
  }
);

// Tool: generate_expensa_html (useful for preview / email inline)
server.tool(
  "generate_expensa_html",
  "Generate the HTML string for an expensa receipt (useful for email body or preview).",
  {
    consorcio_nombre: z.string(),
    consorcio_direccion: z.string(),
    consorcio_cuit: z.string().optional(),
    unidad_numero: z.string(),
    ocupante_nombre: z.string(),
    anio: z.number().int(),
    mes: z.number().int().min(1).max(12),
    fecha_vencimiento: z.string().optional(),
    monto_ordinario: z.number(),
    monto_extraordinario: z.number().default(0),
    monto_fondo_reserva: z.number().default(0),
    monto_total: z.number(),
    gastos: z
      .array(z.object({ concepto: z.string(), monto: z.number(), tipo: z.string() }))
      .optional(),
  },
  async (args) => {
    try {
      const html = buildExpensaHtml(args as unknown as ExpensaData);
      return { content: [{ type: "text" as const, text: html }] };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text" as const, text: `Error: ${msg}` }], isError: true };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("mcp-pdf server running on stdio");

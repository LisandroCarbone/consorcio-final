/**
 * Comms Agent HTTP server.
 *
 * Endpoints:
 *   POST /webhook/twilio   — Twilio WhatsApp webhook (form-urlencoded)
 *   POST /webhook/meta     — Meta WhatsApp Cloud API webhook (JSON)
 *   GET  /webhook/meta     — Meta webhook verification challenge
 *   POST /send-circular    — Admin endpoint to send a message to all residents
 *   GET  /health
 */

import http from "http";
import { query, queryOne, pool } from "./db.js";
import { classifyMessage } from "./classifier.js";
import { sendReply } from "./whatsapp.js";

const PORT = Number(process.env.COMMS_PORT ?? 3002);
const API_KEY = process.env.AGENT_API_KEY ?? "";
const ADMIN_PHONE = process.env.ADMIN_WHATSAPP_PHONE ?? "";
const META_VERIFY_TOKEN = process.env.META_WA_VERIFY_TOKEN ?? "consorcio_verify";

// ── Lookup resident by phone ──────────────────────────────────────────────────

interface ResidentContext {
  consorcio_id: number;
  consorcio_nombre: string;
  ocupante_nombre: string | null;
  unidad_numero: string | null;
  persona_id: number | null;
}

async function lookupResident(phone: string): Promise<ResidentContext | null> {
  // Normalize: keep digits and leading +
  const normalized = phone.replace(/[^+\d]/g, "");
  return queryOne<ResidentContext>(
    `SELECT c.id AS consorcio_id, c.nombre AS consorcio_nombre,
            p.nombre || ' ' || p.apellido AS ocupante_nombre,
            u.numero AS unidad_numero,
            p.id AS persona_id
     FROM personas p
     JOIN ocupantes o ON o.persona_id = p.id AND o.activo = true
     JOIN unidades u ON u.id = o.unidad_id
     JOIN consorcios c ON c.id = u.consorcio_id
     WHERE p.whatsapp = $1 OR p.telefono = $1
     LIMIT 1`,
    [normalized]
  );
}

// ── Auto-create ticket from reclamo ──────────────────────────────────────────

async function createTicketFromMessage(
  resident: ResidentContext,
  summary: string,
  issueType: string | undefined,
  urgency: string | undefined,
  originalMessage: string
): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `INSERT INTO tickets (consorcio_id, titulo, descripcion, categoria, prioridad, canal_origen)
     VALUES ($1, $2, $3, $4, $5, 'whatsapp') RETURNING id`,
    [
      resident.consorcio_id,
      summary,
      originalMessage,
      issueType ?? "general",
      urgency ?? "normal",
    ]
  );
  return row?.id ?? 0;
}

// ── Process incoming message ──────────────────────────────────────────────────

async function processIncoming(phone: string, message: string): Promise<void> {
  console.log(`📩 Incoming from ${phone}: ${message}`);

  const resident = await lookupResident(phone);
  const context = resident
    ? {
        phone,
        consorcio_nombre: resident.consorcio_nombre,
        ocupante_nombre: resident.ocupante_nombre ?? undefined,
      }
    : { phone };

  let classification;
  try {
    classification = await classifyMessage(message, context);
  } catch (err) {
    console.error("Classifier error:", err);
    await sendReply(
      phone,
      "Gracias por tu mensaje. Lo recibimos y te contactaremos a la brevedad. 🏢"
    );
    return;
  }

  console.log(`   Category: ${classification.category} (${classification.confidence}) | human: ${classification.requires_human}`);

  // Auto-create ticket for reclamos
  if (classification.category === "reclamo" && resident) {
    const ticketId = await createTicketFromMessage(
      resident,
      classification.summary,
      classification.extracted_data.issue_type,
      classification.extracted_data.urgency,
      message
    );
    console.log(`   Ticket #${ticketId} created`);

    // Notify admin for urgent/high priority
    const urgency = classification.extracted_data.urgency ?? "normal";
    if ((urgency === "urgente" || urgency === "alta" || classification.requires_human) && ADMIN_PHONE) {
      const adminMsg = [
        `🚨 *Nuevo reclamo${urgency === "urgente" ? " URGENTE" : ""}*`,
        `Ticket #${ticketId}`,
        `Vecino: ${resident.ocupante_nombre ?? phone} (Unidad ${resident.unidad_numero ?? "?"})`,
        `Problema: ${classification.summary}`,
        `Mensaje original: "${message}"`,
      ].join("\n");
      await sendReply(ADMIN_PHONE, adminMsg).catch((e) => console.error("Admin notify error:", e));
    }
  }

  // Send auto-response (unless it requires immediate human and we don't have a good response)
  const response = classification.requires_human && classification.category === "reclamo"
    ? `Hola ${resident?.ocupante_nombre?.split(" ")[0] ?? ""}! Recibimos tu reclamo y lo registramos. El administrador se va a comunicar con vos a la brevedad. 🙏`
    : classification.suggested_response;

  await sendReply(phone, response);
  console.log(`   Reply sent: ${response.substring(0, 80)}...`);
}

// ── Circular broadcast ────────────────────────────────────────────────────────

async function sendCircular(consorcio_id: number, message: string): Promise<{ sent: number; failed: number }> {
  const recipients = await query<{ whatsapp: string | null; nombre: string; apellido: string }>(
    `SELECT DISTINCT p.whatsapp, p.nombre, p.apellido
     FROM personas p
     JOIN ocupantes o ON o.persona_id = p.id AND o.activo = true
     JOIN unidades u ON u.id = o.unidad_id
     WHERE u.consorcio_id = $1 AND p.whatsapp IS NOT NULL`,
    [consorcio_id]
  );

  let sent = 0;
  let failed = 0;

  for (const r of recipients) {
    if (!r.whatsapp) continue;
    const personalized = message.replace(/\{\{nombre\}\}/g, r.nombre);
    try {
      await sendReply(r.whatsapp, personalized);
      sent++;
      await new Promise((res) => setTimeout(res, 300)); // rate limit
    } catch (err) {
      console.error(`Failed to send to ${r.whatsapp}:`, err);
      failed++;
    }
  }

  return { sent, failed };
}

// ── HTTP Server ───────────────────────────────────────────────────────────────

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => resolve(body));
  });
}

function parseFormData(body: string): Record<string, string> {
  return Object.fromEntries(
    body.split("&").map((pair) => pair.split("=").map(decodeURIComponent) as [string, string])
  );
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  // Health check (no auth needed)
  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // Meta webhook verification (GET)
  if (req.method === "GET" && url.pathname === "/webhook/meta") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && token === META_VERIFY_TOKEN) {
      res.writeHead(200);
      res.end(challenge ?? "");
    } else {
      res.writeHead(403);
      res.end("Forbidden");
    }
    return;
  }

  // Twilio webhook (POST, form-urlencoded, no auth — Twilio signs with X-Twilio-Signature)
  if (req.method === "POST" && url.pathname === "/webhook/twilio") {
    const body = await readBody(req);
    const data = parseFormData(body);
    const from = (data["From"] ?? "").replace("whatsapp:", "");
    const text = data["Body"] ?? "";
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end("<Response></Response>"); // Twilio expects TwiML response
    if (from && text) processIncoming(from, text).catch(console.error);
    return;
  }

  // Meta Cloud API webhook (POST, JSON)
  if (req.method === "POST" && url.pathname === "/webhook/meta") {
    const body = await readBody(req);
    res.writeHead(200);
    res.end("EVENT_RECEIVED");
    try {
      const data = JSON.parse(body);
      const entry = data?.entry?.[0]?.changes?.[0]?.value;
      const msgObj = entry?.messages?.[0];
      if (msgObj?.type === "text") {
        const from = msgObj.from as string;
        const text = msgObj.text?.body as string;
        if (from && text) processIncoming(from, text).catch(console.error);
      }
    } catch (e) { console.error("Meta webhook parse error:", e); }
    return;
  }

  // Send circular (admin endpoint, requires API key)
  if (req.method === "POST" && url.pathname === "/send-circular") {
    if (API_KEY && req.headers["x-api-key"] !== API_KEY) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }
    const body = await readBody(req);
    try {
      const { consorcio_id, message } = JSON.parse(body) as { consorcio_id: number; message: string };
      const result = await sendCircular(consorcio_id, message);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, ...result }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: msg }));
    }
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`comms-agent listening on :${PORT}`);
  console.log(`  Twilio webhook: POST /webhook/twilio`);
  console.log(`  Meta webhook:   POST /webhook/meta  |  GET /webhook/meta`);
  console.log(`  Circulares:     POST /send-circular`);
});

process.on("SIGTERM", async () => {
  await pool.end();
  server.close();
});

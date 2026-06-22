import { NextResponse } from "next/server";

const N8N_BASE = process.env.N8N_BASE_URL || (process.env.NODE_ENV === "production" ? "http://n8n:5678" : "http://localhost:5678");
const N8N_API_KEY = process.env.N8N_API_KEY ?? "";
const WORKFLOW_ID = process.env.N8N_WORKFLOW_ID ?? "LRhsu4yRxfAVVO7A";

export async function POST() {
  try {
    const res = await fetch(`${N8N_BASE}/api/v1/workflows/${WORKFLOW_ID}/activate`, {
      method: "POST",
      headers: {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Content-Type": "application/json",
      },
    });

    // Trigger the workflow execution via Webhook
    const execRes = await fetch(`${N8N_BASE}/webhook/${WORKFLOW_ID}/webhooktrigger/actualizar-escalas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!execRes.ok) {
      const text = await execRes.text();
      return NextResponse.json({ error: text }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

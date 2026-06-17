import { NextResponse } from "next/server";

const N8N_BASE = process.env.N8N_BASE_URL ?? "http://n8n:5678";
const N8N_API_KEY = process.env.N8N_API_KEY ?? "";
const WORKFLOW_ID = "D05qqX9hZa07JxeL";

export async function POST() {
  try {
    const res = await fetch(`${N8N_BASE}/api/v1/workflows/${WORKFLOW_ID}/activate`, {
      method: "POST",
      headers: {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Content-Type": "application/json",
      },
    });

    // Trigger a manual execution
    const execRes = await fetch(`${N8N_BASE}/api/v1/executions`, {
      method: "POST",
      headers: {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ workflowId: WORKFLOW_ID }),
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

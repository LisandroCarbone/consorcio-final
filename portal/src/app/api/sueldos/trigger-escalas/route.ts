import { NextRequest, NextResponse } from "next/server";

const N8N_BASE = process.env.N8N_BASE_URL || (process.env.NODE_ENV === "production" ? "http://n8n:5678" : "http://localhost:5678");
const N8N_API_KEY = process.env.N8N_API_KEY ?? "";
const WORKFLOW_ID = process.env.N8N_WORKFLOW_ID ?? "LRhsu4yRxfAVVO7A";

export async function POST(req: NextRequest) {
  try {
    let periodo: string | undefined;
    try {
      const body = await req.json();
      periodo = body.periodo;
    } catch {}

    // Fire and forget — n8n runs async, portal responds immediately
    fetch(`${N8N_BASE}/webhook/actualizar-escalas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ periodo }),
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

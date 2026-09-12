import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  try {
    const result = await pool.query("SELECT 1 AS ok");
    const dbMs = Date.now() - start;
    return NextResponse.json({
      status: "ok",
      db: result.rows[0]?.ok === 1 ? "connected" : "unexpected",
      dbLatencyMs: dbMs,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        status: "error",
        db: "unreachable",
        error: e instanceof Error ? e.message : String(e),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

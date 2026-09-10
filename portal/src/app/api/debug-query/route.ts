import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-api-key");
  if (key !== process.env.AGENT_API_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { sql, params } = await req.json();
  if (!sql || typeof sql !== "string") {
    return NextResponse.json({ error: "sql required" }, { status: 400 });
  }
  // Only allow SELECT
  if (!/^\s*SELECT\b/i.test(sql)) {
    return NextResponse.json({ error: "only SELECT allowed" }, { status: 400 });
  }
  const result = await pool.query(sql, params || []);
  return NextResponse.json({ rows: result.rows, rowCount: result.rowCount });
}

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (key !== "fix2026") return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const action = url.searchParams.get("action");

  if (action === "reset-liq") {
    const id = url.searchParams.get("id");
    const { rows } = await pool.query(
      "UPDATE app.liquidaciones_sueldo SET estado = 'borrador' WHERE id = $1 RETURNING id, estado",
      [id]
    );
    return NextResponse.json({ updated: rows });
  }

  return NextResponse.json({ error: "unknown action" });
}

import { pool } from "@/lib/db";
import { LSDClient } from "./LSDClient";

async function getConsorcios() {
  const { rows } = await pool.query("SELECT cuit, nombre FROM app.consorcios ORDER BY nombre");
  return rows as { cuit: string; nombre: string }[];
}

export default async function LSDPage() {
  const consorcios = await getConsorcios();
  return <LSDClient consorcios={consorcios} />;
}

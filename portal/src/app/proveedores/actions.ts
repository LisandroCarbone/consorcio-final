"use server";

import { queryOne, query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { runCalculateExpenses } from "@/lib/expenses/engine";

export async function createProveedor(formData: FormData) {
  await queryOne(
    `INSERT INTO app.proveedores (nombre, rubro, telefono, email, whatsapp, cuit, notas)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      formData.get("nombre"),
      formData.get("rubro") || null,
      formData.get("telefono") || null,
      formData.get("email") || null,
      formData.get("whatsapp") || null,
      formData.get("cuit") || null,
      formData.get("notas") || null,
    ]
  );
  revalidatePath("/proveedores");
}

export async function createOrdenTrabajo(formData: FormData) {
  const ot = await queryOne<{ id: number }>(
    `INSERT INTO app.ordenes_trabajo (consorcio_cuit, descripcion, ticket_id, proveedor_id, fecha_programada, monto_presupuesto)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [
      formData.get("consorcio_id") as string,
      formData.get("descripcion"),
      formData.get("ticket_id") ? Number(formData.get("ticket_id")) : null,
      formData.get("proveedor_id") ? Number(formData.get("proveedor_id")) : null,
      formData.get("fecha_programada") || null,
      formData.get("monto_presupuesto") ? Number(formData.get("monto_presupuesto")) : null,
    ]
  );
  if (ot && formData.get("ticket_id")) {
    await queryOne(
      "UPDATE app.tickets SET estado='esperando_proveedor' WHERE id=$1 AND estado NOT IN ('resuelto','cerrado')",
      [Number(formData.get("ticket_id"))]
    );
  }
  revalidatePath("/proveedores");
  revalidatePath("/tickets");
}

export async function completarOrdenTrabajo(formData: FormData) {
  const otId = Number(formData.get("ot_id"));
  const montoFinal = Number(formData.get("monto_final"));

  const ot = await queryOne<{
    id: number;
    consorcio_cuit: string;
    descripcion: string;
    ticket_id: number | null;
  }>(
    "SELECT id, consorcio_cuit, descripcion, ticket_id FROM app.ordenes_trabajo WHERE id = $1",
    [otId]
  );
  if (!ot) throw new Error("Orden de trabajo no encontrada");

  await queryOne(
    `UPDATE app.ordenes_trabajo 
     SET estado = 'completada', monto_final = $1, fecha_realizada = CURRENT_DATE, updated_at = NOW() 
     WHERE id = $2`,
    [montoFinal, otId]
  );

  let ticketCategoria = "10";
  let ticketUnidadId = null;
  let ticketTitulo = "";

  if (ot.ticket_id) {
    const ticket = await queryOne<{ id: number; titulo: string; categoria: string; unidad_id: number | null }>(
      "SELECT id, titulo, categoria, unidad_id FROM app.tickets WHERE id = $1",
      [ot.ticket_id]
    );
    if (ticket) {
      ticketCategoria = ticket.categoria;
      ticketUnidadId = ticket.unidad_id;
      ticketTitulo = ticket.titulo;

      await queryOne(
        "UPDATE app.tickets SET estado = 'resuelto', closed_at = NOW(), updated_at = NOW() WHERE id = $1",
        [ot.ticket_id]
      );
    }
  }

  const period = await queryOne<{ id: number }>(
    `SELECT id FROM app.periodos_expensas 
     WHERE consorcio_cuit = $1 AND estado = 'abierto' 
     ORDER BY anio DESC, mes DESC LIMIT 1`,
    [ot.consorcio_cuit]
  );

  if (!period) {
    throw new Error(
      "No hay un período de expensas abierto para este consorcio. Por favor, abra un período en la sección de Expensas antes de completar la orden de trabajo para que el gasto pueda ser registrado."
    );
  }

  const concepto = `OT #${otId} — ${ticketTitulo || ot.descripcion}`;
  const tipo = ticketUnidadId ? "Particular" : "A";

  await queryOne(
    `INSERT INTO app.gastos_periodo (periodo_id, categoria, descripcion, monto, tipo, unidad_id) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [period.id, Number(ticketCategoria), concepto, montoFinal, tipo, ticketUnidadId]
  );

  await runCalculateExpenses(period.id);


  revalidatePath("/proveedores");
  revalidatePath("/tickets");
  revalidatePath("/expensas");
}

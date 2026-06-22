"use server";

import { query, queryOne } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createTicket(formData: FormData) {
  await queryOne(
    `INSERT INTO app.tickets (consorcio_cuit, titulo, descripcion, categoria, prioridad, canal_origen)
     VALUES ($1,$2,$3,$4,$5,'portal')`,
    [
      formData.get("consorcio_id") as string,
      formData.get("titulo"),
      formData.get("descripcion") || null,
      formData.get("categoria") || "general",
      formData.get("prioridad") || "normal",
    ]
  );
  revalidatePath("/tickets");
}

export async function updateTicketEstado(ticket_id: number, estado: string) {
  const sets = estado === "cerrado" || estado === "resuelto"
    ? "estado=$1, closed_at=NOW()"
    : "estado=$1";
  await query(`UPDATE app.tickets SET ${sets} WHERE id=$2`, [estado, ticket_id]);
  revalidatePath("/tickets");
}

export async function addMensaje(formData: FormData) {
  await queryOne(
    "INSERT INTO app.ticket_mensajes (ticket_id, autor, contenido, es_interno) VALUES ($1,$2,$3,$4)",
    [
      Number(formData.get("ticket_id")),
      formData.get("autor") || "Administrador",
      formData.get("contenido"),
      formData.get("es_interno") === "true",
    ]
  );
  revalidatePath("/tickets");
}

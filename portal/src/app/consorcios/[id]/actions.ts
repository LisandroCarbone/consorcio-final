"use server";

import { query, queryOne } from "@/lib/db";
import { revalidatePath } from "next/cache";

function revalidateDetail(consorcio_cuit: string) {
  revalidatePath(`/consorcios/${consorcio_cuit}`);
}

// ---- Phase 2: Inline contact editing ----

const EDITABLE_PERSONA_FIELDS = new Set(["nombre", "apellido", "dni", "email", "whatsapp"]);

export async function updatePersonaField(formData: FormData) {
  const persona_id = Number(formData.get("persona_id"));
  const field = formData.get("field") as string;
  const value = (formData.get("value") as string) ?? "";
  const consorcio_cuit = formData.get("consorcio_cuit") as string;

  if (!EDITABLE_PERSONA_FIELDS.has(field)) {
    throw new Error(`Field "${field}" is not editable`);
  }

  await query(
    `UPDATE app.personas SET ${field} = $1 WHERE id = $2`,
    [value.trim() || null, persona_id]
  );
  revalidateDetail(consorcio_cuit);
}

// ---- Phase 3: Ocupante lifecycle ----

export async function replacePropietario(formData: FormData) {
  const old_ocupante_id = Number(formData.get("old_ocupante_id"));
  const unidad_id = Number(formData.get("unidad_id"));
  const consorcio_cuit = formData.get("consorcio_cuit") as string;
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const dni = (formData.get("dni") as string) || null;
  const email = (formData.get("email") as string) || null;
  const whatsapp = (formData.get("whatsapp") as string) || null;

  const persona = await queryOne<{ id: number }>(
    `INSERT INTO app.personas (nombre, apellido, dni, email, whatsapp)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [nombre, apellido, dni, email, whatsapp]
  );
  if (!persona) throw new Error("Could not create persona");

  await query(
    "UPDATE app.ocupantes SET activo = false WHERE id = $1",
    [old_ocupante_id]
  );
  await queryOne(
    "INSERT INTO app.ocupantes (unidad_id, persona_id, rol) VALUES ($1,$2,'propietario')",
    [unidad_id, persona.id]
  );
  revalidateDetail(consorcio_cuit);
}

export async function removeInquilino(formData: FormData) {
  const ocupante_id = Number(formData.get("ocupante_id"));
  const consorcio_cuit = formData.get("consorcio_cuit") as string;

  await query("UPDATE app.ocupantes SET activo = false WHERE id = $1", [ocupante_id]);
  revalidateDetail(consorcio_cuit);
}

// ---- Phase 4: CBU unit management ----

export async function addCbuEntry(formData: FormData) {
  const consorcio_cuit = formData.get("consorcio_cuit") as string;
  const unidad_id = Number(formData.get("unidad_id"));
  const cbu_o_cuit = (formData.get("cbu_o_cuit") as string).trim();
  const nombre_referencia = (formData.get("nombre_referencia") as string) || null;

  if (!cbu_o_cuit) throw new Error("cbu_o_cuit is required");

  await query(
    `INSERT INTO app.cbu_unidad_map (consorcio_cuit, cbu_o_cuit, unidad_id, nombre_referencia)
     VALUES ($1,$2,$3,$4)`,
    [consorcio_cuit, cbu_o_cuit, unidad_id, nombre_referencia]
  );
  revalidateDetail(consorcio_cuit);
}

export async function updateCbuEntry(formData: FormData) {
  const consorcio_cuit = formData.get("consorcio_cuit") as string;
  const unidad_id = Number(formData.get("unidad_id"));
  const old_cbu_o_cuit = formData.get("old_cbu_o_cuit") as string;
  const new_cbu_o_cuit = (formData.get("new_cbu_o_cuit") as string).trim();
  const nombre_referencia = (formData.get("nombre_referencia") as string) || null;

  if (!new_cbu_o_cuit) throw new Error("cbu_o_cuit is required");

  await query(
    `UPDATE app.cbu_unidad_map
     SET cbu_o_cuit = $1, nombre_referencia = $2
     WHERE consorcio_cuit = $3 AND unidad_id = $4 AND cbu_o_cuit = $5`,
    [new_cbu_o_cuit, nombre_referencia, consorcio_cuit, unidad_id, old_cbu_o_cuit]
  );
  revalidateDetail(consorcio_cuit);
}

export async function deleteCbuEntry(formData: FormData) {
  const consorcio_cuit = formData.get("consorcio_cuit") as string;
  const unidad_id = Number(formData.get("unidad_id"));
  const cbu_o_cuit = formData.get("cbu_o_cuit") as string;

  await query(
    `DELETE FROM app.cbu_unidad_map WHERE consorcio_cuit = $1 AND unidad_id = $2 AND cbu_o_cuit = $3`,
    [consorcio_cuit, unidad_id, cbu_o_cuit]
  );
  revalidateDetail(consorcio_cuit);
}

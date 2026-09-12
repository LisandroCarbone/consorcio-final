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

// ---- Phase 2b: Inline consorcio-level field editing ----

type ConsorcioFieldKind = "text" | "number" | "percent" | "boolean";

const CONSORCIO_FIELD_MAP: Record<string, { column: string; kind: ConsorcioFieldKind }> = {
  nombre: { column: "nombre", kind: "text" },
  direccion: { column: "direccion", kind: "text" },
  codigo_postal: { column: "codigo_postal", kind: "text" },
  banco: { column: "banco", kind: "text" },
  nro_cta_suterh: { column: "suterh_key", kind: "text" },
  clave_suterh: { column: "clave_suterh", kind: "text" },
  categoria_edificio: { column: "categoria_edificio", kind: "text" },
  cant_uf: { column: "cant_uf", kind: "number" },
  uf_retiro_residuos: { column: "uf_retiro_residuos", kind: "number" },
  monto_fijo_default: { column: "monto_fijo_default", kind: "number" },
  fondo_obra: { column: "fondo_obra", kind: "number" },
  intereses_mora_pct: { column: "interest_rate", kind: "percent" },
  pct_expensa_a: { column: "pct_expensa_a", kind: "percent" },
  tipo_expensas: { column: "tipo_expensas", kind: "text" },
  formato_cobro: { column: "formato_cobro", kind: "text" },
  fondo_obra_activo: { column: "fondo_obra_activo", kind: "boolean" },
  zona_desfavorable: { column: "zona_desfavorable", kind: "boolean" },
  tiene_cochera: { column: "tiene_cochera", kind: "boolean" },
  tiene_ascensor: { column: "tiene_ascensor", kind: "boolean" },
  tiene_pileta: { column: "tiene_pileta", kind: "boolean" },
  tiene_caldera: { column: "tiene_caldera", kind: "boolean" },
  tiene_agua_caliente_central: { column: "tiene_agua_caliente_central", kind: "boolean" },
  tiene_calefaccion_central: { column: "tiene_calefaccion_central", kind: "boolean" },
  tiene_aire_acondicionado_central: { column: "tiene_aire_acondicionado_central", kind: "boolean" },
  tiene_grupo_electrogeno: { column: "tiene_grupo_electrogeno", kind: "boolean" },
  tiene_seguridad_centralizada: { column: "tiene_seguridad_centralizada", kind: "boolean" },
  tiene_compactador: { column: "tiene_compactador", kind: "boolean" },
  tiene_montacargas: { column: "tiene_montacargas", kind: "boolean" },
  tiene_movimiento_coches: { column: "tiene_movimiento_coches", kind: "boolean" },
  tiene_jardin: { column: "tiene_jardin", kind: "boolean" },
  tiene_otros_servicios_centrales: { column: "tiene_otros_servicios_centrales", kind: "boolean" },
};

export async function updateConsorcioField(formData: FormData) {
  const cuit = formData.get("cuit") as string;
  const field = formData.get("field") as string;
  const rawValue = formData.get("value") as string | null;

  const mapping = CONSORCIO_FIELD_MAP[field];
  if (!mapping) {
    throw new Error(`Field "${field}" is not editable`);
  }

  let value: string | number | boolean | null;
  const trimmed = (rawValue ?? "").trim();
  switch (mapping.kind) {
    case "boolean":
      value = rawValue === "true";
      break;
    case "number": {
      if (trimmed === "") { value = null; break; }
      const n = Number(trimmed);
      if (isNaN(n)) throw new Error(`Invalid number for field "${field}"`);
      if (n < 0 && !field.startsWith("zona_")) throw new Error(`Field "${field}" cannot be negative`);
      value = n;
      break;
    }
    case "percent": {
      if (trimmed === "") { value = null; break; }
      const p = Number(trimmed);
      if (isNaN(p) || p < 0 || p > 100) throw new Error(`Invalid percentage for field "${field}"`);
      value = p / 100;
      break;
    }
    default:
      value = trimmed === "" ? null : trimmed;
  }

  await query(`UPDATE app.consorcios SET ${mapping.column} = $1 WHERE cuit = $2`, [value, cuit]);
  revalidateDetail(cuit);
  revalidatePath("/consorcios");
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

"use server";

import { query, queryOne } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function formToConsorcio(formData: FormData) {
  return {
    nombre: formData.get("nombre") as string,
    direccion: formData.get("direccion") as string,
    cuit: (formData.get("cuit") as string) || null,
    codigo_postal: (formData.get("codigo_postal") as string) || null,
    nro_cta_suterh: (formData.get("nro_cta_suterh") as string) || null,
    cant_uf: formData.get("cant_uf") ? Number(formData.get("cant_uf")) : null,
    categoria_edificio: (formData.get("categoria_edificio") as string) || null,
    banco: (formData.get("banco") as string) || null,
    tiene_cochera: formData.get("tiene_cochera") === "true",
    tiene_movimiento_coches: formData.get("tiene_movimiento_coches") === "true",
    tiene_jardin: formData.get("tiene_jardin") === "true",
    zona_desfavorable: formData.get("zona_desfavorable") === "true",
    tiene_pileta: formData.get("tiene_pileta") === "true",
    tiene_caldera: formData.get("tiene_caldera") === "true",
    intereses_mora_pct: formData.get("intereses_mora_pct")
      ? Number(formData.get("intereses_mora_pct")) / 100
      : null,
  };
}

export async function createConsorcio(formData: FormData) {
  const d = formToConsorcio(formData);
  await queryOne(
    `INSERT INTO app.consorcios
       (nombre, direccion, cuit, codigo_postal, suterh_key, cant_uf,
        categoria_edificio, banco, tiene_cochera, tiene_movimiento_coches,
        tiene_jardin, zona_desfavorable, tiene_pileta, tiene_caldera,
        interest_rate)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
    [d.nombre, d.direccion, d.cuit, d.codigo_postal, d.nro_cta_suterh,
     d.cant_uf, d.categoria_edificio, d.banco,
     d.tiene_cochera, d.tiene_movimiento_coches, d.tiene_jardin,
     d.zona_desfavorable, d.tiene_pileta, d.tiene_caldera, d.intereses_mora_pct]
  );
  revalidatePath("/consorcios");
}

export async function updateConsorcio(formData: FormData) {
  const cuit = formData.get("cuit") as string;
  const d = formToConsorcio(formData);
  await queryOne(
    `UPDATE app.consorcios SET
       nombre = $1, direccion = $2, codigo_postal = $3,
       suterh_key = $4, cant_uf = $5, categoria_edificio = $6, banco = $7,
       tiene_cochera = $8, tiene_movimiento_coches = $9, tiene_jardin = $10,
       zona_desfavorable = $11, tiene_pileta = $12, tiene_caldera = $13,
       interest_rate = $14
     WHERE cuit = $15`,
    [d.nombre, d.direccion, d.codigo_postal, d.nro_cta_suterh,
     d.cant_uf, d.categoria_edificio, d.banco,
     d.tiene_cochera, d.tiene_movimiento_coches, d.tiene_jardin,
     d.zona_desfavorable, d.tiene_pileta, d.tiene_caldera, d.intereses_mora_pct,
     cuit]
  );
  revalidatePath("/consorcios");
  revalidatePath(`/consorcios/${cuit}`);
  redirect(`/consorcios/${cuit}/editar?ok=guardado`);
}

export async function createUnidad(formData: FormData) {
  const consorcio_cuit = formData.get("consorcio_cuit") as string;
  await queryOne(
    `INSERT INTO app.unidades (consorcio_cuit, uf, piso, depto, coef_a, coef_b, tipo)
     VALUES ($1,$2,$3,$4,$5,0,$6)`,
    [
      consorcio_cuit,
      Number(formData.get("numero")),
      formData.get("piso") || null,
      formData.get("departamento") || null,
      Number(formData.get("coeficiente")),
      formData.get("tipo") || "departamento",
    ]
  );
  revalidatePath(`/consorcios/${consorcio_cuit}`);
}

export async function createPersonaAndOcupante(formData: FormData) {
  const unidad_id = Number(formData.get("unidad_id"));
  const consorcio_cuit = formData.get("consorcio_cuit") as string;
  const persona = await queryOne<{ id: number }>(
    `INSERT INTO app.personas (nombre, apellido, email, telefono, whatsapp, dni)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [
      formData.get("nombre"),
      formData.get("apellido"),
      formData.get("email") || null,
      formData.get("telefono") || null,
      formData.get("whatsapp") || null,
      formData.get("dni") || null,
    ]
  );
  if (!persona) throw new Error("Could not create persona");
  await query(
    "UPDATE app.ocupantes SET activo=false WHERE unidad_id=$1 AND rol=$2",
    [unidad_id, formData.get("rol")]
  );
  await queryOne(
    "INSERT INTO app.ocupantes (unidad_id, persona_id, rol) VALUES ($1,$2,$3)",
    [unidad_id, persona.id, formData.get("rol")]
  );
  revalidatePath(`/consorcios/${consorcio_cuit}`);
}

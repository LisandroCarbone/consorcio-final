"use server";

import { query, queryOne } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function formToConsorcio(formData: FormData) {
  const bool = (name: string) => formData.get(name) === "true";
  return {
    nombre: formData.get("nombre") as string,
    direccion: formData.get("direccion") as string,
    cuit: (formData.get("cuit") as string) || null,
    codigo_postal: (formData.get("codigo_postal") as string) || null,
    nro_cta_suterh: (formData.get("nro_cta_suterh") as string) || null,
    cant_uf: formData.get("cant_uf") ? Number(formData.get("cant_uf")) : null,
    categoria_edificio: (formData.get("categoria_edificio") as string) || null,
    banco: (formData.get("banco") as string) || null,
    tiene_cochera: bool("tiene_cochera"),
    tiene_movimiento_coches: bool("tiene_movimiento_coches"),
    tiene_jardin: bool("tiene_jardin"),
    zona_desfavorable: bool("zona_desfavorable"),
    tiene_pileta: bool("tiene_pileta"),
    tiene_caldera: bool("tiene_caldera"),
    tiene_ascensor: bool("tiene_ascensor"),
    tiene_agua_caliente_central: bool("tiene_agua_caliente_central"),
    tiene_calefaccion_central: bool("tiene_calefaccion_central"),
    tiene_aire_acondicionado_central: bool("tiene_aire_acondicionado_central"),
    tiene_grupo_electrogeno: bool("tiene_grupo_electrogeno"),
    tiene_seguridad_centralizada: bool("tiene_seguridad_centralizada"),
    tiene_compactador: bool("tiene_compactador"),
    tiene_montacargas: bool("tiene_montacargas"),
    tiene_otros_servicios_centrales: bool("tiene_otros_servicios_centrales"),
    intereses_mora_pct: formData.get("intereses_mora_pct")
      ? Number(formData.get("intereses_mora_pct")) / 100
      : null,
    art_pct_variable: formData.get("art_pct_variable")
      ? Number(formData.get("art_pct_variable")) / 100
      : null,
    sv_costo_fijo: formData.get("sv_costo_fijo")
      ? Number(formData.get("sv_costo_fijo"))
      : null,
    pct_cct_suterh: formData.get("pct_cct_suterh")
      ? Number(formData.get("pct_cct_suterh")) / 100
      : null,
    pct_cct_fateryh: formData.get("pct_cct_fateryh")
      ? Number(formData.get("pct_cct_fateryh")) / 100
      : null,
    pct_cct_seracarh: formData.get("pct_cct_seracarh")
      ? Number(formData.get("pct_cct_seracarh")) / 100
      : null,
    art_costo_fijo: formData.get("art_costo_fijo")
      ? Number(formData.get("art_costo_fijo"))
      : 0,
    fateryh_art19bis_mensual: formData.get("fateryh_art19bis_mensual")
      ? Number(formData.get("fateryh_art19bis_mensual"))
      : 0,
  };
}

export async function createConsorcio(formData: FormData) {
  const d = formToConsorcio(formData);
  await queryOne(
    `INSERT INTO app.consorcios
       (nombre, direccion, cuit, codigo_postal, suterh_key, cant_uf,
        categoria_edificio, banco,
        tiene_cochera, tiene_movimiento_coches, tiene_jardin, zona_desfavorable,
        tiene_pileta, tiene_caldera, tiene_ascensor, tiene_agua_caliente_central,
        tiene_calefaccion_central, tiene_aire_acondicionado_central,
        tiene_grupo_electrogeno, tiene_seguridad_centralizada,
        tiene_compactador, tiene_montacargas, tiene_otros_servicios_centrales,
        interest_rate)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
    [d.nombre, d.direccion, d.cuit, d.codigo_postal, d.nro_cta_suterh,
     d.cant_uf, d.categoria_edificio, d.banco,
     d.tiene_cochera, d.tiene_movimiento_coches, d.tiene_jardin, d.zona_desfavorable,
     d.tiene_pileta, d.tiene_caldera, d.tiene_ascensor, d.tiene_agua_caliente_central,
     d.tiene_calefaccion_central, d.tiene_aire_acondicionado_central,
     d.tiene_grupo_electrogeno, d.tiene_seguridad_centralizada,
     d.tiene_compactador, d.tiene_montacargas, d.tiene_otros_servicios_centrales,
     d.intereses_mora_pct]
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
       tiene_ascensor = $14, tiene_agua_caliente_central = $15,
       tiene_calefaccion_central = $16, tiene_aire_acondicionado_central = $17,
       tiene_grupo_electrogeno = $18, tiene_seguridad_centralizada = $19,
       tiene_compactador = $20, tiene_montacargas = $21,
       tiene_otros_servicios_centrales = $22, interest_rate = $23,
       art_pct_variable = $24, sv_costo_fijo = $25,
       pct_cct_suterh = $26, pct_cct_fateryh = $27, pct_cct_seracarh = $28,
       art_costo_fijo = $29, fateryh_art19bis_mensual = $30
     WHERE cuit = $31`,
    [d.nombre, d.direccion, d.codigo_postal, d.nro_cta_suterh,
     d.cant_uf, d.categoria_edificio, d.banco,
     d.tiene_cochera, d.tiene_movimiento_coches, d.tiene_jardin,
     d.zona_desfavorable, d.tiene_pileta, d.tiene_caldera,
     d.tiene_ascensor, d.tiene_agua_caliente_central,
     d.tiene_calefaccion_central, d.tiene_aire_acondicionado_central,
     d.tiene_grupo_electrogeno, d.tiene_seguridad_centralizada,
     d.tiene_compactador, d.tiene_montacargas,
     d.tiene_otros_servicios_centrales, d.intereses_mora_pct,
     d.art_pct_variable, d.sv_costo_fijo,
     d.pct_cct_suterh, d.pct_cct_fateryh, d.pct_cct_seracarh,
     d.art_costo_fijo, d.fateryh_art19bis_mensual,
     cuit]
  );
  revalidatePath("/consorcios");
  revalidatePath(`/consorcios/${cuit}`);
  redirect(`/consorcios/${cuit}/editar?ok=guardado`);
}

export async function createUnidad(formData: FormData) {
  const consorcio_cuit = formData.get("consorcio_cuit") as string;
  const uf_numero_raw = formData.get("uf_numero");
  const uf_numero = uf_numero_raw ? Number(uf_numero_raw) : null;
  await queryOne(
    `INSERT INTO app.unidades (consorcio_cuit, uf, uf_numero, piso, depto, coef_a, coef_b, tipo)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      consorcio_cuit,
      (formData.get("uf") as string).trim(),
      uf_numero,
      formData.get("piso") || null,
      formData.get("depto") || null,
      Number(formData.get("coef_a")),
      Number(formData.get("coef_b") || 0),
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

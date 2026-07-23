"use server";

import { query, queryOne } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type AdministradorRow = {
  id: number;
  nombre_sociedad: string | null;
  nombre_administrador: string;
  cuit: string;
  matricula_rpa: string | null;
  email: string | null;
  telefono: string | null;
  celular_urgencias: string | null;
  domicilio: string | null;
  horario_atencion: string | null;
  categoria_afip: string | null;
  situacion_iva: string | null;
  fecha_inicio_actividades: string | null;
  registro_publico: string | null;
  logo_url: string | null;
  firma_digital_url: string | null;
  whatsapp_urgencias: string | null;
  sitio_web: string | null;
};

function formToAdministrador(formData: FormData) {
  return {
    nombre_sociedad: (formData.get("nombre_sociedad") as string) || null,
    nombre_administrador: formData.get("nombre_administrador") as string,
    cuit: formData.get("cuit") as string,
    matricula_rpa: (formData.get("matricula_rpa") as string) || null,
    email: (formData.get("email") as string) || null,
    telefono: (formData.get("telefono") as string) || null,
    celular_urgencias: (formData.get("celular_urgencias") as string) || null,
    domicilio: (formData.get("domicilio") as string) || null,
    horario_atencion: (formData.get("horario_atencion") as string) || null,
    categoria_afip: (formData.get("categoria_afip") as string) || null,
    situacion_iva: (formData.get("situacion_iva") as string) || null,
    fecha_inicio_actividades: (formData.get("fecha_inicio_actividades") as string) || null,
    registro_publico: (formData.get("registro_publico") as string) || null,
    logo_url: (formData.get("logo_url") as string) || null,
    firma_digital_url: (formData.get("firma_digital_url") as string) || null,
    whatsapp_urgencias: (formData.get("whatsapp_urgencias") as string) || null,
    sitio_web: (formData.get("sitio_web") as string) || null,
  };
}

export async function getAdministradores() {
  return query<AdministradorRow>(
    "SELECT * FROM app.administradores ORDER BY nombre_administrador"
  );
}

export async function getAdministrador(id: number) {
  return queryOne<AdministradorRow>(
    "SELECT * FROM app.administradores WHERE id = $1",
    [id]
  );
}

export async function createAdministrador(formData: FormData): Promise<{ error?: string }> {
  const d = formToAdministrador(formData);
  try {
    await queryOne(
      `INSERT INTO app.administradores
         (nombre_sociedad, nombre_administrador, cuit, matricula_rpa,
          email, telefono, celular_urgencias, domicilio, horario_atencion,
          categoria_afip, situacion_iva, fecha_inicio_actividades, registro_publico,
          logo_url, firma_digital_url, whatsapp_urgencias, sitio_web)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        d.nombre_sociedad, d.nombre_administrador, d.cuit, d.matricula_rpa,
        d.email, d.telefono, d.celular_urgencias, d.domicilio, d.horario_atencion,
        d.categoria_afip, d.situacion_iva, d.fecha_inicio_actividades, d.registro_publico,
        d.logo_url, d.firma_digital_url, d.whatsapp_urgencias, d.sitio_web,
      ]
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return { error: "cuit_duplicado" };
    }
    throw e;
  }
  revalidatePath("/administracion");
  return {};
}

export async function updateAdministrador(formData: FormData): Promise<{ error?: string }> {
  const id = Number(formData.get("id"));
  const d = formToAdministrador(formData);
  try {
    await queryOne(
      `UPDATE app.administradores SET
         nombre_sociedad = $1, nombre_administrador = $2, cuit = $3, matricula_rpa = $4,
         email = $5, telefono = $6, celular_urgencias = $7, domicilio = $8, horario_atencion = $9,
         categoria_afip = $10, situacion_iva = $11, fecha_inicio_actividades = $12, registro_publico = $13,
         logo_url = $14, firma_digital_url = $15, whatsapp_urgencias = $16, sitio_web = $17
       WHERE id = $18`,
      [
        d.nombre_sociedad, d.nombre_administrador, d.cuit, d.matricula_rpa,
        d.email, d.telefono, d.celular_urgencias, d.domicilio, d.horario_atencion,
        d.categoria_afip, d.situacion_iva, d.fecha_inicio_actividades, d.registro_publico,
        d.logo_url, d.firma_digital_url, d.whatsapp_urgencias, d.sitio_web,
        id,
      ]
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return { error: "cuit_duplicado" };
    }
    throw e;
  }
  revalidatePath("/administracion");
  revalidatePath(`/administracion/${id}`);
  return {};
}

export async function deleteAdministrador(formData: FormData): Promise<{ error?: string }> {
  const id = Number(formData.get("id"));
  try {
    await query("DELETE FROM app.administradores WHERE id = $1", [id]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("foreign key") || msg.includes("violates")) {
      return { error: "admin_vinculado" };
    }
    throw e;
  }
  revalidatePath("/administracion");
  return {};
}

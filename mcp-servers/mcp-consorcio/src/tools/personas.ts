import { z } from "zod";
import { query, queryOne } from "../db.js";

export const personaTools = {
  upsert_persona: {
    description: "Create or update a persona (propietario/inquilino)",
    inputSchema: z.object({
      id: z.number().int().positive().optional(),
      nombre: z.string().min(1),
      apellido: z.string().min(1),
      email: z.string().email().optional(),
      telefono: z.string().optional(),
      whatsapp: z.string().optional(),
      dni: z.string().optional(),
    }),
    async handler(input: {
      id?: number;
      nombre: string;
      apellido: string;
      email?: string;
      telefono?: string;
      whatsapp?: string;
      dni?: string;
    }) {
      if (input.id) {
        return queryOne(
          `UPDATE personas SET nombre=$1, apellido=$2, email=$3, telefono=$4, whatsapp=$5, dni=$6
           WHERE id=$7 RETURNING *`,
          [input.nombre, input.apellido, input.email ?? null, input.telefono ?? null, input.whatsapp ?? null, input.dni ?? null, input.id]
        );
      }
      return queryOne(
        `INSERT INTO personas (nombre, apellido, email, telefono, whatsapp, dni)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [input.nombre, input.apellido, input.email ?? null, input.telefono ?? null, input.whatsapp ?? null, input.dni ?? null]
      );
    },
  },

  asignar_ocupante: {
    description: "Assign a persona to a unidad as propietario or inquilino",
    inputSchema: z.object({
      unidad_id: z.number().int().positive(),
      persona_id: z.number().int().positive(),
      rol: z.enum(["propietario", "inquilino"]).default("propietario"),
      desde: z.string().optional(),
    }),
    async handler(input: { unidad_id: number; persona_id: number; rol: string; desde?: string }) {
      // Deactivate previous occupant of same role
      await query(
        `UPDATE ocupantes SET activo=false, hasta=CURRENT_DATE
         WHERE unidad_id=$1 AND rol=$2 AND activo=true`,
        [input.unidad_id, input.rol]
      );
      return queryOne(
        `INSERT INTO ocupantes (unidad_id, persona_id, rol, desde)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [input.unidad_id, input.persona_id, input.rol, input.desde ?? new Date().toISOString().split("T")[0]]
      );
    },
  },
};

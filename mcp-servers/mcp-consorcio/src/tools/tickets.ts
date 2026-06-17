import { z } from "zod";
import { query, queryOne } from "../db.js";

export const ticketTools = {
  create_ticket: {
    description: "Create a new reclamo/ticket",
    inputSchema: z.object({
      consorcio_id: z.number().int().positive(),
      titulo: z.string().min(1),
      descripcion: z.string().optional(),
      unidad_id: z.number().int().positive().optional(),
      persona_id: z.number().int().positive().optional(),
      categoria: z.enum(["general", "plomeria", "electricidad", "limpieza", "ascensor", "administracion", "otro"]).default("general"),
      prioridad: z.enum(["baja", "normal", "alta", "urgente"]).default("normal"),
      canal_origen: z.enum(["manual", "whatsapp", "email", "portal"]).default("manual"),
    }),
    async handler(input: {
      consorcio_id: number;
      titulo: string;
      descripcion?: string;
      unidad_id?: number;
      persona_id?: number;
      categoria: string;
      prioridad: string;
      canal_origen: string;
    }) {
      return queryOne(
        `INSERT INTO tickets (consorcio_id, titulo, descripcion, unidad_id, persona_id, categoria, prioridad, canal_origen)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [input.consorcio_id, input.titulo, input.descripcion ?? null, input.unidad_id ?? null,
         input.persona_id ?? null, input.categoria, input.prioridad, input.canal_origen]
      );
    },
  },

  update_ticket: {
    description: "Update ticket status or resolution",
    inputSchema: z.object({
      id: z.number().int().positive(),
      estado: z.enum(["abierto", "en_proceso", "esperando_proveedor", "resuelto", "cerrado"]).optional(),
      prioridad: z.enum(["baja", "normal", "alta", "urgente"]).optional(),
      resolucion: z.string().optional(),
    }),
    async handler(input: { id: number; estado?: string; prioridad?: string; resolucion?: string }) {
      const sets: string[] = [];
      const params: unknown[] = [];
      let i = 1;

      if (input.estado) { sets.push(`estado=$${i++}`); params.push(input.estado); }
      if (input.prioridad) { sets.push(`prioridad=$${i++}`); params.push(input.prioridad); }
      if (input.resolucion) { sets.push(`resolucion=$${i++}`); params.push(input.resolucion); }
      if (input.estado === "cerrado" || input.estado === "resuelto") {
        sets.push(`closed_at=$${i++}`);
        params.push(new Date().toISOString());
      }

      if (sets.length === 0) throw new Error("Nothing to update");
      params.push(input.id);

      return queryOne(
        `UPDATE tickets SET ${sets.join(", ")} WHERE id=$${i} RETURNING *`,
        params
      );
    },
  },

  list_tickets: {
    description: "List tickets for a consorcio, optionally filtered by estado",
    inputSchema: z.object({
      consorcio_id: z.number().int().positive(),
      estado: z.enum(["abierto", "en_proceso", "esperando_proveedor", "resuelto", "cerrado"]).optional(),
    }),
    async handler({ consorcio_id, estado }: { consorcio_id: number; estado?: string }) {
      if (estado) {
        return query(
          "SELECT * FROM tickets WHERE consorcio_id=$1 AND estado=$2 ORDER BY created_at DESC",
          [consorcio_id, estado]
        );
      }
      return query(
        "SELECT * FROM tickets WHERE consorcio_id=$1 ORDER BY created_at DESC",
        [consorcio_id]
      );
    },
  },

  add_mensaje_ticket: {
    description: "Add a message or note to a ticket",
    inputSchema: z.object({
      ticket_id: z.number().int().positive(),
      autor: z.string().min(1),
      contenido: z.string().min(1),
      es_interno: z.boolean().default(false),
    }),
    async handler(input: { ticket_id: number; autor: string; contenido: string; es_interno: boolean }) {
      return queryOne(
        `INSERT INTO ticket_mensajes (ticket_id, autor, contenido, es_interno)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [input.ticket_id, input.autor, input.contenido, input.es_interno]
      );
    },
  },
};

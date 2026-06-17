import { z } from "zod";
import { query, queryOne } from "../db.js";

export const proveedorTools = {
  list_proveedores: {
    description: "List all active proveedores, optionally filtered by rubro",
    inputSchema: z.object({ rubro: z.string().optional() }),
    async handler({ rubro }: { rubro?: string }) {
      if (rubro) {
        return query(
          "SELECT * FROM proveedores WHERE activo=true AND rubro ILIKE $1 ORDER BY nombre",
          [`%${rubro}%`]
        );
      }
      return query("SELECT * FROM proveedores WHERE activo=true ORDER BY nombre");
    },
  },

  create_proveedor: {
    description: "Register a new proveedor",
    inputSchema: z.object({
      nombre: z.string().min(1),
      rubro: z.string().optional(),
      telefono: z.string().optional(),
      email: z.string().email().optional(),
      whatsapp: z.string().optional(),
      cuit: z.string().optional(),
      notas: z.string().optional(),
    }),
    async handler(input: {
      nombre: string;
      rubro?: string;
      telefono?: string;
      email?: string;
      whatsapp?: string;
      cuit?: string;
      notas?: string;
    }) {
      return queryOne(
        `INSERT INTO proveedores (nombre, rubro, telefono, email, whatsapp, cuit, notas)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [input.nombre, input.rubro ?? null, input.telefono ?? null, input.email ?? null,
         input.whatsapp ?? null, input.cuit ?? null, input.notas ?? null]
      );
    },
  },

  create_orden_trabajo: {
    description: "Create a work order, optionally linked to a ticket and a proveedor",
    inputSchema: z.object({
      consorcio_id: z.number().int().positive(),
      descripcion: z.string().min(1),
      ticket_id: z.number().int().positive().optional(),
      proveedor_id: z.number().int().positive().optional(),
      fecha_programada: z.string().optional(),
      monto_presupuesto: z.number().positive().optional(),
    }),
    async handler(input: {
      consorcio_id: number;
      descripcion: string;
      ticket_id?: number;
      proveedor_id?: number;
      fecha_programada?: string;
      monto_presupuesto?: number;
    }) {
      const ot = await queryOne(
        `INSERT INTO ordenes_trabajo (consorcio_id, descripcion, ticket_id, proveedor_id, fecha_programada, monto_presupuesto)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [input.consorcio_id, input.descripcion, input.ticket_id ?? null,
         input.proveedor_id ?? null, input.fecha_programada ?? null, input.monto_presupuesto ?? null]
      );

      // If linked to a ticket, update its status
      if (input.ticket_id) {
        await query(
          "UPDATE tickets SET estado='esperando_proveedor' WHERE id=$1 AND estado NOT IN ('resuelto','cerrado')",
          [input.ticket_id]
        );
      }

      return ot;
    },
  },

  update_orden_trabajo: {
    description: "Update an orden de trabajo status or completion details",
    inputSchema: z.object({
      id: z.number().int().positive(),
      estado: z.enum(["pendiente", "confirmada", "en_curso", "completada", "cancelada"]).optional(),
      fecha_realizada: z.string().optional(),
      monto_final: z.number().positive().optional(),
      comprobante_url: z.string().optional(),
    }),
    async handler(input: { id: number; estado?: string; fecha_realizada?: string; monto_final?: number; comprobante_url?: string }) {
      const sets: string[] = [];
      const params: unknown[] = [];
      let i = 1;

      if (input.estado) { sets.push(`estado=$${i++}`); params.push(input.estado); }
      if (input.fecha_realizada) { sets.push(`fecha_realizada=$${i++}`); params.push(input.fecha_realizada); }
      if (input.monto_final !== undefined) { sets.push(`monto_final=$${i++}`); params.push(input.monto_final); }
      if (input.comprobante_url) { sets.push(`comprobante_url=$${i++}`); params.push(input.comprobante_url); }

      if (sets.length === 0) throw new Error("Nothing to update");
      params.push(input.id);

      return queryOne(
        `UPDATE ordenes_trabajo SET ${sets.join(", ")} WHERE id=$${i} RETURNING *`,
        params
      );
    },
  },
};

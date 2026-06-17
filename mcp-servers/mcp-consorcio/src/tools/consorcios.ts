import { z } from "zod";
import { query, queryOne } from "../db.js";

export const consorcioTools = {
  list_consorcios: {
    description: "List all consorcios",
    inputSchema: z.object({}),
    async handler() {
      return query("SELECT * FROM consorcios ORDER BY nombre");
    },
  },

  get_consorcio: {
    description: "Get a single consorcio by ID",
    inputSchema: z.object({ id: z.number().int().positive() }),
    async handler({ id }: { id: number }) {
      const row = await queryOne("SELECT * FROM consorcios WHERE id = $1", [id]);
      if (!row) throw new Error(`Consorcio ${id} not found`);
      return row;
    },
  },

  create_consorcio: {
    description: "Create a new consorcio",
    inputSchema: z.object({
      nombre: z.string().min(1),
      direccion: z.string().min(1),
      cuit: z.string().optional(),
      cbu: z.string().optional(),
    }),
    async handler(input: { nombre: string; direccion: string; cuit?: string; cbu?: string }) {
      return queryOne(
        `INSERT INTO consorcios (nombre, direccion, cuit, cbu)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [input.nombre, input.direccion, input.cuit ?? null, input.cbu ?? null]
      );
    },
  },
};

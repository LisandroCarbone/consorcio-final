import { z } from "zod";
import { query, queryOne } from "../db.js";

export const unidadTools = {
  list_unidades: {
    description: "List all unidades for a consorcio",
    inputSchema: z.object({ consorcio_id: z.number().int().positive() }),
    async handler({ consorcio_id }: { consorcio_id: number }) {
      return query(
        `SELECT u.*,
                p.nombre || ' ' || p.apellido AS ocupante_nombre,
                p.email AS ocupante_email,
                p.whatsapp AS ocupante_whatsapp,
                o.rol AS ocupante_rol
         FROM unidades u
         LEFT JOIN ocupantes o ON o.unidad_id = u.id AND o.activo = true
         LEFT JOIN personas p ON p.id = o.persona_id
         WHERE u.consorcio_id = $1
         ORDER BY u.numero`,
        [consorcio_id]
      );
    },
  },

  get_unidad: {
    description: "Get a single unidad by ID",
    inputSchema: z.object({ id: z.number().int().positive() }),
    async handler({ id }: { id: number }) {
      const row = await queryOne("SELECT * FROM unidades WHERE id = $1", [id]);
      if (!row) throw new Error(`Unidad ${id} not found`);
      return row;
    },
  },

  create_unidad: {
    description: "Create a new unidad in a consorcio",
    inputSchema: z.object({
      consorcio_id: z.number().int().positive(),
      numero: z.string().min(1),
      piso: z.string().optional(),
      departamento: z.string().optional(),
      coeficiente: z.number().positive(),
      tipo: z.enum(["departamento", "cochera", "local", "baulera"]).default("departamento"),
    }),
    async handler(input: {
      consorcio_id: number;
      numero: string;
      piso?: string;
      departamento?: string;
      coeficiente: number;
      tipo: string;
    }) {
      return queryOne(
        `INSERT INTO unidades (consorcio_id, numero, piso, departamento, coeficiente, tipo)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [input.consorcio_id, input.numero, input.piso ?? null, input.departamento ?? null, input.coeficiente, input.tipo]
      );
    },
  },
};

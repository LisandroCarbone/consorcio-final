import { z } from "zod";
import { query, queryOne } from "../db.js";

export const expensaTools = {
  create_periodo: {
    description: "Create a new liquidation period for a consorcio",
    inputSchema: z.object({
      consorcio_id: z.number().int().positive(),
      anio: z.number().int().min(2020).max(2100),
      mes: z.number().int().min(1).max(12),
      fecha_vencimiento: z.string().optional(),
    }),
    async handler(input: { consorcio_id: number; anio: number; mes: number; fecha_vencimiento?: string }) {
      return queryOne(
        `INSERT INTO periodos (consorcio_id, anio, mes, fecha_vencimiento)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [input.consorcio_id, input.anio, input.mes, input.fecha_vencimiento ?? null]
      );
    },
  },

  get_periodo: {
    description: "Get a period by consorcio, year and month",
    inputSchema: z.object({
      consorcio_id: z.number().int().positive(),
      anio: z.number().int(),
      mes: z.number().int().min(1).max(12),
    }),
    async handler(input: { consorcio_id: number; anio: number; mes: number }) {
      return queryOne(
        "SELECT * FROM periodos WHERE consorcio_id=$1 AND anio=$2 AND mes=$3",
        [input.consorcio_id, input.anio, input.mes]
      );
    },
  },

  add_gasto: {
    description: "Add an expense to a period",
    inputSchema: z.object({
      periodo_id: z.number().int().positive(),
      concepto: z.string().min(1),
      monto: z.number().positive(),
      tipo: z.enum(["ordinario", "extraordinario", "fondo_reserva"]).default("ordinario"),
      comprobante_url: z.string().optional(),
    }),
    async handler(input: { periodo_id: number; concepto: string; monto: number; tipo: string; comprobante_url?: string }) {
      return queryOne(
        `INSERT INTO gastos (periodo_id, concepto, monto, tipo, comprobante_url)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [input.periodo_id, input.concepto, input.monto, input.tipo, input.comprobante_url ?? null]
      );
    },
  },

  calcular_expensas: {
    description: "Calculate and generate expensas for all unidades in a period based on their coeficientes",
    inputSchema: z.object({ periodo_id: z.number().int().positive() }),
    async handler({ periodo_id }: { periodo_id: number }) {
      // Get period and consorcio
      const periodo = await queryOne<{ id: number; consorcio_id: number; estado: string }>(
        "SELECT * FROM periodos WHERE id=$1",
        [periodo_id]
      );
      if (!periodo) throw new Error(`Periodo ${periodo_id} not found`);
      if (periodo.estado === "liquidado") throw new Error("Period is already liquidated");

      // Sum gastos by type
      const totales = await queryOne<{ ordinario: string; extraordinario: string; fondo_reserva: string }>(
        `SELECT
           COALESCE(SUM(monto) FILTER (WHERE tipo='ordinario'), 0) AS ordinario,
           COALESCE(SUM(monto) FILTER (WHERE tipo='extraordinario'), 0) AS extraordinario,
           COALESCE(SUM(monto) FILTER (WHERE tipo='fondo_reserva'), 0) AS fondo_reserva
         FROM gastos WHERE periodo_id=$1`,
        [periodo_id]
      );
      if (!totales) throw new Error("Could not sum gastos");

      // Get all unidades for this consorcio
      const unidades = await query<{ id: number; coeficiente: string }>(
        "SELECT id, coeficiente FROM unidades WHERE consorcio_id=$1",
        [periodo.consorcio_id]
      );

      // Calculate total coeficiente sum
      const totalCoef = unidades.reduce((acc, u) => acc + parseFloat(u.coeficiente), 0);

      // Upsert expensa per unidad
      const results = [];
      for (const unidad of unidades) {
        const coef = parseFloat(unidad.coeficiente) / totalCoef;
        const montoOrdinario = parseFloat(totales.ordinario) * coef;
        const montoExtraordinario = parseFloat(totales.extraordinario) * coef;
        const montoFondoReserva = parseFloat(totales.fondo_reserva) * coef;

        const row = await queryOne(
          `INSERT INTO expensas (periodo_id, unidad_id, monto_ordinario, monto_extraordinario, monto_fondo_reserva)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (periodo_id, unidad_id) DO UPDATE SET
             monto_ordinario=$3, monto_extraordinario=$4, monto_fondo_reserva=$5
           RETURNING *`,
          [periodo_id, unidad.id, montoOrdinario.toFixed(2), montoExtraordinario.toFixed(2), montoFondoReserva.toFixed(2)]
        );
        results.push(row);
      }

      // Mark period as liquidated
      await query("UPDATE periodos SET estado='liquidado', fecha_cierre=CURRENT_DATE WHERE id=$1", [periodo_id]);

      return { expensas_generadas: results.length, expensas: results };
    },
  },

  marcar_expensa_pagada: {
    description: "Mark an expensa as paid",
    inputSchema: z.object({
      expensa_id: z.number().int().positive(),
      fecha_pago: z.string().optional(),
    }),
    async handler({ expensa_id, fecha_pago }: { expensa_id: number; fecha_pago?: string }) {
      return queryOne(
        `UPDATE expensas SET estado='pagada', fecha_pago=$1 WHERE id=$2 RETURNING *`,
        [fecha_pago ?? new Date().toISOString().split("T")[0], expensa_id]
      );
    },
  },

  list_expensas_periodo: {
    description: "List all expensas for a period with occupant info",
    inputSchema: z.object({ periodo_id: z.number().int().positive() }),
    async handler({ periodo_id }: { periodo_id: number }) {
      return query(
        `SELECT e.*,
                u.numero AS unidad_numero,
                p.nombre || ' ' || p.apellido AS ocupante_nombre,
                p.email AS ocupante_email,
                p.whatsapp AS ocupante_whatsapp
         FROM expensas e
         JOIN unidades u ON u.id = e.unidad_id
         LEFT JOIN ocupantes o ON o.unidad_id = u.id AND o.activo=true AND o.rol='propietario'
         LEFT JOIN personas p ON p.id = o.persona_id
         WHERE e.periodo_id=$1
         ORDER BY u.numero`,
        [periodo_id]
      );
    },
  },
};

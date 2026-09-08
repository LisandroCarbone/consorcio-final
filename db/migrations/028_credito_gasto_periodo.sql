-- F6: Compensación de gasto pagado por UF — vincula un crédito en
-- app.credito_unidad al gasto que lo originó, cuando una UF adelanta el
-- pago de un gasto prorrateado A/B y se le compensa con crédito en cuenta
-- corriente (ver portal/src/app/expensas/actions.ts, addGasto).
ALTER TABLE app.credito_unidad ADD COLUMN IF NOT EXISTS gasto_periodo_id integer REFERENCES app.gastos_periodo(id);

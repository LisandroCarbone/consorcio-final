---
name: db-verify-change
description: Verify a code change by querying the database directly. Use this instead of browser testing when the browser pane doesn't work. Runs targeted queries to confirm the change had the expected effect on real data.
---

# DB Verify Change

**Use this skill** after a code change + Docker rebuild when you can't verify via browser. Query the database directly to confirm the change works.

## How to Use

### 1. Identify What Changed
Determine the expected data effect of the code change:
- New query filter → verify filtered results differ from unfiltered
- New INSERT/UPDATE → verify rows exist with correct values
- Calculation change → verify computed values match expected

### 2. Query Templates

**Verify a query filter change (e.g., excluding provisions):**
```bash
cd "C:/Users/Ignacio/OneDrive/Escritorio/Proyectaso/consorcio-final"

# Before (what the old query would return)
docker exec consorcio-postgres psql -U consorcio -d consorcio -c "
SELECT SUM(monto) as total_con_provisiones FROM app.gastos_periodo WHERE periodo_id = <ID>;
"

# After (what the new query returns)
docker exec consorcio-postgres psql -U consorcio -d consorcio -c "
SELECT SUM(monto) as total_sin_provisiones FROM app.gastos_periodo 
WHERE periodo_id = <ID> AND (es_provision = false OR es_provision IS NULL);
"

# Difference should match the expected exclusion
```

**Verify a server action works (e.g., saving data):**
```bash
# Check the data BEFORE the action
docker exec consorcio-postgres psql -U consorcio -d consorcio -c "
SELECT * FROM app.<table> WHERE <condition> LIMIT 5;
"

# Trigger the action via the app (tell user to click the button)
# Then check AFTER
docker exec consorcio-postgres psql -U consorcio -d consorcio -c "
SELECT * FROM app.<table> WHERE <condition> ORDER BY updated_at DESC LIMIT 5;
"
```

**Verify a calculation change:**
```bash
# Get the input values
docker exec consorcio-postgres psql -U consorcio -d consorcio -c "
SELECT ef_saldo_anterior, total_pagar, su_pago, deuda, intereses
FROM app.res_cuenta_periodo r
JOIN app.periodos_expensas p ON p.id = r.periodo_id
WHERE p.id = <periodo_id>
LIMIT 5;
"

# Manually verify: does deuda = saldo_anterior - su_pago?
# Does intereses = deuda * tasa when deuda > 0?
```

**Verify Estado Financiero data:**
```bash
docker exec consorcio-postgres psql -U consorcio -d consorcio -c "
SELECT 
  ef_saldo_anterior,
  ef_cobranzas_sin_identificar,
  ef_gastos_extra,
  (SELECT COALESCE(SUM(monto),0) FROM app.gastos_periodo 
   WHERE periodo_id = p.id AND (es_provision = false OR es_provision IS NULL)) as gastos_reales,
  (SELECT COALESCE(SUM(monto),0) FROM app.gastos_periodo 
   WHERE periodo_id = p.id AND es_provision = true) as provisiones,
  (SELECT COALESCE(SUM(monto),0) FROM app.pagos 
   WHERE consorcio_cuit = p.consorcio_cuit 
   AND fecha >= (p.anio || '-' || LPAD(p.mes::text, 2, '0') || '-01')::date
   AND fecha < (p.anio || '-' || LPAD(p.mes::text, 2, '0') || '-01')::date + interval '1 month') as cobranzas
FROM app.periodos_expensas p
WHERE p.id = <periodo_id>;
"
```

### 3. Report Results
After querying:
- Show the user the query results
- Explain what each number means
- Confirm whether the values match expectations
- If something looks wrong, investigate BEFORE declaring success

### 4. Common Consorcio Verifications

| Change Type | What to Query |
|---|---|
| Expense filter | SUM(monto) with and without filter |
| Payment registration | pagos table + res_cuenta_periodo.su_pago |
| Saldo anterior edit | res_cuenta_periodo.saldo_anterior for the unit |
| Estado Financiero | ef_saldo_anterior + cobranzas - gastos = saldo_cierre |
| Interest calculation | deuda × tasa = intereses |
| Conciliación | extracto_movimientos.estado_match counts |

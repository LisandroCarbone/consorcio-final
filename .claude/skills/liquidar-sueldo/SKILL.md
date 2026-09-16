---
name: liquidar-sueldo
description: Orchestrate payroll liquidation with domain validation via Mariano
disable-model-invocation: true
---

# Liquidar Sueldo

Orchestrated payroll liquidation workflow with mandatory domain expert review.

## Pre-requisites

- Employee and consorcio data must exist in the DB
- Current SUTERH escalas must be loaded (check `/sueldos/escalas`)
- Know the periodo (YYYY-MM) and empleado to liquidate

## Steps

1. **Validate input**: Confirm empleado_id, consorcio_id, periodo exist in DB
2. **Check escalas**: Verify escalas for the target periodo are loaded. If not, run the SUTERH scraper first
3. **Consult Mariano**: Before ANY calculation, send the liquidation parameters to the `revisor-liquidacion` agent for domain validation:
   - Verify categoria, funcion, antiguedad are correct
   - Verify applicable adicionales (retiro residuos, clasificacion, etc.)
   - Verify any reemplazo/suplente conditions
4. **Generate liquidation**: Call the liquidation engine with validated parameters
5. **Post-validation**: Send the generated recibo back to Mariano for final review:
   - Check totals make sense for the categoria/funcion
   - Verify deductions (jubilacion, obra social, sindicato, FAECYS)
   - Verify net pay is reasonable
6. **Report**: Show liquidation summary with any warnings from Mariano

## CRITICAL RULES

- NEVER modify `engine.ts` without consulting Mariano FIRST
- NEVER skip the pre-validation step
- If Mariano flags an issue, STOP and report to the user before proceeding
- Interest calculations for expensas use simple interest (art. 770 CCyC) — NEVER compound

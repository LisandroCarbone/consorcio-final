# Consorcio Portal — Codex Instructions

## Project
Next.js 14 (App Router) portal for Argentine building consortium management. Payroll (liquidaciones), expenses (expensas), and financial reporting.

## Critical Files
- `src/lib/liquidacion/engine.ts` — Payroll calculation engine. Legal risk. Never change calculation logic without domain review.
- `src/lib/expenses/engine.ts` — Expense distribution engine. Rounding and coefficient edge cases.
- `src/app/sueldos/actions.ts` — Server actions for payroll. N+1 queries were fixed with prefetch pattern.

## Rules
- Argentine labor law CCT 589/10 governs payroll calculations.
- Interest on overdue expenses uses simple interest (art. 770 CCyC), never compound.
- All queries must be consorcio-scoped (multi-tenant by `consorcio_cuit`).
- Use `DISTINCT ON` with explicit `ORDER BY` for deterministic batch queries.
- Prefetch pattern: optional param, fallback to internal query when not passed.
- Tests: Vitest, pure-logic only (no DB mocking). Run with `npx vitest run`.

## Stack
Next.js 14, TypeScript, Tailwind CSS, PostgreSQL (Railway), Docker for local builds.

## Business Rules (from domain reviews)

- **Seguro Vitalicio empleado vs SCVO patronal are distinct** (CCT 589/10): "Seguro Vitalicio" is an employee deduction (0.75% of remuneración, Art. 27 bis) that ALWAYS applies regardless of antigüedad/category — part of `calcDescuentosEmpleado`, no exclusion param. "SCVO" (Seguro Colectivo de Vida Obligatorio) is a separate employer contribution (fixed cost per CUIL) — part of `calcContribPatronal`, with a 30-day antigüedad floor for suplentes (`excluirSCVO`). Never share the same exclusion flag between the two. `excluirSCVO` must only be passed into `calcContribPatronal`, never into `calcDescuentosEmpleado`. When a concept mentions "vitalicio"/"seguro", confirm with domain review whether an exclusion condition applies to both empleado and patronal sides or only one.

- **Media jornada — only OS contribution uses full-time-equivalent base** (Ley 26474): For jornada "Media" employees, ONLY the obra social contribution (employer and employee difference) uses the full-time-equivalent básico from the escala (`baseOS`, via `escalaMap`/`resolverFuncionCompletaEquivalente`). ALL other contributions (jubilación, SUTERH, FATERYH%, SERACARH, ART) must use the actual `totalRemunerativoFinal` (real bruto), not the full-time equivalent. `calcContribPatronal` takes separate `base` (real bruto) and `baseOS` (full-time equivalent) params — this split must be replicated in any independent reimplementation of patronal contributions (e.g. F.931 report in `sueldos/actions.ts` currently does NOT apply this split and understates OS obligations for media jornada).

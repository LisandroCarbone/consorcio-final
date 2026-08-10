// Manual verification script for interest-engine.ts (no test framework in this project).
// Run with: node --experimental-strip-types scripts/verify-interest-engine.ts
// Exercises the fixtures from the spec: multi-period debt, partial payment,
// credit carryover, zero-debt, overpayment.

import {
  calcularInteresesPeriodo,
  calcularMesesAtraso,
  imputarPago,
  revertirImputacion,
  reimputarTodosPagos,
  type DeudaPeriodo,
  type TasaInteres,
} from "../src/lib/expenses/interest-engine.ts";

let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) {
    failures++;
    console.log(`  expected: ${JSON.stringify(expected)}`);
    console.log(`  actual:   ${JSON.stringify(actual)}`);
  }
}

function deuda(overrides: Partial<DeudaPeriodo>): DeudaPeriodo {
  return {
    id: 1,
    unidadId: 1,
    periodoId: 1,
    montoOriginal: 0,
    montoCapitalPendiente: 0,
    montoInteresesAcumulado: 0,
    montoInteresesPendiente: 0,
    mesesAtraso: 0,
    estado: "pendiente",
    fechaVencimiento: new Date("2026-01-01"),
    ...overrides,
  };
}

// --- Scenario: Interest on single unpaid period ---
// unit A, period 2026-03 unpaid, capital $10,000, rate 2%, calc on 2026-06-01 (3 months delay)
{
  const deudas: DeudaPeriodo[] = [
    deuda({ id: 1, montoCapitalPendiente: 10000, fechaVencimiento: new Date("2026-03-10") }),
  ];
  const tasas: TasaInteres[] = [{ tasa: 0.02, fechaDesde: new Date("2026-01-01"), fechaHasta: null }];
  const { resultados } = calcularInteresesPeriodo(deudas, tasas, new Date("2026-06-01"));
  check("Interest on single unpaid period: meses", resultados[0].mesesAtraso, 3);
  check("Interest on single unpaid period: interes", resultados[0].interesCalculado, 600);
}

// --- Scenario: Multiple unpaid periods with different rates ---
{
  const deudas: DeudaPeriodo[] = [
    deuda({ id: 1, montoCapitalPendiente: 10000, fechaVencimiento: new Date("2026-01-10") }),
    deuda({ id: 2, montoCapitalPendiente: 10000, fechaVencimiento: new Date("2026-04-10") }),
  ];
  const tasas: TasaInteres[] = [
    { tasa: 0.015, fechaDesde: new Date("2026-01-01"), fechaHasta: null },
    { tasa: 0.02, fechaDesde: new Date("2026-04-01"), fechaHasta: null },
  ];
  const { resultados } = calcularInteresesPeriodo(deudas, tasas, new Date("2026-06-01"));
  check("Multi-rate period 1 meses", resultados[0].mesesAtraso, 5);
  check("Multi-rate period 1 tasa", resultados[0].tasaAplicada, 0.015);
  check("Multi-rate period 2 meses", resultados[1].mesesAtraso, 2);
  check("Multi-rate period 2 tasa", resultados[1].tasaAplicada, 0.02);
}

// --- Scenario: Zero delay produces no interest ---
{
  const deudas: DeudaPeriodo[] = [
    deuda({ id: 1, montoCapitalPendiente: 5000, fechaVencimiento: new Date("2026-06-10") }),
  ];
  const tasas: TasaInteres[] = [{ tasa: 0.02, fechaDesde: new Date("2026-01-01"), fechaHasta: null }];
  const { resultados } = calcularInteresesPeriodo(deudas, tasas, new Date("2026-06-05"));
  check("Zero delay produces no interest", resultados[0].interesCalculado, 0);
  check("calcularMesesAtraso before due day is 0", calcularMesesAtraso(new Date("2026-06-10"), new Date("2026-06-05")), 0);
}

// --- Scenario: Partial payment covers interest only ---
{
  const deudas: DeudaPeriodo[] = [
    deuda({ id: 1, montoCapitalPendiente: 10000, montoInteresesPendiente: 600, fechaVencimiento: new Date("2026-01-10") }),
  ];
  const result = imputarPago(deudas, 400);
  check("Partial payment covers interest only", result.imputaciones, [{ deudaPeriodoId: 1, montoAInteres: 400, montoACapital: 0 }]);
  check("Partial payment leaves no credit", result.creditoRestante, 0);
}

// --- Scenario: Payment covers interest + partial capital ---
{
  const deudas: DeudaPeriodo[] = [
    deuda({ id: 1, montoCapitalPendiente: 10000, montoInteresesPendiente: 600, fechaVencimiento: new Date("2026-01-10") }),
  ];
  const result = imputarPago(deudas, 5600);
  check("Payment covers interest + partial capital", result.imputaciones, [{ deudaPeriodoId: 1, montoAInteres: 600, montoACapital: 5000 }]);
}

// --- Scenario: Payment spans multiple periods ---
{
  const deudas: DeudaPeriodo[] = [
    deuda({ id: 1, montoCapitalPendiente: 1000, montoInteresesPendiente: 0, fechaVencimiento: new Date("2026-01-10") }),
    deuda({ id: 2, montoCapitalPendiente: 2000, montoInteresesPendiente: 0, fechaVencimiento: new Date("2026-02-10") }),
  ];
  const result = imputarPago(deudas, 2500);
  check("Payment spans multiple periods", result.imputaciones, [
    { deudaPeriodoId: 1, montoAInteres: 0, montoACapital: 1000 },
    { deudaPeriodoId: 2, montoAInteres: 0, montoACapital: 1500 },
  ]);
}

// --- Scenario: Overpayment creates credit ---
{
  const deudas: DeudaPeriodo[] = [
    deuda({ id: 1, montoCapitalPendiente: 5000, montoInteresesPendiente: 0, fechaVencimiento: new Date("2026-01-10") }),
  ];
  const result = imputarPago(deudas, 5500);
  check("Overpayment creates credit — imputado", result.imputaciones, [{ deudaPeriodoId: 1, montoAInteres: 0, montoACapital: 5000 }]);
  check("Overpayment creates credit — credito restante", result.creditoRestante, 500);
}

// --- Scenario: Credit auto-applied (simulated as creditoPrevio input) ---
{
  const deudas: DeudaPeriodo[] = [
    deuda({ id: 1, montoCapitalPendiente: 8000, montoInteresesPendiente: 0, fechaVencimiento: new Date("2026-02-10") }),
  ];
  const result = imputarPago(deudas, 0, 500);
  check("Credit auto-applied", result.imputaciones, [{ deudaPeriodoId: 1, montoAInteres: 0, montoACapital: 500 }]);
  check("Credit auto-applied — remaining credit", result.creditoRestante, 0);
}

// --- Scenario: Payment deleted triggers re-imputation ---
{
  const deudasBase: DeudaPeriodo[] = [
    deuda({ id: 1, montoOriginal: 1000, montoCapitalPendiente: 1000, montoInteresesAcumulado: 0, montoInteresesPendiente: 0, fechaVencimiento: new Date("2026-01-10") }),
    deuda({ id: 2, montoOriginal: 1000, montoCapitalPendiente: 1000, montoInteresesAcumulado: 0, montoInteresesPendiente: 0, fechaVencimiento: new Date("2026-02-10") }),
  ];
  const pagos = [
    { id: 1, monto: 1000, fecha: new Date("2026-01-15") },
    { id: 2, monto: 500, fecha: new Date("2026-01-20") }, // will be "deleted"
    { id: 3, monto: 500, fecha: new Date("2026-02-15") },
  ];
  const full = reimputarTodosPagos(deudasBase, pagos);
  check("Full reimputation clears all debt", full.deudasFinales.every(d => d.estado === "pagada"), true);

  const withoutPago2 = reimputarTodosPagos(deudasBase, pagos.filter(p => p.id !== 2));
  check("Re-imputation without pago #2 leaves debt", withoutPago2.deudasFinales.some(d => d.estado !== "pagada"), true);
}

// --- Scenario: revertirImputacion restores pending amounts ---
{
  const deudas: DeudaPeriodo[] = [
    deuda({ id: 1, montoCapitalPendiente: 5000, montoInteresesPendiente: 0, montoInteresesAcumulado: 0, fechaVencimiento: new Date("2026-01-10") }),
  ];
  const imputado = imputarPago(deudas, 5000);
  const afterPago = deudas.map(d => {
    const imp = imputado.imputaciones.find(i => i.deudaPeriodoId === d.id)!;
    return { ...d, montoCapitalPendiente: round(d.montoCapitalPendiente - imp.montoACapital) };
  });
  check("Payment fully paid the period", afterPago[0].montoCapitalPendiente, 0);
  const reverted = revertirImputacion(afterPago, imputado.imputaciones);
  check("Reversal restores capital pendiente", reverted[0].montoCapitalPendiente, 5000);
  check("Reversal restores estado pendiente", reverted[0].estado, "pendiente");
}

// --- Scenario: imputarPago with monto < 0 throws ---
{
  const deudas: DeudaPeriodo[] = [
    deuda({ id: 1, montoCapitalPendiente: 1000, fechaVencimiento: new Date("2026-01-10") }),
  ];
  let threw = false;
  try {
    imputarPago(deudas, -100);
  } catch {
    threw = true;
  }
  check("imputarPago with monto < 0 throws", threw, true);
}

// --- Scenario: imputarPago with empty deudas — all money becomes credit ---
{
  const result = imputarPago([], 500);
  check("imputarPago with empty deudas — imputaciones", result.imputaciones, []);
  check("imputarPago with empty deudas — creditoRestante", result.creditoRestante, 500);
}

// --- Scenario: calcularInteresesPeriodo with empty deudas returns empty ---
{
  const tasas: TasaInteres[] = [{ tasa: 0.02, fechaDesde: new Date("2026-01-01"), fechaHasta: null }];
  const { resultados, errores } = calcularInteresesPeriodo([], tasas, new Date("2026-06-01"));
  check("calcularInteresesPeriodo with empty deudas — resultados", resultados, []);
  check("calcularInteresesPeriodo with empty deudas — errores", errores, []);
}

// --- Scenario: calcularMesesAtraso 1 day past month boundary ---
{
  check(
    "calcularMesesAtraso 1 day past month boundary",
    calcularMesesAtraso(new Date("2026-03-31"), new Date("2026-04-01")),
    1
  );
}

// --- Scenario: Two debts with same fechaVencimiento — sort stability ---
{
  const deudas: DeudaPeriodo[] = [
    deuda({ id: 1, montoCapitalPendiente: 1000, montoInteresesPendiente: 0, fechaVencimiento: new Date("2026-01-10") }),
    deuda({ id: 2, montoCapitalPendiente: 2000, montoInteresesPendiente: 0, fechaVencimiento: new Date("2026-01-10") }),
  ];
  const result = imputarPago(deudas, 1500);
  check("Same fechaVencimiento — sort stability (id order preserved)", result.imputaciones, [
    { deudaPeriodoId: 1, montoAInteres: 0, montoACapital: 1000 },
    { deudaPeriodoId: 2, montoAInteres: 0, montoACapital: 500 },
  ]);
}

function round(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

console.log(`\n${failures === 0 ? "ALL PASS" : `${failures} FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);

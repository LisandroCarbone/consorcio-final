import { describe, it, expect } from "vitest";
import {
  safe,
  calcAniosAntigüedad,
  diasAntiguedad,
  calcDescuentosEmpleado,
  calcContribPatronal,
  diasVacacionesPorAntigüedad,
  diasPreaviso,
  aniosParaIndemnizacion,
  type Consorcio,
} from "@/lib/liquidacion/engine";

describe("safe", () => {
  it("returns the value unchanged when it is a finite number", () => {
    expect(safe(123.45)).toBe(123.45);
    expect(safe(0)).toBe(0);
    expect(safe(-10)).toBe(-10);
  });

  it("falls back to 0 by default for NaN", () => {
    expect(safe(NaN)).toBe(0);
  });

  it("falls back to 0 by default for Infinity", () => {
    expect(safe(Infinity)).toBe(0);
    expect(safe(-Infinity)).toBe(0);
  });

  it("uses the provided fallback value", () => {
    expect(safe(NaN, 42)).toBe(42);
  });
});

describe("calcAniosAntigüedad", () => {
  it("computes full years between fecha_ingreso and the end of the periodo month", () => {
    expect(calcAniosAntigüedad("2020-01-15", "2025-01-01")).toBe(5);
  });

  it("does not count the current year if the anniversary has not happened yet within periodo month", () => {
    // ingreso day 20, periodo month ends day 28 (Feb) -> anniversary (20) happened before month end -> counts
    expect(calcAniosAntigüedad("2020-02-20", "2025-02-01")).toBe(5);
  });

  it("credits the year if the anniversary falls within the periodo month", () => {
    // ingreso on Jan 31 2020, periodo Jan 2025 (last day 31) -> anniversary reached exactly at month end
    expect(calcAniosAntigüedad("2020-01-31", "2025-01-01")).toBe(5);
  });

  it("does not go below 0 for a same-year ingreso", () => {
    expect(calcAniosAntigüedad("2025-06-01", "2025-01-01")).toBe(0);
  });
});

describe("diasAntiguedad", () => {
  it("computes days between fecha_ingreso and the end of periodo month when there is no fecha_egreso", () => {
    const dias = diasAntiguedad("2025-01-01", "2025-01-01");
    // last day of Jan 2025 is Jan 31 -> 30 days elapsed since Jan 1
    expect(dias).toBe(30);
  });

  it("caps at fecha_egreso when the employee left before the end of the periodo month", () => {
    const dias = diasAntiguedad("2025-01-01", "2025-01-01", "2025-01-10");
    expect(dias).toBe(9);
  });

  it("ignores fecha_egreso when it falls after the end of the periodo month", () => {
    const withFutureEgreso = diasAntiguedad("2025-01-01", "2025-01-01", "2025-06-30");
    const withoutEgreso = diasAntiguedad("2025-01-01", "2025-01-01");
    expect(withFutureEgreso).toBe(withoutEgreso);
  });

  it("never returns a negative number", () => {
    expect(diasAntiguedad("2025-06-01", "2025-01-01")).toBe(0);
  });
});

describe("calcDescuentosEmpleado", () => {
  it("computes standard percentage-based descuentos for a non-suplente employee", () => {
    const base = 100000;
    const d = calcDescuentosEmpleado(base, false);
    expect(d.jubilacion).toBeCloseTo(base * 0.11, 6);
    expect(d.pami).toBeCloseTo(base * 0.03, 6);
    expect(d.obraSocial).toBeCloseTo(base * 0.03, 6);
    expect(d.suterh).toBeCloseTo(base * 0.02, 6);
    expect(d.cajaProtFlia).toBeCloseTo(base * 0.01, 6);
    expect(d.fateryh).toBeCloseTo(base * 0.01, 6);
    expect(d.seguroVital).toBeCloseTo(base * 0.0075, 6);
    expect(d.fondoEducacion).toBe(0);
  });

  it("zeroes out suterh and fateryh for suplentes (per CCT)", () => {
    const base = 100000;
    const d = calcDescuentosEmpleado(base, true);
    expect(d.suterh).toBe(0);
    expect(d.fateryh).toBe(0);
    // jubilación/pami/obraSocial/cajaProtFlia/seguroVital still apply to suplentes
    expect(d.jubilacion).toBeCloseTo(base * 0.11, 6);
  });

  it("includes difObraSocial as a passthrough addend in total", () => {
    const base = 100000;
    const difOS = 500;
    const withDiff = calcDescuentosEmpleado(base, false, difOS);
    const withoutDiff = calcDescuentosEmpleado(base, false, 0);
    expect(withDiff.difObraSocial).toBe(difOS);
    expect(withDiff.total).toBeCloseTo(withoutDiff.total + difOS, 6);
  });

  it("applies fondoEducacion (2%) only when flag is true and employee is not suplente", () => {
    const base = 100000;
    const permanente = calcDescuentosEmpleado(base, false, 0, true);
    const suplente = calcDescuentosEmpleado(base, true, 0, true);
    expect(permanente.fondoEducacion).toBeCloseTo(base * 0.02, 6);
    expect(suplente.fondoEducacion).toBe(0);
  });

  it("total equals the sum of all individual descuento components", () => {
    const base = 87654.32;
    const d = calcDescuentosEmpleado(base, false, 123.45, true);
    const sum =
      d.jubilacion + d.pami + d.obraSocial + d.difObraSocial +
      d.suterh + d.cajaProtFlia + d.fateryh + d.seguroVital + d.fondoEducacion;
    expect(d.total).toBeCloseTo(sum, 9);
  });
});

describe("calcContribPatronal", () => {
  const cons: Consorcio = {
    cuit: "20-12345678-9",
    nombre: "Test",
    cant_uf: 10,
    categoria_edificio: 1,
    tiene_cochera: false,
    tiene_movimiento_coches: false,
    tiene_jardin: false,
    zona_desfavorable: false,
    tiene_pileta: false,
    art_pct_variable: 0.02,
    art_fijo: null,
    art_ffep: null,
    art_cant_cuiles: null,
    sv_compania: null,
    sv_costo_fijo: 300,
    sv_cant_cuiles: null,
    sv_costo_emision: null,
    pct_contrib_jubilacion: 0.18,
    pct_contrib_obra_social: 0.06,
    pct_cct_suterh: 0.015,
    pct_cct_fateryh: 0.0475,
    pct_cct_seracarh: 0.005,
    fateryh_fijo_completa: null,
    fateryh_fijo_media: null,
    fateryh_fijo_suplente_hora: null,
    uf_retiro_residuos: null,
  };

  it("computes each contribución as base (or baseOS) times its configured percentage", () => {
    const base = 100000;
    const baseOS = 100000;
    const r = calcContribPatronal(base, baseOS, cons);
    expect(r.jubilacion).toBeCloseTo(base * 0.18, 6);
    expect(r.obraSocial).toBeCloseTo(baseOS * 0.06, 6);
    expect(r.suterh).toBeCloseTo(base * 0.015, 6);
    expect(r.fateryh).toBeCloseTo(base * 0.0475, 6);
    expect(r.seracarh).toBeCloseTo(base * 0.005, 6);
    expect(r.art).toBeCloseTo(base * 0.02, 6);
  });

  it("falls back to default percentages when the consorcio does not define them", () => {
    const consWithoutPct: Consorcio = { ...cons, pct_contrib_jubilacion: null, pct_contrib_obra_social: null };
    const r = calcContribPatronal(100000, 100000, consWithoutPct);
    expect(r.jubilacion).toBeCloseTo(100000 * 0.18, 6);
    expect(r.obraSocial).toBeCloseTo(100000 * 0.06, 6);
  });

  it("uses sv_costo_fijo as scvo when no override is given", () => {
    const r = calcContribPatronal(100000, 100000, cons);
    expect(r.scvo).toBe(300);
  });

  it("uses scvoOverride (e.g. 0 to exclude suplente < 30 days) instead of sv_costo_fijo", () => {
    const r = calcContribPatronal(100000, 100000, cons, "Completa", 0, 0, 0);
    expect(r.scvo).toBe(0);
  });

  it("applies fateryh_art19bis fully for jornada Completa", () => {
    const r = calcContribPatronal(100000, 100000, cons, "Completa", 0, 1000);
    expect(r.fateryh_fijo).toBe(1000);
  });

  it("applies fateryh_art19bis at 50% for jornada Media", () => {
    const r = calcContribPatronal(100000, 100000, cons, "Media", 0, 1000);
    expect(r.fateryh_fijo).toBe(500);
  });

  it("prorates fateryh_art19bis by horasTotalesSuplente/200 for jornada Suplente", () => {
    const r = calcContribPatronal(100000, 100000, cons, "Suplente", 100, 1000);
    expect(r.fateryh_fijo).toBe(500); // 1000 * (100/200)
  });

  it("total equals the sum of all contribución components", () => {
    const r = calcContribPatronal(100000, 90000, cons, "Completa", 0, 800);
    const sum = r.jubilacion + r.obraSocial + r.suterh + r.fateryh + r.fateryh_fijo + r.seracarh + r.art + r.scvo;
    expect(r.total).toBeCloseTo(sum, 9);
  });
});

describe("diasVacacionesPorAntigüedad (LCT art. 150)", () => {
  it("returns 12 days for less than 5 years", () => {
    expect(diasVacacionesPorAntigüedad(0)).toBe(12);
    expect(diasVacacionesPorAntigüedad(4.9)).toBe(12);
  });

  it("returns 20 days for 5 to under 10 years", () => {
    expect(diasVacacionesPorAntigüedad(5)).toBe(20);
    expect(diasVacacionesPorAntigüedad(9.9)).toBe(20);
  });

  it("returns 24 days for 10 to under 20 years", () => {
    expect(diasVacacionesPorAntigüedad(10)).toBe(24);
    expect(diasVacacionesPorAntigüedad(19.9)).toBe(24);
  });

  it("returns 28 days for 20+ years", () => {
    expect(diasVacacionesPorAntigüedad(20)).toBe(28);
    expect(diasVacacionesPorAntigüedad(35)).toBe(28);
  });
});

describe("diasPreaviso (LCT art. 231)", () => {
  it("returns 15 days for less than 1 year of antigüedad", () => {
    expect(diasPreaviso(0)).toBe(15);
    expect(diasPreaviso(0.9)).toBe(15);
  });

  it("returns 30 days for 1 to under 5 years", () => {
    expect(diasPreaviso(1)).toBe(30);
    expect(diasPreaviso(4.9)).toBe(30);
  });

  it("returns 60 days for 5+ years", () => {
    expect(diasPreaviso(5)).toBe(60);
    expect(diasPreaviso(20)).toBe(60);
  });
});

describe("aniosParaIndemnizacion (Art. 245 LCT)", () => {
  it("counts exact whole years with no rounding when there is no fractional remainder", () => {
    expect(aniosParaIndemnizacion("2015-03-01", "2025-03-01")).toBe(10);
  });

  it("does NOT round up a fraction of 3 months or less", () => {
    // 10 years + 3 months exactly -> stays at 10
    expect(aniosParaIndemnizacion("2015-03-01", "2025-06-01")).toBe(10);
  });

  it("rounds up a fraction greater than 3 months to a full year", () => {
    // 10 years + 4 months -> rounds up to 11
    expect(aniosParaIndemnizacion("2015-03-01", "2025-07-01")).toBe(11);
  });

  it("never returns less than 1 year, even for a very short tenure", () => {
    expect(aniosParaIndemnizacion("2025-01-01", "2025-02-01")).toBe(1);
  });

  it("handles a fecha_egreso day before fecha_ingreso day within the month (borrows a month)", () => {
    // ingreso Jan 20 2020, egreso Jan 10 2025 (10 days short of 5 full years).
    // Year diff = 5, month diff = 0, but egreso day (10) < ingreso day (20)
    // so the algorithm borrows a month: anios=4, mesesRestantes=11. Since
    // 11 > 3, Art. 245 rounds the fraction up to a full year -> 5.
    expect(aniosParaIndemnizacion("2020-01-20", "2025-01-10")).toBe(5);
  });
});

import { describe, it, expect } from "vitest";
import { round2, calculateEmployerObligations } from "@/lib/expenses/engine";

describe("round2", () => {
  it("rounds to 2 decimal places", () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(10.004)).toBe(10);
    expect(round2(10.005)).toBe(10.01);
  });

  it("avoids classic floating point rounding errors", () => {
    // 1.115 stored in IEEE754 is slightly less than 1.115, naive
    // Math.round(1.115 * 100) / 100 would give 1.11 without EPSILON correction
    expect(round2(1.115)).toBe(1.12);
  });

  it("handles negative numbers", () => {
    expect(round2(-1.005)).toBe(-1);
    expect(round2(-10.256)).toBe(-10.26);
  });

  it("handles zero", () => {
    expect(round2(0)).toBe(0);
  });

  it("is idempotent", () => {
    const once = round2(123.456789);
    expect(round2(once)).toBe(once);
  });
});

describe("calculateEmployerObligations", () => {
  const baseArgs = {
    totalRemunerativo: 100000,
    funcion: "Encargado Permanente sin vivienda",
    jornada: "Completa",
    diasTrabajadosSuplente: 0,
    artPctVariable: 0.03,
    svCostoFijo: 500,
    diffOsVal: 0,
  };

  it("computes f931 as the sum of SS + OS aportes and contribuciones", () => {
    const r = calculateEmployerObligations(
      baseArgs.totalRemunerativo,
      baseArgs.funcion,
      baseArgs.jornada,
      baseArgs.diasTrabajadosSuplente,
      baseArgs.artPctVariable,
      baseArgs.svCostoFijo,
      baseArgs.diffOsVal
    );

    // base10 = R - detraccion(12003.68) => f931 must reflect the detracción
    // applied only to the SS contribución patronal base, not to aportes.
    const R = baseArgs.totalRemunerativo;
    const detraccion = round2(12003.68);
    const base10 = Math.max(0, R - detraccion);
    const aportesSS = round2(R * 0.1445);
    const aportesOS = round2(R * 0.0255);
    const contribucionesOS = round2(R * 0.051);
    const contribucionesSS = round2(base10 * 0.18 + R * 0.009);
    const expectedF931 = round2(aportesSS + contribucionesSS + aportesOS + contribucionesOS);

    expect(r.f931).toBe(expectedF931);
  });

  it("computes ART as pct variable * remunerativo plus fixed cost", () => {
    const r = calculateEmployerObligations(
      100000,
      "Encargado Permanente sin vivienda",
      "Completa",
      0,
      0.03,
      500,
      0,
      0.045,
      0.065,
      0.005,
      false,
      200 // artCostoFijo
    );
    expect(r.art).toBe(round2(100000 * 0.03 + 200));
  });

  it("scvo passes through svCostoFijo unchanged", () => {
    const r = calculateEmployerObligations(
      100000,
      "Encargado Permanente sin vivienda",
      "Completa",
      0,
      0.03,
      777.5,
      0
    );
    expect(r.scvo).toBe(777.5);
  });

  it("applies media jornada detracción as half of detraccionBase", () => {
    const r1 = calculateEmployerObligations(
      50000,
      "Encargado Media jornada",
      "Media",
      0,
      0.03,
      500,
      0
    );
    // For media jornada, base10 = R - detraccionBase/2
    const detraccion = round2(12003.68 / 2);
    const base10 = Math.max(0, 50000 - detraccion);
    const expectedContribSS = round2(base10 * 0.18 + 50000 * 0.009);
    const aportesSS = round2(50000 * 0.1445);
    const aportesOS = round2(50000 * 0.0255);
    const contribucionesOS = round2(50000 * 0.051);
    expect(r1.f931).toBe(round2(aportesSS + expectedContribSS + aportesOS + contribucionesOS));
  });

  it("prorates detracción for suplentes by días trabajados over 30", () => {
    const r = calculateEmployerObligations(
      30000,
      "Suplente",
      "Completa",
      15, // diasTrabajadosSuplente
      0.03,
      0,
      0
    );
    const detraccion = round2((12003.68 * 15) / 30);
    const base10 = Math.max(0, 30000 - detraccion);
    const expectedContribSS = round2(base10 * 0.18 + 30000 * 0.009);
    const aportesSS = round2(30000 * 0.1445);
    const aportesOS = round2(30000 * 0.0255);
    const contribucionesOS = round2(30000 * 0.051);
    expect(r.f931).toBe(round2(aportesSS + expectedContribSS + aportesOS + contribucionesOS));
  });

  it("multiplies detracción by 1.5 in SAC months (June/December)", () => {
    const rNormal = calculateEmployerObligations(
      100000,
      "Encargado Permanente sin vivienda",
      "Completa",
      0,
      0.03,
      500,
      0,
      0.045,
      0.065,
      0.005,
      false // isSacPeriod = false
    );
    const rSac = calculateEmployerObligations(
      100000,
      "Encargado Permanente sin vivienda",
      "Completa",
      0,
      0.03,
      500,
      0,
      0.045,
      0.065,
      0.005,
      true // isSacPeriod = true
    );
    // SAC period has a larger detracción -> base10 = max(0, R - detraccion)
    // is SMALLER -> contribuciones SS (base10 * pctContribSS) is lower ->
    // f931 ends up LOWER than the non-SAC period.
    expect(rSac.f931).toBeLessThan(rNormal.f931);
  });

  it("base10 never goes negative even if detracción exceeds remunerativo", () => {
    const r = calculateEmployerObligations(
      5000, // small R, smaller than detraccionBase
      "Encargado Permanente sin vivienda",
      "Completa",
      0,
      0.03,
      0,
      0
    );
    // base10 = max(0, R - detraccion) = 0 in this case
    const aportesSS = round2(5000 * 0.1445);
    const aportesOS = round2(5000 * 0.0255);
    const contribucionesOS = round2(5000 * 0.051);
    const contribucionesSS = round2(0 * 0.18 + 5000 * 0.009);
    expect(r.f931).toBe(round2(aportesSS + contribucionesSS + aportesOS + contribucionesOS));
  });

  it("adds diffOsVal/0.03 to base4 (OS aportes/contribuciones base) when diffOsVal > 0", () => {
    const rNoDiff = calculateEmployerObligations(
      100000,
      "Encargado Permanente sin vivienda",
      "Completa",
      0,
      0.03,
      0,
      0
    );
    const rWithDiff = calculateEmployerObligations(
      100000,
      "Encargado Permanente sin vivienda",
      "Completa",
      0,
      0.03,
      0,
      300 // diffOsVal
    );
    // base4 increases -> aportesOS and contribucionesOS increase
    expect(rWithDiff.f931).toBeGreaterThan(rNoDiff.f931);
  });

  it("computes suterh, fateryh, seracarh as flat percentages of R", () => {
    const r = calculateEmployerObligations(
      100000,
      "Encargado Permanente sin vivienda",
      "Completa",
      0,
      0.03,
      0,
      0,
      0.045,
      0.065,
      0.005
    );
    expect(r.suterh).toBe(round2(100000 * 0.045));
    expect(r.fateryh).toBe(round2(100000 * 0.065));
    expect(r.seracarh).toBe(round2(100000 * 0.005));
  });
});

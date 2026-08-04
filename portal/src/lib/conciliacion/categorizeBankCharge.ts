// Pure function: classify a bank movement description as a bank charge category.
// Returns null when the description does not match any known bank charge pattern.

export type BankChargeCategoria =
  | "ley_25413"
  | "comision"
  | "iva"
  | "mantenimiento";

type BankChargePattern = {
  pattern: RegExp;
  categoria: BankChargeCategoria;
  label: string;
};

export const BANK_CHARGE_PATTERNS: BankChargePattern[] = [
  { pattern: /LEY\s*NRO?\s*25\.?4/i, categoria: "ley_25413", label: "Imp. Ley 25.413" },
  { pattern: /IMPUESTO\s*LEY/i, categoria: "ley_25413", label: "Imp. Débito/Crédito" },
  { pattern: /COMISION\s*(TRA|MOV|EXT)/i, categoria: "comision", label: "Comisión Bancaria" },
  { pattern: /IVA\s*TASA/i, categoria: "iva", label: "IVA s/Comisiones" },
  { pattern: /COM\s*MANT/i, categoria: "mantenimiento", label: "Comisión Mantenimiento" },
];

export function categorizeBankCharge(descripcion: string | null | undefined): BankChargeCategoria | null {
  if (!descripcion) return null;
  for (const { pattern, categoria } of BANK_CHARGE_PATTERNS) {
    if (pattern.test(descripcion)) return categoria;
  }
  return null;
}

export function bankChargeLabel(categoria: string | null | undefined): string {
  const found = BANK_CHARGE_PATTERNS.find((p) => p.categoria === categoria);
  return found ? found.label : categoria || "";
}

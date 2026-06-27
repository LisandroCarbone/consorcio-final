export function formatMoney(n: number | string): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(n));
}

export function formatMoney0(n: number | string): string {
  return formatMoney(n);
}

export function formatEmpleadoOption(e: { nombre: string; legajo: string | null }): string {
  return e.legajo ? `${e.nombre} (${e.legajo})` : e.nombre;
}

export const MONTH_NAMES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function formatMonth(anio: number, mes: number): string {
  return `${MONTH_NAMES[mes] ?? mes} ${anio}`;
}

export function formatDate(d: string | Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-AR", { timeZone: "UTC" });
}

export function numberToWords(n: number): string {
  const ones = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
    "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
  const tens = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const hundreds = ["", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos",
    "seiscientos", "setecientos", "ochocientos", "novecientos"];

  const belowThousand = (num: number): string => {
    if (num === 0) return "";
    if (num === 100) return "cien";
    if (num < 20) return ones[num];
    if (num < 100) {
      const t = Math.floor(num / 10);
      const o = num % 10;
      return o === 0 ? tens[t] : `${tens[t]} y ${ones[o]}`;
    }
    const h = Math.floor(num / 100);
    const rest = num % 100;
    return rest === 0 ? hundreds[h] : `${hundreds[h]} ${belowThousand(rest)}`;
  };

  const integer = Math.floor(n);
  const cents = Math.round((n - integer) * 100);
  const millions = Math.floor(integer / 1_000_000);
  const thousands = Math.floor((integer % 1_000_000) / 1000);
  const remainder = integer % 1000;

  let words = "";
  if (millions > 0) words += millions === 1 ? "un millón " : `${belowThousand(millions)} millones `;
  if (thousands > 0) words += thousands === 1 ? "mil " : `${belowThousand(thousands)} mil `;
  if (remainder > 0) words += belowThousand(remainder) + " ";
  if (integer === 0) words = "cero ";

  const centsStr = cents === 0 ? "00/100" : `${cents}/100`;
  return `Son pesos ${words.trim()} con ${centsStr}`;
}

export function cleanPeriodo(p: string | undefined): string | undefined {
  if (!p) return undefined;
  // If it's already in YYYY-MM-DD format, it's clean
  if (/^\d{4}-\d{2}-\d{2}$/.test(p)) return p;
  
  // Try to parse it as a Date
  const parsed = new Date(p);
  if (isNaN(parsed.getTime())) return undefined; // Invalid date
  
  // Format as YYYY-MM-DD
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

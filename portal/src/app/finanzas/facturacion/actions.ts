"use server";

import { revalidatePath } from "next/cache";
import { emitirFacturaC } from "@/lib/arca";

export async function emitirFacturaAction(params: {
  cuitConsorcio: string;
  puntoVenta: number;
  cuitReceptor: string;
  monto: number;
  conceptoTipo: number;
  descripcion: string;
  fecha: string;
  periodoDesde?: string;
  periodoHasta?: string;
  vencimientoPago?: string;
}) {
  try {
    const res = await emitirFacturaC(params);
    revalidatePath("/finanzas/facturacion");
    return { success: true, ...res };
  } catch (err: any) {
    console.error("Fallo al emitir factura:", err);
    return { success: false, error: err.message || "Error al conectar con ARCA" };
  }
}

"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useToast } from "./Toast";

type ToastType = "success" | "error" | "warning" | "info";

const MESSAGES: Record<string, { text: string; type: ToastType }> = {
  recalculado: { text: "Liquidaciones recalculadas correctamente.", type: "success" },
  recalculado_parcial: { text: "", type: "warning" },
  confirmado: { text: "Liquidación confirmada.", type: "success" },
  guardado: { text: "Guardado correctamente.", type: "success" },
  sac_noop: { text: "El SAC se liquida por empleado desde la página de SAC.", type: "info" },
  error: { text: "Sin escalas para este período. Actualizalas desde la página de Escalas.", type: "error" },
};

/**
 * Legacy bridge: reads the `?ok=` query param (set by server actions that
 * still use redirect()) and shows it through the shared Toast system,
 * instead of rendering its own standalone banner.
 *
 * New code should call `useToast()` directly instead of relying on `?ok=`.
 */
export function ActionFeedback() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const ok = params.get("ok");
  const errores = params.get("errores");
  const shown = useRef(false);

  useEffect(() => {
    if (!ok || shown.current) return;
    shown.current = true;

    const msg = MESSAGES[ok] ?? { text: ok, type: "info" as ToastType };
    const text = ok === "recalculado_parcial"
      ? `Recalculado con ${errores} error${Number(errores) !== 1 ? "es" : ""}. Revisá que las escalas estén cargadas.`
      : msg.text;

    toast(text, msg.type);

    const next = new URLSearchParams(params.toString());
    next.delete("ok");
    next.delete("errores");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok]);

  return null;
}

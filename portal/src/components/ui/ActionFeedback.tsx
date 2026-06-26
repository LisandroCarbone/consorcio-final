"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const MESSAGES: Record<string, { text: string; cls: string }> = {
  recalculado: { text: "Liquidaciones recalculadas correctamente.", cls: "bg-green-50 border-green-300 text-green-800" },
  recalculado_parcial: { text: "", cls: "bg-yellow-50 border-yellow-300 text-yellow-800" },
  confirmado: { text: "Liquidación confirmada.", cls: "bg-green-50 border-green-300 text-green-800" },
  guardado: { text: "Guardado correctamente.", cls: "bg-green-50 border-green-300 text-green-800" },
  sac_noop: { text: "El SAC se liquida por empleado desde la página de SAC.", cls: "bg-blue-50 border-blue-300 text-blue-800" },
  error: { text: "Sin escalas para este período. Actualizalas desde la página de Escalas.", cls: "bg-red-50 border-red-300 text-red-800" },
};

export function ActionFeedback() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ok = params.get("ok");

  useEffect(() => {
    if (!ok) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      next.delete("ok");
      router.replace(`${pathname}?${next.toString()}`);
    }, 3500);
    return () => clearTimeout(t);
  }, [ok, params, pathname, router]);

  if (!ok) return null;
  const errores = params.get("errores");
  const msg = MESSAGES[ok] ?? { text: ok, cls: "bg-blue-50 border-blue-300 text-blue-800" };
  const text = ok === "recalculado_parcial"
    ? `Recalculado con ${errores} error${Number(errores) !== 1 ? "es" : ""}. Revisá que las escalas estén cargadas.`
    : msg.text;

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg px-4 py-3 text-sm font-medium shadow-md ${msg.cls} max-w-xs`}>
      {text}
    </div>
  );
}

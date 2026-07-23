"use client";

import { useState } from "react";
import { accionLiquidarDespido } from "./actions";

export function ConfirmarDespidoButton({
  empleadoCuil,
  fechaEgreso,
  tipoEgreso,
}: {
  empleadoCuil: string;
  fechaEgreso: string;
  tipoEgreso: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.set("empleado_cuil", empleadoCuil);
    fd.set("fecha_egreso", fechaEgreso);
    fd.set("tipo_egreso", tipoEgreso);
    await accionLiquidarDespido(fd);
    window.location.href = `/sueldos/despido?empleado_cuil=${empleadoCuil}&fecha_egreso=${fechaEgreso}&tipo_egreso=${tipoEgreso}&liquidado=1`;
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Confirmando…" : "Confirmar liquidación por egreso"}
      </button>
    </form>
  );
}

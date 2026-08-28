"use client";

import { useState } from "react";
import { accionLiquidarSAC } from "./actions";

export function ConfirmarSACButton({
  empleadoId,
  anio,
  semestre,
}: {
  empleadoId: number;
  anio: number;
  semestre: number;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.set("empleado_id", String(empleadoId));
    fd.set("anio", String(anio));
    fd.set("semestre", String(semestre));
    const result = await accionLiquidarSAC(fd);
    if (result?.error) {
      window.location.href = `/sueldos/sac?empleado_id=${empleadoId}&anio=${anio}&semestre=${semestre}&error=${encodeURIComponent(result.error)}`;
      return;
    }
    window.location.href = `/sueldos/sac?empleado_id=${empleadoId}&anio=${anio}&semestre=${semestre}&liquidado=1`;
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Confirmando…" : "Confirmar y guardar liquidación SAC"}
      </button>
    </form>
  );
}

import React from "react";
import { cookies } from "next/headers";
import { queryOne } from "@/lib/db";
import { ArcaConfigClient } from "./ArcaConfigClient";
import { obtenerDetallesARCA } from "./actions";

export default async function ArcaConfigPage() {
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  if (!activeCuit) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl select-none mb-4">🔌</span>
        <h2 className="text-2xl font-bold text-gray-900">Conexión ARCA (ex AFIP)</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          Por favor, selecciona un consorcio en la barra superior para configurar su firma digital y facturación electrónica.
        </p>
      </div>
    );
  }

  // Fetch consorcio details
  const consorcio = await queryOne<{ nombre: string }>(
    "SELECT nombre FROM app.consorcios WHERE cuit = $1",
    [activeCuit]
  );

  const consorcioNombre = consorcio?.nombre || "Consorcio Desconocido";

  // Fetch ARCA details
  const initialDetails = await obtenerDetallesARCA(activeCuit);

  return (
    <ArcaConfigClient
      cuit={activeCuit}
      consorcioNombre={consorcioNombre}
      initialDetails={initialDetails}
    />
  );
}

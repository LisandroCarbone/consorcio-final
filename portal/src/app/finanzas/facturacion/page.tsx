import React from "react";
import { cookies } from "next/headers";
import { queryOne, query } from "@/lib/db";
import { FacturacionClient } from "./FacturacionClient";

interface ComprobanteRow {
  id: number;
  cuit_emisor: string;
  punto_venta: number;
  cbte_tipo: number;
  cbte_nro: number;
  cae: string;
  cae_vto: string;
  fecha: string;
  cuit_receptor: string;
  concepto_tipo: number;
  monto_total: string;
  descripcion: string;
  created_at: string;
  [key: string]: unknown;
}

export default async function FacturacionPage() {
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  if (!activeCuit) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl select-none mb-4">🧾</span>
        <h2 className="text-2xl font-bold text-gray-900">Facturación Electrónica</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          Por favor, selecciona un consorcio en la barra superior para gestionar sus comprobantes fiscales emitidos.
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

  // Fetch issued comprobantes
  const comprobantes = await query<ComprobanteRow>(
    `SELECT id, cuit_emisor, punto_venta, cbte_tipo, cbte_nro, cae, 
            cae_vto::text, fecha::text, cuit_receptor, concepto_tipo, 
            monto_total::numeric, descripcion, created_at::text
     FROM app.arca_comprobantes 
     WHERE cuit_emisor = $1 
     ORDER BY cbte_nro DESC`,
    [activeCuit]
  );

  // Check if ARCA is configured
  const credentials = await queryOne<{ punto_venta: number; ambiente: string }>(
    "SELECT punto_venta, ambiente FROM app.arca_credentials WHERE cuit = $1",
    [activeCuit]
  );

  return (
    <FacturacionClient
      cuitConsorcio={activeCuit}
      consorcioNombre={consorcioNombre}
      comprobantes={comprobantes}
      arcaConfigured={!!credentials}
      puntoVentaConfigured={credentials?.punto_venta}
      ambiente={credentials?.ambiente}
    />
  );
}

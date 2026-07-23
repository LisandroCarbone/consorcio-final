"use server";

import { query } from "@/lib/db";

export async function sendCircular(formData: FormData) {
  const consorcio_id = formData.get("consorcio_id") as string;
  const message = formData.get("message") as string;

  const commsUrl = process.env.COMMS_AGENT_URL ?? "http://localhost:3002";
  const apiKey = process.env.AGENT_API_KEY ?? "changeme";

  const res = await fetch(`${commsUrl}/send-circular`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ consorcio_id, message }),
  });

  if (!res.ok) {
    throw new Error(`Error al enviar circular: ${res.status}`);
  }

  // Guardar en la base de datos
  await query(
    "INSERT INTO app.circulares (consorcio_cuit, mensaje) VALUES ($1, $2)",
    [consorcio_id, message]
  );
}

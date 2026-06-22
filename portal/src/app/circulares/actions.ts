"use server";

import { redirect } from "next/navigation";

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

  redirect("/circulares?sent=true");
}

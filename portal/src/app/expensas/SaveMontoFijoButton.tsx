"use client";

import { useState } from "react";
import { actualizarMontoFijo } from "./actions";

export function SaveMontoFijoButton() {
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      type="submit"
      className="btn-primary"
      disabled={isPending}
      formAction={async (formData: FormData) => {
        setIsPending(true);
        try {
          await actualizarMontoFijo(formData);
        } finally {
          window.location.reload();
        }
      }}
    >
      {isPending ? "Guardando..." : "Guardar monto"}
    </button>
  );
}

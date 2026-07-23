"use client";

import { useState } from "react";
import { createPeriodo } from "./actions";

export function CreatePeriodoButton() {
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      type="submit"
      className="btn-primary w-full justify-center"
      disabled={isPending}
      formAction={async (formData: FormData) => {
        setIsPending(true);
        try {
          const newId = await createPeriodo(formData);
          if (newId) {
            window.location.href = `/expensas?periodoId=${newId}`;
          } else {
            window.location.reload();
          }
        } catch {
          window.location.reload();
        }
      }}
    >
      {isPending ? "Creando..." : "Crear período"}
    </button>
  );
}

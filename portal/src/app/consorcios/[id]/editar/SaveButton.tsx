"use client";

import { useState } from "react";

export function SaveButton({ cuit }: { cuit: string }) {
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      type="submit"
      className="btn-primary"
      disabled={isPending}
      formAction={async (formData: FormData) => {
        setIsPending(true);
        const { updateConsorcioNoRedirect } = await import("../../actions");
        await updateConsorcioNoRedirect(formData);
        window.location.href = `/consorcios/${cuit}/editar?ok=guardado`;
      }}
    >
      {isPending ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

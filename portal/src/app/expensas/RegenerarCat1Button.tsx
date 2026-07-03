"use client";

import { useState } from "react";
import { regenerarGastosFijos } from "./actions";

export function RegenerarCat1Button({ periodoId }: { periodoId: number }) {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    try {
      await regenerarGastosFijos(periodoId);
    } finally {
      window.location.reload();
    }
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className="btn-secondary text-amber-700 border-amber-300 hover:bg-amber-50 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Regenerando...
        </span>
      ) : (
        "⚡ Regenerar Cat. 1"
      )}
    </button>
  );
}

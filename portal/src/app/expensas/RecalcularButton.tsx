"use client";

import { useState } from "react";
import { calcularExpensas } from "./actions";

export function RecalcularButton({
  periodoId,
  variant = "primary",
  isDesactualizado = false,
}: {
  periodoId: number;
  variant?: "primary" | "small";
  isDesactualizado?: boolean;
}) {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    try {
      await calcularExpensas(periodoId);
    } finally {
      window.location.reload();
    }
  }

  if (variant === "small") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="text-[10px] px-2 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-60"
      >
        {isPending ? "Calculando..." : "🔁 Recalcular"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className={`btn-primary transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
        isDesactualizado
          ? "bg-amber-600 hover:bg-amber-700 border-amber-600 shadow-md text-white animate-pulse"
          : ""
      }`}
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Recalculando...
        </span>
      ) : (
        "🔁 Recalcular prorrateo"
      )}
    </button>
  );
}

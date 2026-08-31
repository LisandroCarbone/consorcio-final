"use client";

import { useState, useTransition } from "react";
import { setUltimoDepositoManual, clearUltimoDepositoManual } from "../actions";

export function UltimoDepositoEditor({
  liquidacionId,
  consorcioCuit,
  periodoAnio,
  periodoMes,
  banco,
  fecha,
  fechaISO,
  isManual,
}: {
  liquidacionId: number;
  consorcioCuit: string;
  periodoAnio: number;
  periodoMes: number;
  banco: string;
  fecha: string;
  fechaISO: string;
  isManual: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [bancoValue, setBancoValue] = useState(banco);
  const [fechaValue, setFechaValue] = useState(fechaISO);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await setUltimoDepositoManual(
        consorcioCuit,
        periodoAnio,
        periodoMes,
        bancoValue,
        fechaValue,
        liquidacionId
      );
      setEditing(false);
    });
  }

  function handleClear() {
    startTransition(async () => {
      await clearUltimoDepositoManual(consorcioCuit, periodoAnio, periodoMes, liquidacionId);
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-1 print:hidden">
        <input
          type="text"
          value={bancoValue}
          onChange={(e) => setBancoValue(e.target.value)}
          placeholder="Banco"
          className="border border-gray-300 rounded px-1 py-0.5 text-sm w-32"
          disabled={isPending}
        />
        <input
          type="date"
          value={fechaValue}
          onChange={(e) => setFechaValue(e.target.value)}
          className="border border-gray-300 rounded px-1 py-0.5 text-sm"
          disabled={isPending}
        />
        <button
          onClick={handleSave}
          disabled={isPending}
          className="text-xs bg-brand-600 text-white rounded px-2 py-0.5 hover:bg-brand-700 disabled:opacity-50"
        >
          {isPending ? "..." : "Guardar"}
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setBancoValue(banco);
            setFechaValue(fechaISO);
          }}
          disabled={isPending}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Cancelar
        </button>
        {isManual && (
          <button
            onClick={handleClear}
            disabled={isPending}
            className="text-xs text-gray-500 hover:text-red-600 underline"
          >
            Volver a automático
          </button>
        )}
      </div>
    );
  }

  const hasValue = Boolean(banco || fecha || periodoMes);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {hasValue ? (
        <p className="text-gray-700">
          {periodoMes && periodoAnio && (
            <>
              <span className="text-gray-400 uppercase">Período </span>
              <span className="font-semibold">
                {String(periodoMes).padStart(2, "0")}/{periodoAnio}
              </span>
            </>
          )}
          {fecha && (
            <>
              {"  —  "}
              <span className="text-gray-400 uppercase">Fecha </span>
              <span className="font-semibold">{fecha}</span>
            </>
          )}
          {banco && (
            <>
              {"  —  "}
              <span className="text-gray-400 uppercase">Banco </span>
              <span className="font-semibold">{banco}</span>
            </>
          )}
          {"  "}
          {isManual ? (
            <span className="inline-block text-[9px] print:text-[7px] uppercase font-semibold bg-amber-100 text-amber-700 rounded px-1 py-0.5 align-middle">
              Manual
            </span>
          ) : (
            <span className="text-gray-400 text-[10px] print:text-[7px] align-middle">
              (automático)
            </span>
          )}
        </p>
      ) : (
        <p className="text-gray-400 italic">Sin datos</p>
      )}
      <button
        onClick={() => setEditing(true)}
        className="print:hidden text-gray-400 hover:text-brand-600 text-xs"
        title="Editar último depósito"
      >
        ✏️
      </button>
    </div>
  );
}

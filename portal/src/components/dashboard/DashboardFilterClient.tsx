"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, ChevronDown, Check } from "lucide-react";

interface DashboardFilterClientProps {
  consorcios: { cuit: string; nombre: string }[];
  selectedCuits: string[];
}

export function DashboardFilterClient({ consorcios, selectedCuits }: DashboardFilterClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function updateSelection(newSelected: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (newSelected.length === 0 || newSelected.length === consorcios.length) {
      params.delete("cuits");
    } else {
      params.set("cuits", newSelected.join(","));
    }
    router.push(`/?${params.toString()}`);
  }

  function toggleCuit(cuit: string) {
    const isSelected = selectedCuits.includes(cuit);
    const newSelected = isSelected
      ? selectedCuits.filter((c) => c !== cuit)
      : [...selectedCuits, cuit];
    updateSelection(newSelected);
  }

  function selectAll() {
    updateSelection([]);
  }

  const allSelected = selectedCuits.length === 0;
  const label = allSelected
    ? "Todos los consorcios"
    : selectedCuits.length === 1
    ? consorcios.find((c) => c.cuit === selectedCuits[0])?.nombre ?? "1 consorcio"
    : `${selectedCuits.length} consorcios`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-secondary flex items-center gap-2 text-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Building2 className="w-4 h-4" />
        <span>{label}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={selectAll}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 border-b border-gray-100 font-semibold"
          >
            <span>Todos los consorcios</span>
            {allSelected && <Check className="w-4 h-4 text-brand-600" />}
          </button>
          <ul role="listbox">
            {consorcios.map((c) => {
              const checked = selectedCuits.includes(c.cuit);
              return (
                <li key={c.cuit}>
                  <button
                    type="button"
                    onClick={() => toggleCuit(c.cuit)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50"
                    role="option"
                    aria-selected={checked}
                  >
                    <span>{c.nombre}</span>
                    {checked && <Check className="w-4 h-4 text-brand-600" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

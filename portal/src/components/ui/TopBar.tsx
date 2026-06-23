"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Consorcio {
  cuit: string;
  nombre: string;
}

interface TopBarProps {
  consorcios: Consorcio[];
  activeCuit: string;
  activePeriodo: string;
}

export function TopBar({ consorcios, activeCuit, activePeriodo }: TopBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPeriodo = searchParams.get("periodo");

  React.useEffect(() => {
    if (urlPeriodo && urlPeriodo !== activePeriodo) {
      document.cookie = `active_periodo=${urlPeriodo}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [urlPeriodo, activePeriodo]);

  const currentSelectedPeriod = urlPeriodo || activePeriodo;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cuit = e.target.value;
    if (!cuit) {
      // Clear cookie
      document.cookie = "active_consorcio_cuit=; path=/; max-age=0; SameSite=Lax";
    } else {
      // Set cookie
      document.cookie = `active_consorcio_cuit=${cuit}; path=/; max-age=31536000; SameSite=Lax`;
    }
    window.location.reload();
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value;
    if (!period) {
      document.cookie = "active_periodo=; path=/; max-age=0; SameSite=Lax";
    } else {
      document.cookie = `active_periodo=${period}; path=/; max-age=31536000; SameSite=Lax`;
    }
    // If we're on a page with a searchParam for period, remove/update it to avoid mismatch
    const url = new URL(window.location.href);
    if (url.searchParams.has("periodo")) {
      url.searchParams.delete("periodo");
      window.location.href = url.pathname + url.search;
    } else {
      window.location.reload();
    }
  };


  // Generate list of months: last 12 months, current month, next 6 months
  const now = new Date();
  const months = [];
  for (let i = -12; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const label = d.toLocaleDateString("es-AR", { month: "long", year: "numeric", timeZone: "UTC" });
    months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Consorcio Selector */}
        <div className="flex items-center gap-2 w-64">
          <span className="text-gray-400 text-base">🏢</span>
          <div className="relative w-full">
            <select
              value={activeCuit}
              onChange={handleSelectChange}
              className="block w-full appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-2.5 pr-8 text-sm font-medium text-gray-800 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 cursor-pointer transition-shadow hover:shadow-sm"
            >
              <option value="">Todos los consorcios</option>
              {consorcios.map((c) => (
                <option key={c.cuit} value={c.cuit}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
              <span className="text-[10px]">▼</span>
            </div>
          </div>
        </div>

        {/* Periodo Selector */}
        <div className="flex items-center gap-2 w-56">
          <span className="text-gray-400 text-base">📅</span>
          <div className="relative w-full">
            <select
              value={currentSelectedPeriod}
              onChange={handlePeriodChange}
              className="block w-full appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-2.5 pr-8 text-sm font-medium text-gray-800 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 cursor-pointer transition-shadow hover:shadow-sm"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
              <span className="text-[10px]">▼</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col text-right">
          <span className="text-xs font-semibold text-gray-800">Administrador</span>
          <span className="text-[10px] text-gray-400">Soporte técnico</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
          N
        </div>
      </div>
    </header>
  );
}

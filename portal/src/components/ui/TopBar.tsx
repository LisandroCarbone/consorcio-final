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

const MONTHS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

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

  // Parse currently selected year and month
  const periodParts = currentSelectedPeriod ? currentSelectedPeriod.split("-") : [];
  const selectedYear = periodParts[0] || String(new Date().getFullYear());
  const selectedMonth = periodParts[1] || String(new Date().getMonth() + 1).padStart(2, "0");

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

  const updatePeriod = (year: string, month: string) => {
    const period = `${year}-${month}-01`;
    document.cookie = `active_periodo=${period}; path=/; max-age=31536000; SameSite=Lax`;
    
    // If we're on a page with a searchParam for period, remove/update it to avoid mismatch
    const url = new URL(window.location.href);
    if (url.searchParams.has("periodo")) {
      url.searchParams.delete("periodo");
      window.location.href = url.pathname + url.search;
    } else {
      window.location.reload();
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updatePeriod(selectedYear, e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updatePeriod(e.target.value, selectedMonth);
  };

  // Generate dynamic list of years (2 years back to 2 years ahead)
  const now = new Date();
  const currentYear = now.getFullYear();
  const baseYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i); // e.g. 2024, 2025, 2026, 2027, 2028
  
  const parsedSelectedYear = parseInt(selectedYear, 10);
  if (parsedSelectedYear && !baseYears.includes(parsedSelectedYear)) {
    baseYears.push(parsedSelectedYear);
    baseYears.sort((a, b) => a - b);
  }
  const years = baseYears;

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

        {/* Periodo Selector - Mes y Año por separado */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-base">📅</span>
          
          {/* Select de Mes */}
          <div className="relative w-36">
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="block w-full appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-2.5 pr-8 text-sm font-medium text-gray-800 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 cursor-pointer transition-shadow hover:shadow-sm"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
              <span className="text-[10px]">▼</span>
            </div>
          </div>

          {/* Select de Año */}
          <div className="relative w-24">
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="block w-full appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-2.5 pr-8 text-sm font-medium text-gray-800 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 cursor-pointer transition-shadow hover:shadow-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
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


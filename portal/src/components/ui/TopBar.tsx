"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface Consorcio {
  cuit: string;
  nombre: string;
}

interface TopBarProps {
  consorcios: Consorcio[];
  activeCuit: string;
}

export function TopBar({ consorcios, activeCuit }: TopBarProps) {
  const router = useRouter();

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cuit = e.target.value;
    if (!cuit) {
      // Clear cookie
      document.cookie = "active_consorcio_cuit=; path=/; max-age=0; SameSite=Lax";
    } else {
      // Set cookie
      document.cookie = `active_consorcio_cuit=${cuit}; path=/; max-age=31536000; SameSite=Lax`;
    }
    // Refresh page to load server component with new cookie
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 w-80">
        <span className="text-gray-400 text-lg">🏢</span>
        <div className="relative w-full">
          <select
            value={activeCuit}
            onChange={handleSelectChange}
            className="block w-full appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-gray-800 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 cursor-pointer transition-shadow hover:shadow-sm"
          >
            <option value="">Todos los consorcios</option>
            {consorcios.map((c) => (
              <option key={c.cuit} value={c.cuit}>
                {c.nombre}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <span className="text-xs">▼</span>
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

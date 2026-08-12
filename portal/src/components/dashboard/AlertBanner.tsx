"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import type { AlertItem } from "@/lib/queries/dashboard";

interface AlertBannerProps {
  items: AlertItem[];
}

export function AlertBanner({ items }: AlertBannerProps) {
  const [open, setOpen] = useState(true);

  if (!items || items.length === 0) {
    return (
      <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 flex gap-2.5 items-start">
        <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-brand-800">Todo en orden</p>
          <p className="text-[10px] text-brand-600 mt-0.5">
            No hay alertas críticas pendientes en este momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
          <div className="text-left">
            <h3 className="font-bold text-gray-800 text-base">Alertas</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {items.length} alerta{items.length === 1 ? "" : "s"} que requieren atención
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="p-4 space-y-2.5">
          {items.map((item, i) => (
            <Link
              key={`${item.type}-${i}`}
              href={item.href}
              className={`block rounded-lg border p-3 transition-colors hover:opacity-90 ${
                item.severity === "high"
                  ? "bg-red-50 border-red-100"
                  : "bg-orange-50 border-orange-100"
              }`}
            >
              <p
                className={`text-xs font-bold ${
                  item.severity === "high" ? "text-red-700" : "text-orange-700"
                }`}
              >
                {item.title}
              </p>
              <p
                className={`text-[10px] mt-0.5 ${
                  item.severity === "high" ? "text-red-600" : "text-orange-600"
                }`}
              >
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

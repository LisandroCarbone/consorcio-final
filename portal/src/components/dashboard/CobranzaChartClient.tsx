"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatMoney } from "@/lib/format";
import type { CobranzaRow } from "@/lib/queries/dashboard";

interface CobranzaChartClientProps {
  data: CobranzaRow[];
}

export function CobranzaChartClient({ data }: CobranzaChartClientProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-xs">
        <span>📊 Sin datos de cobranza del período</span>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const row = payload[0].payload as CobranzaRow;
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-150 p-3 rounded-lg shadow-lg">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{row.consorcio}</p>
          <p className="text-sm font-extrabold text-brand-700 mt-0.5">
            Cobrado: {formatMoney(row.cobrado)}
          </p>
          <p className="text-xs font-semibold text-orange-600 mt-0.5">
            Liquidado: {formatMoney(row.liquidado)}
          </p>
        </div>
      );
    }
    return null;
  };

  const height = Math.max(200, data.length * 40);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCobrado" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="var(--brand-600, #1a3c5e)" stopOpacity={0.9} />
              <stop offset="95%" stopColor="var(--brand-600, #1a3c5e)" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="colorLiquidado" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ea580c" stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis
            type="number"
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
          />
          <YAxis
            type="category"
            dataKey="consorcio"
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(26, 60, 94, 0.04)" }} />
          <Bar dataKey="liquidado" fill="url(#colorLiquidado)" radius={[0, 4, 4, 0]} maxBarSize={16} />
          <Bar dataKey="cobrado" fill="url(#colorCobrado)" radius={[0, 4, 4, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

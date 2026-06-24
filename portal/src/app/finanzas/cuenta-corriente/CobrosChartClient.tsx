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

interface CobrosData {
  mes: string;
  cobrado: number;
}

interface CobrosChartClientProps {
  data: CobrosData[];
}

export default function CobrosChartClient({ data }: CobrosChartClientProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-xs">
        <span>📊 Sin datos históricos de cobranza</span>
      </div>
    );
  }

  // Custom tooltip styles
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-150 p-3 rounded-lg shadow-lg">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{payload[0].payload.mes}</p>
          <p className="text-sm font-extrabold text-brand-700 mt-0.5">
            {formatMoney(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCobrado" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--brand-600, #1a3c5e)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--brand-600, #1a3c5e)" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="mes"
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(26, 60, 94, 0.04)' }} />
          <Bar
            dataKey="cobrado"
            fill="url(#colorCobrado)"
            radius={[4, 4, 0, 0]}
            maxBarSize={45}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

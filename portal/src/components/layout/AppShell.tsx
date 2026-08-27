"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/ui/Nav";
import { TopBar } from "@/components/ui/TopBar";

interface AppShellProps {
  children: React.ReactNode;
  consorcios: Array<{ cuit: string; nombre: string }>;
  activeCuit: string;
  activePeriodo: string;
}

export function AppShell({
  children,
  consorcios,
  activeCuit,
  activePeriodo,
}: AppShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="min-h-screen w-full bg-white">{children}</main>;
  }

  return (
    <>
      <div className="print:hidden">
        <Nav />
      </div>
      <div className="lg:ml-64 print:ml-0 flex flex-col min-h-screen">
        <div className="print:hidden">
          <TopBar
            consorcios={consorcios}
            activeCuit={activeCuit}
            activePeriodo={activePeriodo}
          />
        </div>
        <main className="flex-1 p-8 print:p-0 bg-gray-50 print:bg-white">
          {children}
        </main>
      </div>
    </>
  );
}

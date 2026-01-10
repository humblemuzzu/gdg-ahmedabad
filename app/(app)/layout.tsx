"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AnalysisProvider } from "@/lib/context/analysis-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <AnalysisProvider>
      <div className="relative min-h-screen bg-background">
        {/* Subtle gradient background */}
        <div className="fixed inset-0 -z-10 gradient-mesh opacity-30" />

        <Sidebar open={open} onClose={() => setOpen(false)} />
        <div className="md:pl-[260px]">
          <Header onMenuClick={() => setOpen(true)} />
          <main className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>
    </AnalysisProvider>
  );
}

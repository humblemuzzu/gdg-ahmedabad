"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AnalysisProvider } from "@/lib/context/analysis-context";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <AnalysisProvider>
      <div className="relative min-h-screen bg-background">
        {/* Subtle gradient background */}
        <div className="fixed inset-0 -z-10 gradient-mesh opacity-30" />

        <Sidebar 
          open={open} 
          onClose={() => setOpen(false)}
          isCollapsed={isCollapsed}
          onCollapsedChange={setIsCollapsed}
        />
        
        {/* Main content area - responsive padding for sidebar */}
        <div className={cn(
          "transition-all duration-300",
          isCollapsed ? "lg:pl-20" : "lg:pl-72"
        )}>
          <Header onMenuClick={() => setOpen(true)} />
          <main className="mx-auto w-full max-w-[1600px] px-6 py-8 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </AnalysisProvider>
  );
}

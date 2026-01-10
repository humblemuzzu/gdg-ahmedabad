"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AnalysisProvider } from "@/lib/context/analysis-context";
import { ThemeProvider } from "@/lib/context/theme-context";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "bb-sidebar-collapsed";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(true); // Default to collapsed
  const [mounted, setMounted] = React.useState(false);

  // Load sidebar state from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    // If no saved preference, default to collapsed (true)
    // If saved, parse the value
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
    setMounted(true);
  }, []);

  // Save sidebar state to localStorage
  const handleCollapsedChange = React.useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }, []);

  // Prevent layout shift before hydration
  if (!mounted) {
    return (
      <div className="relative min-h-screen bg-background">
        <div className="fixed inset-0 -z-10 gradient-mesh opacity-30" />
        <div className="lg:pl-20 transition-all duration-300">
          <main className="mx-auto w-full max-w-[1600px] px-6 py-8 lg:px-10 lg:py-10">
            {/* Loading skeleton or nothing */}
          </main>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AnalysisProvider>
        <div className="relative min-h-screen bg-background">
          {/* Subtle gradient background */}
          <div className="fixed inset-0 -z-10 gradient-mesh opacity-30" />

          <Sidebar 
            open={open} 
            onClose={() => setOpen(false)}
            isCollapsed={isCollapsed}
            onCollapsedChange={handleCollapsedChange}
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
    </ThemeProvider>
  );
}

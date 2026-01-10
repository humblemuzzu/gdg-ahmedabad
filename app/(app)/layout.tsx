"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
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
        <div className="lg:pl-14 transition-all duration-200">
          <main className="mx-auto w-full max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8">
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
            "transition-all duration-200 min-h-screen",
            isCollapsed ? "lg:pl-14" : "lg:pl-60"
          )}>
            {/* Mobile-only top bar */}
            <div className="sticky top-0 z-30 flex items-center h-14 px-4 bg-background/95 backdrop-blur-sm border-b border-border lg:hidden">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted"
                aria-label="Open menu"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <span className="ml-3 text-sm font-medium text-foreground">Bureaucracy Breaker</span>
            </div>
            
            <main className="mx-auto w-full max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8">
              {children}
            </main>
          </div>
        </div>
      </AnalysisProvider>
    </ThemeProvider>
  );
}

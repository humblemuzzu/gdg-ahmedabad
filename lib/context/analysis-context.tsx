"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAnalysis, type AnalysisState } from "@/lib/hooks/use-analysis";

interface AnalysisContextValue extends AnalysisState {
  analyze: (query: string) => Promise<void>;
  reset: () => void;
  isRunning: boolean;
  isComplete: boolean;
  hasError: boolean;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const analysis = useAnalysis();

  return (
    <AnalysisContext.Provider value={analysis}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysisContext() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysisContext must be used within an AnalysisProvider");
  }
  return context;
}

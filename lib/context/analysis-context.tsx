"use client";

import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from "react";
import { useAnalysis, type AnalysisState } from "@/lib/hooks/use-analysis";
import { useDemoMode, type DemoState } from "@/lib/hooks/use-demo-mode";
import { isFirstVisit, DEMO_QUERY } from "@/lib/demoData";

interface AnalysisContextValue extends AnalysisState {
  analyze: (query: string) => Promise<void>;
  reset: () => void;
  isRunning: boolean;
  isComplete: boolean;
  hasError: boolean;
  // Demo mode additions
  startDemo: () => Promise<void>;
  loadDemoInstant: () => Promise<string>;
  isDemoMode: boolean;
  demoProgress: number;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const analysis = useAnalysis();
  const demo = useDemoMode();
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check for first visit on mount (client-side only)
  useEffect(() => {
    // Auto-trigger demo on first visit (optional - uncomment to enable)
    // if (isFirstVisit()) {
    //   setIsDemoMode(true);
    //   demo.startDemo();
    // }
  }, []);

  // Wrapper to start demo and set mode
  const startDemo = useCallback(async () => {
    setIsDemoMode(true);
    await demo.startDemo();
  }, [demo]);

  // Wrapper for instant demo load
  const loadDemoInstant = useCallback(async () => {
    setIsDemoMode(true);
    return demo.loadDemoInstant();
  }, [demo]);

  // Reset clears both real and demo state
  const reset = useCallback(() => {
    setIsDemoMode(false);
    analysis.reset();
    demo.reset();
  }, [analysis, demo]);

  // Merge states - demo takes priority when active
  const mergedValue: AnalysisContextValue = isDemoMode
    ? {
        // Use demo state
        status: demo.status,
        caseId: demo.caseId,
        query: demo.query,
        agents: demo.agents,
        activities: demo.activities,
        result: demo.result,
        error: demo.error,
        steps: demo.steps,
        costs: demo.costs,
        risks: demo.risks,
        documents: demo.documents,
        debateMessages: demo.debateMessages,
        typingAgent: demo.typingAgent,
        // Functions
        analyze: analysis.analyze, // Keep real analyze available
        reset,
        isRunning: demo.isRunning,
        isComplete: demo.isComplete,
        hasError: demo.hasError,
        // Demo additions
        startDemo,
        loadDemoInstant,
        isDemoMode: true,
        demoProgress: demo.progress,
      }
    : {
        // Use real analysis state
        ...analysis,
        reset,
        // Demo additions
        startDemo,
        loadDemoInstant,
        isDemoMode: false,
        demoProgress: 0,
      };

  return (
    <AnalysisContext.Provider value={mergedValue}>
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

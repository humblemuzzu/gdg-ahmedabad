"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listCases,
  getCaseRecord,
  getCaseResult,
  getCaseEvents,
  deleteCase,
  getCaseAnalytics,
  type CaseRecord,
  type CaseAnalytics,
} from "@/lib/storage/caseStore";
import type { ProcessResult, AgentActivityStreamEvent } from "@/types";

export interface UseCaseStoreReturn {
  // Data
  cases: CaseRecord[];
  analytics: CaseAnalytics | null;
  
  // State
  isLoading: boolean;
  
  // Actions
  refresh: () => Promise<void>;
  getCase: (caseId: string) => Promise<CaseRecord | null>;
  getCaseData: (caseId: string) => Promise<{
    record: CaseRecord | null;
    result: ProcessResult | null;
    events: AgentActivityStreamEvent[];
  }>;
  removeCase: (caseId: string) => Promise<void>;
}

export function useCaseStore(): UseCaseStoreReturn {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [analytics, setAnalytics] = useState<CaseAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [recordsList, stats] = await Promise.all([
        listCases(),
        getCaseAnalytics(),
      ]);
      setCases(recordsList);
      setAnalytics(stats);
    } catch (error) {
      console.error("[useCaseStore] Failed to refresh:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCase = useCallback(async (caseId: string) => {
    return getCaseRecord(caseId);
  }, []);

  const getCaseData = useCallback(async (caseId: string) => {
    const [record, result, events] = await Promise.all([
      getCaseRecord(caseId),
      getCaseResult(caseId),
      getCaseEvents(caseId),
    ]);
    return { record, result, events };
  }, []);

  const removeCase = useCallback(async (caseId: string) => {
    await deleteCase(caseId);
    await refresh();
  }, [refresh]);

  // Load on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    cases,
    analytics,
    isLoading,
    refresh,
    getCase,
    getCaseData,
    removeCase,
  };
}

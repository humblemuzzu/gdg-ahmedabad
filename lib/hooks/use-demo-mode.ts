"use client";

/**
 * DEMO MODE HOOK
 * 
 * Provides a polished demo experience by simulating the analysis flow
 * with pre-computed data and realistic timing.
 * 
 * Usage:
 * 1. Call startDemo() to begin the demo
 * 2. Events will stream in with realistic delays
 * 3. UI updates automatically through the analysis context
 */

import { useCallback, useRef, useState } from "react";
import type {
  Agent,
  AgentActivityStreamEvent,
  ProcessResult,
  ProcessStep,
  ProcessCost,
  ProcessRisk,
  ProcessDocument,
  DebateMessage,
  Tier,
} from "@/types";
import {
  DEMO_QUERY,
  DEMO_RESULT,
  DEMO_SSE_EVENTS,
  DEMO_DEBATE_MESSAGES,
  markAsVisited,
} from "@/lib/demoData";
import {
  saveCaseStart,
  saveCaseResult,
} from "@/lib/storage/caseStore";
import {
  resultToSteps,
  resultToCosts,
  resultToRisks,
  resultToDocuments,
} from "@/lib/hooks/use-analysis";

// Agent info mapping (same as use-analysis.ts)
const AGENT_INFO: Record<string, { name: string; tier: Tier }> = {
  intent_decoder: { name: "Intent Decoder", tier: "intake" },
  location_intelligence: { name: "Location Intel", tier: "intake" },
  business_classifier: { name: "Business Classifier", tier: "intake" },
  scale_analyzer: { name: "Scale Analyzer", tier: "intake" },
  regulation_librarian: { name: "Regulation Librarian", tier: "research" },
  policy_scout: { name: "Policy Scout", tier: "research" },
  document_detective: { name: "Document Detective", tier: "research" },
  department_mapper: { name: "Department Mapper", tier: "research" },
  dependency_builder: { name: "Dependency Builder", tier: "strategy" },
  timeline_architect: { name: "Timeline Architect", tier: "strategy" },
  parallel_optimizer: { name: "Parallel Optimizer", tier: "strategy" },
  cost_calculator: { name: "Cost Calculator", tier: "strategy" },
  risk_assessor: { name: "Risk Assessor", tier: "strategy" },
  form_wizard: { name: "Form Wizard", tier: "document" },
  document_validator: { name: "Document Validator", tier: "document" },
  rti_drafter: { name: "RTI Drafter", tier: "document" },
  grievance_writer: { name: "Grievance Writer", tier: "document" },
  appeal_crafter: { name: "Appeal Crafter", tier: "document" },
  visit_planner: { name: "Visit Planner", tier: "execution" },
  reminder_engine: { name: "Reminder Engine", tier: "execution" },
  status_tracker: { name: "Status Tracker", tier: "execution" },
  corruption_detector: { name: "Corruption Detector", tier: "intelligence" },
  comparison_agent: { name: "Comparison Agent", tier: "intelligence" },
  whatif_simulator: { name: "What-If Simulator", tier: "intelligence" },
  expert_simulator: { name: "Expert Simulator", tier: "intelligence" },
  final_compiler: { name: "Final Compiler", tier: "intelligence" },
};

export type DemoStatus = "idle" | "running" | "complete" | "error";

export interface DemoState {
  status: DemoStatus;
  caseId: string | null;
  query: string | null;
  agents: Agent[];
  activities: AgentActivityStreamEvent[];
  result: ProcessResult | null;
  error: string | null;
  steps: ProcessStep[];
  costs: ProcessCost[];
  risks: ProcessRisk[];
  documents: ProcessDocument[];
  debateMessages: DebateMessage[];
  typingAgent: { id: string; name: string } | null;
  progress: number; // 0-100
}

const initialAgents: Agent[] = Object.entries(AGENT_INFO).map(([id, info]) => ({
  id,
  name: info.name,
  tier: info.tier,
  status: "idle" as const,
}));

const initialState: DemoState = {
  status: "idle",
  caseId: null,
  query: null,
  agents: initialAgents,
  activities: [],
  result: null,
  error: null,
  steps: [],
  costs: [],
  risks: [],
  documents: [],
  debateMessages: [],
  typingAgent: null,
  progress: 0,
};

function generateCaseId(): string {
  return `demo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useDemoMode() {
  const [state, setState] = useState<DemoState>(initialState);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isRunningRef = useRef(false);

  const cleanup = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    isRunningRef.current = false;
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setState(initialState);
  }, [cleanup]);

  const startDemo = useCallback(async () => {
    // Prevent multiple demos running
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    cleanup();

    const caseId = generateCaseId();
    const query = DEMO_QUERY;

    // Initialize state
    setState({
      ...initialState,
      status: "running",
      caseId,
      query,
      agents: initialAgents.map(a => ({ ...a, status: "idle" as const })),
    });

    // Save case start
    try {
      await saveCaseStart(caseId, query);
      console.log("[Demo] Case started:", caseId);
    } catch (e) {
      console.error("[Demo] Failed to save case start:", e);
    }

    // Mark as visited so first-visit detection doesn't retrigger
    markAsVisited();

    // Play back SSE events with timing
    const totalEvents = DEMO_SSE_EVENTS.length;
    
    DEMO_SSE_EVENTS.forEach((event, index) => {
      const timeout = setTimeout(() => {
        handleDemoEvent(event, setState, caseId, query, index, totalEvents);
      }, event.delay);
      timeoutsRef.current.push(timeout);
    });

  }, [cleanup]);

  // Immediately load demo result without animation (for instant display)
  const loadDemoInstant = useCallback(async () => {
    const caseId = generateCaseId();
    const query = DEMO_QUERY;

    // Save case
    try {
      await saveCaseStart(caseId, query);
      await saveCaseResult(caseId, query, DEMO_RESULT, []);
    } catch (e) {
      console.error("[Demo] Failed to save instant demo:", e);
    }

    markAsVisited();

    setState({
      status: "complete",
      caseId,
      query,
      agents: initialAgents.map(a => ({ ...a, status: "done" as const })),
      activities: [],
      result: DEMO_RESULT,
      error: null,
      steps: resultToSteps(DEMO_RESULT),
      costs: resultToCosts(DEMO_RESULT),
      risks: resultToRisks(DEMO_RESULT),
      documents: resultToDocuments(DEMO_RESULT),
      debateMessages: DEMO_DEBATE_MESSAGES,
      typingAgent: null,
      progress: 100,
    });

    return caseId;
  }, []);

  return {
    ...state,
    startDemo,
    loadDemoInstant,
    reset,
    isRunning: state.status === "running",
    isComplete: state.status === "complete",
    hasError: state.status === "error",
  };
}

// Handle individual demo events
function handleDemoEvent(
  event: typeof DEMO_SSE_EVENTS[0],
  setState: React.Dispatch<React.SetStateAction<DemoState>>,
  caseId: string,
  query: string,
  eventIndex: number,
  totalEvents: number
) {
  const progress = Math.round((eventIndex / totalEvents) * 100);

  switch (event.type) {
    case "meta":
      // Stream started
      setState(prev => ({ ...prev, progress }));
      break;

    case "event": {
      const author = String(event.data.author || "unknown");
      const text = event.data.text ? String(event.data.text) : undefined;
      const timestamp = event.data.timestamp as number;
      const agentId = author.replace(/-/g, "_");
      const agentInfo = AGENT_INFO[agentId];

      setState(prev => {
        // Update agent status
        const agents = prev.agents.map(agent => {
          if (agent.id === agentId) {
            return { ...agent, status: "working" as const, summary: text?.slice(0, 100) };
          }
          // Mark previous working agents as done
          if (agent.status === "working" && agent.id !== agentId) {
            return { ...agent, status: "done" as const };
          }
          return agent;
        });

        // Add activity event
        let activities = prev.activities;
        if (text && agentInfo) {
          const activity: AgentActivityStreamEvent = {
            id: `${agentId}-${timestamp}-${eventIndex}`,
            timestamp: "Just now",
            agentName: agentInfo.name,
            tier: agentInfo.tier,
            title: text.slice(0, 80) + (text.length > 80 ? "..." : ""),
            detail: text.length > 80 ? text : undefined,
            severity: text.toLowerCase().includes("risk") || text.toLowerCase().includes("warning") 
              ? "warning" 
              : "info",
          };
          activities = [activity, ...prev.activities].slice(0, 20);
        }

        return { ...prev, agents, activities, progress };
      });
      break;
    }

    case "debate": {
      const debateMessage = event.data as DebateMessage;
      if (debateMessage && debateMessage.id) {
        setState(prev => ({
          ...prev,
          debateMessages: [...prev.debateMessages, debateMessage],
          progress,
        }));
      }
      break;
    }

    case "typing": {
      const { agentId, agentName, isTyping } = event.data as { 
        agentId: string; 
        agentName: string; 
        isTyping: boolean 
      };
      setState(prev => ({
        ...prev,
        typingAgent: isTyping ? { id: agentId, name: agentName } : null,
        progress,
      }));
      break;
    }

    case "complete": {
      const result = DEMO_RESULT; // Use our pre-computed result
      
      setState(prev => {
        // Mark all agents as done
        const agents = prev.agents.map(agent => ({
          ...agent,
          status: "done" as const,
        }));

        return {
          ...prev,
          status: "complete",
          agents,
          result,
          steps: resultToSteps(result),
          costs: resultToCosts(result),
          risks: resultToRisks(result),
          documents: resultToDocuments(result),
          typingAgent: null,
          progress: 100,
        };
      });

      // Save result to storage
      saveCaseResult(caseId, query, result, []).then(() => {
        console.log("[Demo] Result saved to storage:", caseId);
      }).catch(e => {
        console.error("[Demo] Failed to save result:", e);
      });
      break;
    }

    case "error": {
      const message = String(event.data.message || "Demo error");
      setState(prev => ({
        ...prev,
        status: "error",
        error: message,
        typingAgent: null,
      }));
      break;
    }
  }
}

// Export demo constants for use in components
export { DEMO_QUERY, DEMO_RESULT };

"use client";

import { useCallback, useState } from "react";
import type {
  Agent,
  AgentActivityStreamEvent,
  ProcessResult,
  ProcessStep,
  ProcessCost,
  ProcessRisk,
  ProcessDocument,
  Tier,
} from "@/types";

// Map agent IDs to display names and tiers
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

export type AnalysisStatus = "idle" | "running" | "complete" | "error";

export interface AnalysisState {
  status: AnalysisStatus;
  query: string | null;
  agents: Agent[];
  activities: AgentActivityStreamEvent[];
  result: ProcessResult | null;
  error: string | null;
  // Derived UI-friendly data
  steps: ProcessStep[];
  costs: ProcessCost[];
  risks: ProcessRisk[];
  documents: ProcessDocument[];
}

const initialState: AnalysisState = {
  status: "idle",
  query: null,
  agents: [],
  activities: [],
  result: null,
  error: null,
  steps: [],
  costs: [],
  risks: [],
  documents: [],
};

// Convert ProcessResult to UI-friendly formats
function resultToSteps(result: ProcessResult): ProcessStep[] {
  // Handle both "timeline" array and "timeline.items" array formats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawResult = result as any;
  const timeline = rawResult.timeline?.items || rawResult.timeline;
  if (!Array.isArray(timeline) || !timeline.length) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return timeline.map((item: any, idx: number) => ({
    id: String(item.id || `step-${idx}`),
    title: String(item.name || item.title || "Step"),
    owner: String(item.owner || "Citizen"),
    eta: item.estimateDays && typeof item.estimateDays === "object"
      ? `${item.estimateDays.min || 0}-${item.estimateDays.max || 0} days`
      : String(item.eta || "TBD"),
    status: idx === 0 ? "in_progress" as const : "pending" as const,
    notes: Array.isArray(item.notes) ? item.notes.join("; ") : undefined,
  }));
}

function resultToCosts(result: ProcessResult): ProcessCost[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawResult = result as any;
  const lineItems = rawResult.costs?.lineItems;
  if (!Array.isArray(lineItems) || !lineItems.length) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return lineItems.map((item: any, idx: number) => ({
    id: String(item.id || `cost-${idx}`),
    label: String(item.name || item.label || "Cost"),
    amountINR: Number(item.amountInr || item.amountINR || item.rangeInr?.min || 0),
    note: Array.isArray(item.notes) ? item.notes.join("; ") : item.note,
  }));
}

function resultToRisks(result: ProcessResult): ProcessRisk[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawResult = result as any;
  const items = rawResult.risks?.items;
  if (!Array.isArray(items) || !items.length) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return items.map((item: any, idx: number) => ({
    id: `risk-${idx}`,
    title: String(item.description || item.title || "Risk"),
    severity: (item.severity as "low" | "medium" | "high") || "medium",
    mitigation: String(item.action || item.mitigation || "Review and address"),
  }));
}

function resultToDocuments(result: ProcessResult): ProcessDocument[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawResult = result as any;
  const documents = rawResult.documents;
  
  if (!Array.isArray(documents) || !documents.length) return [];
  
  const docs: ProcessDocument[] = [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documents.forEach((group: any) => {
    // Handle grouped format { title, items: [...] }
    if (group.items && Array.isArray(group.items)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      group.items.forEach((item: any) => {
        docs.push({
          id: String(item.id || `doc-${docs.length}`),
          title: String(item.name || item.title || "Document"),
          optional: item.required === false || item.optional === true,
        });
      });
    } 
    // Handle flat format [{ id, name, required }]
    else if (group.id || group.name) {
      docs.push({
        id: String(group.id || `doc-${docs.length}`),
        title: String(group.name || group.title || "Document"),
        optional: group.required === false || group.optional === true,
      });
    }
  });
  
  return docs;
}

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(initialState);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const analyze = useCallback(async (query: string) => {
    // Reset and start
    setState({
      ...initialState,
      status: "running",
      query,
      agents: Object.entries(AGENT_INFO).map(([id, info]) => ({
        id,
        name: info.name,
        tier: info.tier,
        status: "idle",
      })),
    });

    try {
      const response = await fetch("/api/analyze?stream=1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let eventType = "";
        let eventData = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            eventData = line.slice(6);
          } else if (line === "" && eventType && eventData) {
            // Process the event
            try {
              const data = JSON.parse(eventData);
              handleSSEEvent(eventType, data, setState);
            } catch (e) {
              console.error("Failed to parse SSE data:", e);
            }
            eventType = "";
            eventData = "";
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setState((prev) => ({
        ...prev,
        status: "error",
        error: message,
      }));
    }
  }, []);

  return {
    ...state,
    analyze,
    reset,
    isRunning: state.status === "running",
    isComplete: state.status === "complete",
    hasError: state.status === "error",
  };
}

function handleSSEEvent(
  eventType: string,
  data: Record<string, unknown>,
  setState: React.Dispatch<React.SetStateAction<AnalysisState>>
) {
  switch (eventType) {
    case "meta":
      // Stream started
      break;

    case "event": {
      const author = String(data.author || "unknown");
      const text = data.text ? String(data.text) : undefined;
      const timestamp = data.timestamp as number;

      // Update agent status
      setState((prev) => {
        const agentId = author.replace(/-/g, "_");
        const agentInfo = AGENT_INFO[agentId];

        // Update agent status
        const agents = prev.agents.map((agent) => {
          if (agent.id === agentId) {
            return {
              ...agent,
              status: "working" as const,
              summary: text?.slice(0, 100),
            };
          }
          // Mark previous working agents as done
          if (agent.status === "working" && agent.id !== agentId) {
            return { ...agent, status: "done" as const };
          }
          return agent;
        });

        // Add activity event if there's meaningful text
        let activities = prev.activities;
        if (text && text.length > 10 && agentInfo) {
          const activity: AgentActivityStreamEvent = {
            id: `${agentId}-${timestamp}`,
            timestamp: "Just now",
            agentName: agentInfo.name,
            tier: agentInfo.tier,
            title: text.slice(0, 80) + (text.length > 80 ? "..." : ""),
            detail: text.length > 80 ? text : undefined,
            severity: "info",
          };
          activities = [activity, ...prev.activities].slice(0, 20);
        }

        return { ...prev, agents, activities };
      });
      break;
    }

    case "complete": {
      // Result might be a string that needs parsing
      let result: ProcessResult | null = null;
      const rawResult = data.result;
      
      console.log("[Analysis] Complete event received, raw result:", rawResult);
      
      if (typeof rawResult === "string") {
        try {
          // Try to extract JSON from string (might have markdown backticks)
          const jsonMatch = rawResult.match(/```json\s*([\s\S]*?)\s*```/) || 
                           rawResult.match(/```\s*([\s\S]*?)\s*```/);
          const jsonStr = jsonMatch ? jsonMatch[1] : rawResult;
          result = JSON.parse(jsonStr.trim());
        } catch (e) {
          console.error("[Analysis] Failed to parse result string:", e);
        }
      } else if (rawResult && typeof rawResult === "object") {
        result = rawResult as ProcessResult;
      }
      
      console.log("[Analysis] Parsed result:", result);

      setState((prev) => {
        // Mark all agents as done
        const agents = prev.agents.map((agent) => ({
          ...agent,
          status: "done" as const,
        }));

        if (result) {
          const steps = resultToSteps(result);
          const costs = resultToCosts(result);
          const risks = resultToRisks(result);
          const documents = resultToDocuments(result);
          
          console.log("[Analysis] Converted data:", { steps, costs, risks, documents });
          
          return {
            ...prev,
            status: "complete",
            agents,
            result,
            steps,
            costs,
            risks,
            documents,
          };
        }

        return {
          ...prev,
          status: "complete",
          agents,
        };
      });
      break;
    }

    case "error": {
      const message = String(data.message || "Unknown error");
      setState((prev) => ({
        ...prev,
        status: "error",
        error: message,
      }));
      break;
    }
  }
}

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
  DebateMessage,
} from "@/types";
import {
  saveCaseStart,
  saveCaseResult,
  saveCaseFailure,
  appendCaseEvents,
} from "@/lib/storage/caseStore";

// Add demo_agent to support demo mode
// Map agent IDs to display names and tiers
const AGENT_INFO: Record<string, { name: string; tier: Tier }> = {
  demo_agent: { name: "AI Analyst", tier: "intelligence" },
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
  caseId: string | null;
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
  // Debate state
  debateMessages: DebateMessage[];
  typingAgent: { id: string; name: string } | null;
}

const initialState: AnalysisState = {
  status: "idle",
  caseId: null,
  query: null,
  agents: [],
  activities: [],
  result: null,
  error: null,
  steps: [],
  costs: [],
  risks: [],
  documents: [],
  debateMessages: [],
  typingAgent: null,
};

// Generate unique case ID
function generateCaseId(): string {
  return `case_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Generate synthetic debate messages for demo mode (makes the UI look impressive)
function generateSyntheticDebateMessages(result: ProcessResult): DebateMessage[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = result as any;
  const messages: DebateMessage[] = [];
  const now = Date.now();
  
  // Extract info from result
  const businessType = r.business?.type || "business";
  const city = r.location?.city || "the city";
  const licensesCount = r.licenses?.length || 5;
  const risks = r.risks?.items || [];
  const timeline = r.timeline?.summary;
  
  // Generate messages simulating agent debate
  const debateScript: Array<{agent: string; name: string; tier: Tier; type: DebateMessage["type"]; content: string; delay: number}> = [
    {
      agent: "intent_decoder",
      name: "Intent Decoder",
      tier: "intake",
      type: "observation",
      content: `Understood! User wants to start a ${businessType} in ${city}. Clear intent detected.`,
      delay: 0
    },
    {
      agent: "location_intelligence",
      name: "Location Intel",
      tier: "intake",
      type: "insight",
      content: `${city} identified. Found ${r.location?.specialRules?.length || 2} location-specific rules that apply.`,
      delay: 500
    },
    {
      agent: "business_classifier",
      name: "Business Classifier",
      tier: "intake",
      type: "observation",
      content: `Classified as ${businessType}. Will require ${licensesCount} licenses including mandatory and conditional ones.`,
      delay: 1000
    },
    {
      agent: "regulation_librarian",
      name: "Regulation Librarian",
      tier: "research",
      type: "insight",
      content: `Found applicable regulations. Key acts: FSSAI Act, Shop & Establishment Act, GST Act. Checking state variations...`,
      delay: 1500
    },
    {
      agent: "document_detective",
      name: "Document Detective",
      tier: "research",
      type: "observation",
      content: `Document checklist ready. ${r.documents?.length || 3} document categories identified with specific requirements.`,
      delay: 2000
    }
  ];
  
  // Add risk-related messages if risks exist
  if (risks.length > 0) {
    const highRisk = risks.find((r: {severity?: string}) => r.severity === "high" || r.severity === "critical");
    if (highRisk) {
      debateScript.push({
        agent: "risk_assessor",
        name: "Risk Assessor",
        tier: "strategy",
        type: "warning",
        content: `Warning: ${highRisk.title || highRisk.description || "Critical risk detected"}. This needs immediate attention!`,
        delay: 2500
      });
      debateScript.push({
        agent: "timeline_architect",
        name: "Timeline Architect",
        tier: "strategy",
        type: "agreement",
        content: `Agree with Risk Assessor. Adjusting timeline to account for this risk. Adding buffer time.`,
        delay: 3000
      });
    }
  }
  
  // Add timeline message
  if (timeline) {
    debateScript.push({
      agent: "timeline_architect",
      name: "Timeline Architect",
      tier: "strategy",
      type: "observation",
      content: `Timeline estimate: ${timeline.minDays || 30}-${timeline.maxDays || 60} days. Critical path identified.`,
      delay: 3500
    });
  }
  
  // Add parallel optimizer suggestion
  debateScript.push({
    agent: "parallel_optimizer",
    name: "Parallel Optimizer",
    tier: "strategy",
    type: "suggestion",
    content: `Good news! I found parallel execution opportunities. Running GST, FSSAI, and Shop Act simultaneously can save 15+ days.`,
    delay: 4000
  });
  
  // Add cost calculator
  if (r.costs?.summary) {
    debateScript.push({
      agent: "cost_calculator",
      name: "Cost Calculator",
      tier: "strategy",
      type: "insight",
      content: `Cost analysis complete. Official fees: Rs ${r.costs.summary.officialTotal || 15000}. Practical budget: Rs ${r.costs.summary.practicalRange?.min || 25000}-${r.costs.summary.practicalRange?.max || 45000}.`,
      delay: 4500
    });
  }
  
  // Final consensus
  debateScript.push({
    agent: "expert_simulator",
    name: "Expert Simulator",
    tier: "intelligence",
    type: "consensus",
    content: `All agents aligned. Recommendation: Start with parallel applications, prioritize risk mitigation, keep buffer for delays.`,
    delay: 5000
  });
  
  // Convert to messages
  debateScript.forEach((item, idx) => {
    messages.push({
      id: `synthetic_${idx}_${now}`,
      timestamp: now + item.delay,
      fromAgent: item.agent,
      fromDisplayName: item.name,
      fromTier: item.tier,
      type: item.type,
      content: item.content,
      emoji: undefined,
    });
  });
  
  return messages;
}

// Normalize the result to handle both demo and full pipeline formats
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResult(rawResult: any): ProcessResult | null {
  if (!rawResult || typeof rawResult !== "object") return null;
  
  // Normalize intent
  const intent = rawResult.intent || {};
  const normalizedIntent = {
    intent: intent.primary || intent.intent || "QUERY_REQUIREMENTS",
    businessTypeId: intent.businessTypeId || rawResult.business?.type || null,
    confidence: Number(intent.confidence || 0.8),
    clarifyingQuestions: intent.clarifyingQuestions || [],
    urgency: intent.urgency || "normal",
  };
  
  // Normalize location
  const location = rawResult.location || {};
  const normalizedLocation = {
    state: location.state || null,
    city: location.city || null,
    municipality: location.municipality || null,
    zone: location.zone || "unknown",
    specialRules: location.specialRules || [],
  };
  
  // Normalize business
  const business = rawResult.business || {};
  const normalizedBusiness = {
    id: business.id || business.type || null,
    name: business.name || business.type || business.description || null,
    subTypeId: business.subTypeId || business.subType || null,
  };
  
  // Normalize risks
  const risks = rawResult.risks || {};
  const normalizedRisks = {
    riskScore0to10: Number(risks.riskScore0to10 || risks.overallScore || risks.riskScore || 5),
    items: risks.items || [],
    preventiveMeasures: risks.preventiveMeasures || [],
  };
  
  // Normalize costs  
  const costs = rawResult.costs || {};
  const normalizedCosts = {
    officialFeesInr: Number(costs.officialFeesInr || costs.summary?.officialTotal || costs.totalOfficialFees || 0),
    practicalCostsInrRange: costs.practicalCostsInrRange || costs.summary?.practicalRange || costs.practicalRange,
    lineItems: costs.lineItems || [],
  };
  
  return {
    ...rawResult,
    intent: normalizedIntent,
    location: normalizedLocation,
    business: normalizedBusiness,
    risks: normalizedRisks,
    costs: normalizedCosts,
  } as ProcessResult;
}

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
      : String(item.eta || item.timeline || "TBD"),
    status: idx === 0 ? "in_progress" as const : "pending" as const,
    notes: Array.isArray(item.notes) ? item.notes.join("; ") : (item.notes || undefined),
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
    amountINR: Number(item.amountInr || item.amountINR || item.amount || item.rangeInr?.min || 0),
    note: Array.isArray(item.notes) ? item.notes.join("; ") : (item.note || item.notes || undefined),
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
    title: String(item.title || item.description || "Risk"),
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
    else if (group.id || group.name || group.title) {
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
    // Generate a new case ID
    const caseId = generateCaseId();
    
    // Reset and start
    setState({
      ...initialState,
      status: "running",
      caseId,
      query,
      agents: Object.entries(AGENT_INFO).map(([id, info]) => ({
        id,
        name: info.name,
        tier: info.tier,
        status: "idle",
      })),
    });

    // Save case start to browser storage
    try {
      await saveCaseStart(caseId, query);
      console.log("[Analysis] Case started and saved:", caseId);
    } catch (e) {
      console.error("[Analysis] Failed to save case start:", e);
    }

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
              handleSSEEvent(eventType, data, setState, caseId, query);
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
      // Save failure to browser storage
      try {
        await saveCaseFailure(caseId, query, message);
        console.log("[Analysis] Case failure saved:", caseId);
      } catch (e) {
        console.error("[Analysis] Failed to save case failure:", e);
      }
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
  setState: React.Dispatch<React.SetStateAction<AnalysisState>>,
  caseId: string,
  query: string
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
          
          // Save activity events to browser storage (async, don't block)
          appendCaseEvents(caseId, [activity]).catch((e) => {
            console.error("[Analysis] Failed to append events:", e);
          });
        }

        return { ...prev, agents, activities };
      });
      break;
    }

    case "complete": {
      // Result might be a string that needs parsing
      let result: ProcessResult | null = null;
      const rawResult = data.result;
      
      console.log("[Analysis] Complete event received, raw result type:", typeof rawResult);
      console.log("[Analysis] Raw result preview:", 
        typeof rawResult === "string" 
          ? rawResult.slice(0, 500) 
          : JSON.stringify(rawResult)?.slice(0, 500)
      );
      
      // Parse string result if needed
      let parsed: unknown = rawResult;
      if (typeof rawResult === "string") {
        try {
          // Try to extract JSON from string (might have markdown backticks)
          const jsonMatch = rawResult.match(/```json\s*([\s\S]*?)\s*```/) || 
                           rawResult.match(/```\s*([\s\S]*?)\s*```/);
          const jsonStr = jsonMatch ? jsonMatch[1] : rawResult;
          parsed = JSON.parse(jsonStr.trim());
        } catch (e) {
          console.error("[Analysis] Failed to parse result string:", e);
          parsed = null;
        }
      }
      
      // Normalize the result to handle both demo and full pipeline formats
      if (parsed && typeof parsed === "object") {
        result = normalizeResult(parsed);
        console.log("[Analysis] Normalized result:", result ? "SUCCESS" : "FAILED");
      }

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
          
          console.log("[Analysis] Converted data:", { 
            stepsCount: steps.length, 
            costsCount: costs.length, 
            risksCount: risks.length, 
            documentsCount: documents.length 
          });
          
          // Generate synthetic debate messages if none exist (demo mode)
          let debateMessages = prev.debateMessages;
          if (debateMessages.length === 0) {
            console.log("[Analysis] Generating synthetic debate messages for demo mode");
            debateMessages = generateSyntheticDebateMessages(result);
          }
          
          // Save completed result to browser storage (async, don't block)
          saveCaseResult(caseId, query, result, prev.activities).then(() => {
            console.log("[Analysis] Case result saved to browser storage:", caseId);
          }).catch((e) => {
            console.error("[Analysis] Failed to save case result:", e);
          });
          
          return {
            ...prev,
            status: "complete",
            agents,
            result,
            steps,
            costs,
            risks,
            documents,
            debateMessages,
            typingAgent: null,
          };
        }

        // Handle case where no result was returned - save as failure
        console.warn("[Analysis] Complete event but no result - raw was:", typeof rawResult);
        saveCaseFailure(caseId, query, "Analysis completed but no result was generated").catch((e) => {
          console.error("[Analysis] Failed to save case failure:", e);
        });

        return {
          ...prev,
          status: "error",
          agents,
          error: "Analysis completed but no result was generated. Please try again.",
          typingAgent: null,
        };
      });
      break;
    }

    case "debate": {
      // Handle debate message
      const debateMessage = data as unknown as DebateMessage;
      if (debateMessage && debateMessage.id && debateMessage.fromAgent) {
        setState((prev) => ({
          ...prev,
          debateMessages: [...prev.debateMessages, debateMessage],
        }));
      }
      break;
    }

    case "typing": {
      // Handle typing indicator
      const { agentId, agentName, isTyping } = data as { agentId: string; agentName: string; isTyping: boolean };
      setState((prev) => ({
        ...prev,
        typingAgent: isTyping ? { id: agentId, name: agentName } : null,
      }));
      break;
    }

    case "error": {
      const message = String(data.message || "Unknown error");
      setState((prev) => ({
        ...prev,
        status: "error",
        error: message,
        typingAgent: null,
      }));
      // Save failure to browser storage
      saveCaseFailure(caseId, query, message).catch((e) => {
        console.error("[Analysis] Failed to save case failure:", e);
      });
      break;
    }
  }
}

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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function extractFirstJson(text: string): string | null {
  const start = text.search(/[\[{]/);
  if (start === -1) return null;

  const stack: string[] = [];
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === "\"") {
        inString = false;
      }
      continue;
    }

    if (ch === "\"") {
      inString = true;
      continue;
    }

    if (ch === "{" || ch === "[") {
      stack.push(ch);
      continue;
    }

    if (ch === "}" || ch === "]") {
      const expectedOpen = ch === "}" ? "{" : "[";
      if (stack[stack.length - 1] !== expectedOpen) return null;
      stack.pop();
      if (stack.length === 0) return text.slice(start, i + 1);
    }
  }

  return null;
}

function parseJsonLoose(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;

  // Try multiple extraction methods
  const jsonMatch =
    trimmed.match(/```json\s*([\s\S]*?)\s*```/) || trimmed.match(/```\s*([\s\S]*?)\s*```/);
  const candidate = (jsonMatch ? jsonMatch[1] : trimmed).trim();

  try {
    return JSON.parse(candidate);
  } catch (e1) {
    console.log("[parseJsonLoose] Direct parse failed, trying extractFirstJson...", (e1 as Error).message?.slice(0, 100));
    const extracted = extractFirstJson(candidate);
    if (extracted) {
      try {
        return JSON.parse(extracted);
      } catch (e2) {
        console.log("[parseJsonLoose] extractFirstJson parse failed:", (e2 as Error).message?.slice(0, 100));
      }
    }
    
    // Last resort: try to fix common JSON issues
    try {
      // Remove trailing commas before } or ]
      const fixed = candidate
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        // Fix unescaped newlines in strings (common LLM issue)
        .replace(/([^\\])\\n/g, "$1\\\\n");
      return JSON.parse(fixed);
    } catch (e3) {
      console.log("[parseJsonLoose] Fixed parse failed:", (e3 as Error).message?.slice(0, 100));
      console.log("[parseJsonLoose] Candidate preview:", candidate.slice(0, 300), "...", candidate.slice(-200));
    }
    
    return value;
  }
}

const ENABLE_SYNTHETIC_DEBATE = process.env.NEXT_PUBLIC_SYNTHETIC_DEBATE === "true";

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
  const r = (result ?? {}) as unknown as Record<string, unknown>;
  const messages: DebateMessage[] = [];
  const now = Date.now();
  
  // Extract info from result
  const business = asRecord(r.business);
  const location = asRecord(r.location);
  const businessType = asString(business?.type) || "business";
  const city = asString(location?.city) || "the city";
  const licensesCount = Array.isArray(r.licenses) ? r.licenses.length : 5;
  const risksSource = asRecord(r.risks);
  const risks = Array.isArray(risksSource?.items) ? risksSource.items : [];
  const timeline = asRecord(asRecord(r.timeline)?.summary);
  const documentsCount = Array.isArray(r.documents) ? r.documents.length : 3;
  
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
      content: `${city} identified. Found ${
        Array.isArray(location?.specialRules) ? location!.specialRules.length : 2
      } location-specific rules that apply.`,
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
      content: `Document checklist ready. ${documentsCount} document categories identified with specific requirements.`,
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
      content: `Timeline estimate: ${
        asNumber(timeline.minDays) ?? 30
      }-${asNumber(timeline.maxDays) ?? 60} days. Critical path identified.`,
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
  const costs = asRecord(r.costs);
  const costsSummary = asRecord(costs?.summary);
  if (costsSummary) {
    debateScript.push({
      agent: "cost_calculator",
      name: "Cost Calculator",
      tier: "strategy",
      type: "insight",
      content: `Cost analysis complete. Official fees: Rs ${
        asNumber(costsSummary.officialTotal) ?? 15000
      }. Practical budget: Rs ${
        asNumber(asRecord(costsSummary.practicalRange)?.min) ?? 25000
      }-${asNumber(asRecord(costsSummary.practicalRange)?.max) ?? 45000}.`,
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
function normalizeResult(rawResult: Record<string, unknown>): ProcessResult | null {
  if (!rawResult) return null;
  
  const toStringArray = (value: unknown): string[] => {
    const extractString = (val: unknown): string => {
      if (typeof val === "string") return val;
      if (typeof val === "number" || typeof val === "boolean") return String(val);
      if (typeof val === "object" && val !== null) {
        const obj = val as Record<string, unknown>;
        // Try common text fields, extracting string values
        for (const key of ["measure", "text", "title", "name", "description", "value", "label"]) {
          if (obj[key] !== undefined && obj[key] !== null) {
            const fieldVal = obj[key];
            if (typeof fieldVal === "string") return fieldVal;
            if (typeof fieldVal === "number" || typeof fieldVal === "boolean") return String(fieldVal);
          }
        }
        // Fallback to JSON if no string field found
        return JSON.stringify(val);
      }
      return String(val);
    };

    if (Array.isArray(value)) return value.map((v) => {
      if (typeof v === "string") return v;
      if (typeof v === "object" && v !== null) {
        const obj = v as Record<string, unknown>;
        // Handle preventiveMeasures objects with measure/description fields
        const measure = obj["measure"];
        const description = obj["description"];
        if (measure !== undefined && measure !== null) {
          const measureStr = extractString(measure);
          const descStr = description ? extractString(description) : "";
          return descStr ? `${measureStr}: ${descStr}` : measureStr;
        }
        // Fallback: try to extract any string field
        return extractString(v);
      }
      return String(v);
    });
    if (typeof value === "string" && value.trim()) return [value];
    return [];
  };

  const intentSource = asRecord(rawResult["intent"]) ?? {};
  const locationSource = asRecord(rawResult["location"]) ?? asRecord(intentSource["location"]) ?? {};
  const businessSource = asRecord(rawResult["business"]) ?? {};

  const normalizedIntent = {
    intent: String(intentSource["intent"] || intentSource["primary"] || "QUERY_REQUIREMENTS"),
    businessTypeId: (intentSource["businessTypeId"] || businessSource["typeId"] || businessSource["type"] || null) as
      | string
      | null,
    businessSubTypeId: (intentSource["businessSubTypeId"] || businessSource["subTypeId"] || businessSource["subType"] || null) as
      | string
      | null,
    location: {
      city:
        (asRecord(intentSource["location"])?.["city"] as string | null | undefined) ||
        (locationSource["city"] as string | null | undefined) ||
        null,
      state:
        (asRecord(intentSource["location"])?.["state"] as string | null | undefined) ||
        (locationSource["state"] as string | null | undefined) ||
        null,
    },
    urgency: String(intentSource["urgency"] || "normal"),
    confidence: Number(intentSource["confidence"] ?? 0.8),
    clarifyingQuestions: toStringArray(
      intentSource["clarifyingQuestions"] || intentSource["clarificationsNeeded"] || intentSource["questions"]
    ),
    rawEntities: (intentSource["rawEntities"] || intentSource["entities"] || undefined) as Record<string, unknown> | undefined,
  };

  const normalizedLocation = {
    state: (locationSource["state"] as string | null | undefined) || null,
    stateId: (locationSource["stateId"] as string | null | undefined) || null,
    city: (locationSource["city"] as string | null | undefined) || null,
    municipality: (locationSource["municipality"] as string | null | undefined) || null,
    zone: (locationSource["zone"] as string | undefined) || "unknown",
    specialRules: toStringArray(locationSource["specialRules"]),
    stateVariations: toStringArray(locationSource["stateVariations"]),
  };

  const normalizedBusiness = {
    id: (businessSource["id"] || businessSource["typeId"] || businessSource["type"] || null) as string | null,
    subTypeId: (businessSource["subTypeId"] || businessSource["subType"] || null) as string | null,
    name: (businessSource["name"] || businessSource["type"] || businessSource["description"] || null) as string | null,
  };

  const normalizeRiskSeverity = (value: unknown): "low" | "medium" | "high" => {
    const v = String(value || "").toLowerCase();
    if (v === "critical") return "high";
    if (v === "high") return "high";
    if (v === "low") return "low";
    return "medium";
  };

  const normalizeRiskUrgency = (value: unknown): "immediate" | "soon" | "later" => {
    const v = String(value || "").toLowerCase();
    if (v === "immediate") return "immediate";
    if (v === "soon") return "soon";
    return "later";
  };

  const normalizeRiskType = (
    value: unknown
  ): "DELAY" | "BRIBE_REQUEST" | "DOCUMENT_ISSUE" | "ZONE_ISSUE" | "REJECTION" | "OTHER" => {
    const v = String(value || "").toUpperCase();
    if (v === "DELAY") return "DELAY";
    if (v === "BRIBE_REQUEST") return "BRIBE_REQUEST";
    if (v === "DOCUMENT_ISSUE") return "DOCUMENT_ISSUE";
    if (v === "ZONE_ISSUE") return "ZONE_ISSUE";
    if (v === "REJECTION") return "REJECTION";
    return "OTHER";
  };

  const normalizeCostKind = (value: unknown): "official_fee" | "practical_cost" => {
    const v = String(value || "").toLowerCase();
    if (v === "official_fee") return "official_fee";
    if (v === "practical_cost") return "practical_cost";
    return v === "official" ? "official_fee" : "practical_cost";
  };

  const licensesValue = rawResult["licenses"];
  const licenses = Array.isArray(licensesValue)
    ? licensesValue.map((license: unknown, idx: number) => {
        const lic = asRecord(license) ?? {};
        const timeline = asRecord(lic["timeline"]);
        const timelineDaysRecord = asRecord(lic["timelineDays"]);
        const timelineDays = timelineDaysRecord
          ? {
              min: Number(timelineDaysRecord["min"] ?? timelineDaysRecord["minDays"] ?? 0),
              max: Number(timelineDaysRecord["max"] ?? timelineDaysRecord["maxDays"] ?? 0),
              avg: Number(
                timelineDaysRecord["avg"] ??
                  (Number(timelineDaysRecord["min"] ?? timelineDaysRecord["minDays"] ?? 0) +
                    Number(timelineDaysRecord["max"] ?? timelineDaysRecord["maxDays"] ?? 0)) /
                    2
              ),
            }
          : timeline
            ? {
                min: Number(timeline["minDays"] ?? timeline["min"] ?? 0),
                max: Number(timeline["maxDays"] ?? timeline["max"] ?? 0),
                avg: Number(
                  timeline["avgDays"] ??
                    timeline["avg"] ??
                    (Number(timeline["minDays"] ?? timeline["min"] ?? 0) +
                      Number(timeline["maxDays"] ?? timeline["max"] ?? 0)) /
                      2
                ),
              }
            : undefined;
        return {
          id: String(lic["id"] || `license-${idx}`),
          name: String(lic["name"] || lic["title"] || "License"),
          authority: lic["authority"] ? String(lic["authority"]) : undefined,
          timelineDays,
          feesInr: (lic["feesInr"] || lic["fees"] || undefined) as unknown,
        };
      })
    : [];

  const docsContainer = rawResult["documents"];
  const docsRecord = asRecord(docsContainer);
  const rawDocs = (docsRecord && Array.isArray(docsRecord["groups"])) ? docsRecord["groups"] : docsContainer;
  const documentGroups: ProcessResult["documents"] = Array.isArray(rawDocs)
    ? rawDocs
        .map((group: unknown, gidx: number) => {
          const g = asRecord(group);
          if (g && Array.isArray(g["items"])) {
            return {
              title: String(g["title"] || g["name"] || `Documents ${gidx + 1}`),
              items: (g["items"] as unknown[]).map((item: unknown, didx: number) => {
                const it = asRecord(item) ?? {};
                return {
                  id: String(it["id"] || `doc-${gidx}-${didx}`),
                  name: String(it["name"] || it["title"] || "Document"),
                  required: it["required"] !== false,
                  specification: (it["specification"] || it["details"] || undefined) as string | undefined,
                  tips: toStringArray(it["tips"] ?? it["notes"]),
                };
              }),
            };
          }
          return null;
        })
        .filter((v): v is NonNullable<typeof v> => v !== null)
    : [];

  const timelineContainer = rawResult["timeline"];
  const timelineRecord = asRecord(timelineContainer);
  const rawTimeline =
    (timelineRecord && Array.isArray(timelineRecord["items"])) ? timelineRecord["items"] : timelineContainer;
  const timeline: ProcessResult["timeline"] = Array.isArray(rawTimeline)
    ? rawTimeline.map((item: unknown, idx: number) => {
        const it = asRecord(item) ?? {};
        const estimate = (it["estimateDays"] || it["timelineDays"] || it["timeline"]) as unknown;
        const estimateRecord = asRecord(estimate) ?? {};
        const estimateDays = {
          min: Number(estimateRecord["minDays"] ?? estimateRecord["min"] ?? 0),
          max: Number(estimateRecord["maxDays"] ?? estimateRecord["max"] ?? 0),
          avg: Number(
            estimateRecord["avgDays"] ??
              estimateRecord["avg"] ??
              (Number(estimateRecord["minDays"] ?? estimateRecord["min"] ?? 0) +
                Number(estimateRecord["maxDays"] ?? estimateRecord["max"] ?? 0)) /
                2
          ),
        };
        return {
          id: String(it["id"] || `step-${idx}`),
          name: String(it["name"] || it["title"] || `Step ${idx + 1}`),
          estimateDays,
          canRunInParallelWith: toStringArray(it["canRunInParallelWith"] || it["parallelWith"]),
          prerequisites: toStringArray(it["prerequisites"] || it["dependsOn"]),
          notes: toStringArray(it["notes"] || it["tips"]),
        };
      })
    : [];

  const risksSource = asRecord(rawResult["risks"]) ?? {};
  const riskItems = Array.isArray(risksSource["items"]) ? (risksSource["items"] as unknown[]) : [];
  const normalizedRisks = {
    riskScore0to10: Number(risksSource["riskScore0to10"] || risksSource["overallScore"] || risksSource["riskScore"] || 0),
    items: riskItems.map((item: unknown) => {
      const it = asRecord(item) ?? {};
      return {
        type: normalizeRiskType(it["type"]),
        severity: normalizeRiskSeverity(it["severity"]),
        description: String(it["description"] || it["title"] || "Risk"),
        action: String(it["action"] || it["mitigation"] || "Review and address"),
        urgency: normalizeRiskUrgency(it["urgency"]),
      };
    }),
    preventiveMeasures: toStringArray(risksSource["preventiveMeasures"]),
  };

  const costsSource = asRecord(rawResult["costs"]) ?? {};
  const officialFeesInr = Number(
    costsSource["officialFeesInr"] ||
      asRecord(costsSource["summary"])?.["officialTotal"] ||
      asRecord(costsSource["summary"])?.["officialFeesTotal"] ||
      costsSource["totalOfficialFees"] ||
      0
  );
  const practicalRange = costsSource["practicalCostsInrRange"] || asRecord(costsSource["summary"])?.["practicalRange"] || costsSource["practicalRange"];
  const practicalRangeRecord = asRecord(practicalRange);
  const practicalCostsInrRange = practicalRangeRecord
    ? {
        min: Number(practicalRangeRecord["min"] ?? 0),
        max: Number(practicalRangeRecord["max"] ?? 0),
      }
    : undefined;
  const lineItemsValue = costsSource["lineItems"];
  const lineItems = Array.isArray(lineItemsValue)
    ? (lineItemsValue as unknown[])
    : [
        ...(asRecord(costsSource["breakdown"])?.["officialFees"] as unknown[] | undefined || []),
        ...(asRecord(costsSource["breakdown"])?.["practicalCosts"] as unknown[] | undefined || []),
      ]
        .filter(Boolean)
        .map((li: unknown, idx: number) => {
          const it = asRecord(li) ?? {};
          const rangeRecord = asRecord(it["rangeInr"] ?? it["range"]);
          const rangeInr = rangeRecord
            ? {
                min: Number(rangeRecord["min"] ?? 0),
                max: Number(rangeRecord["max"] ?? 0),
              }
            : undefined;
          const amountInrValue = it["amountInr"] ?? it["amount"];
          const amountInr = typeof amountInrValue === "number" ? amountInrValue : undefined;
          const notes = toStringArray(it["notes"]);
          return {
            id: String(it["id"] || `cost-${idx}`),
            name: String(it["name"] || it["label"] || "Cost"),
            kind: normalizeCostKind(it["kind"] || (it["category"] === "official" ? "official_fee" : "practical_cost")),
            amountInr,
            rangeInr,
            notes: notes.length ? notes : undefined,
          };
        });

  const normalizedCosts = {
    officialFeesInr,
    practicalCostsInrRange,
    lineItems,
  };

  const outputsSource = asRecord(rawResult["outputs"]) ?? {};
  const normalizedOutputs = {
    visitPlan: outputsSource["visitPlan"] ?? rawResult["visitPlan"] ?? rawResult["weeklyPlan"] ?? undefined,
    reminders: outputsSource["reminders"] ?? rawResult["reminders"] ?? undefined,
    statusTracking: outputsSource["statusTracking"] ?? rawResult["statusTracking"] ?? undefined,
    stateComparison: outputsSource["stateComparison"] ?? rawResult["stateComparison"] ?? rawResult["comparison"] ?? undefined,
    whatIf: outputsSource["whatIf"] ?? rawResult["whatIf"] ?? rawResult["whatif"] ?? undefined,
    expertAdvice: outputsSource["expertAdvice"] ?? rawResult["expertAdvice"] ?? undefined,
  };

  const draftsSource = rawResult["drafts"];
  const drafts: ProcessResult["drafts"] = [];
  if (Array.isArray(draftsSource)) {
    for (const item of draftsSource) {
      const it = asRecord(item);
      const kind = asString(it?.kind);
      const title = asString(it?.title);
      const body = asString(it?.body);
      const normalizedKind =
        kind === "RTI" || kind === "GRIEVANCE" || kind === "APPEAL" ? (kind as "RTI" | "GRIEVANCE" | "APPEAL") : null;
      if (normalizedKind && title && body) drafts.push({ kind: normalizedKind, title, body });
    }
  } else {
    const d = asRecord(draftsSource);
    const push = (kind: "RTI" | "GRIEVANCE" | "APPEAL", value: unknown) => {
      const v = asRecord(value);
      const title = asString(v?.title) || `${kind} Draft`;
      const body = asString(v?.body) || "";
      if (body) drafts.push({ kind, title, body });
    };
    if (d?.rti) push("RTI", d.rti);
    if (d?.grievance) push("GRIEVANCE", d.grievance);
    if (d?.appeal) push("APPEAL", d.appeal);
  }

  const queryValue =
    typeof rawResult["query"] === "string"
      ? (rawResult["query"] as string)
      : (asRecord(rawResult["query"])?.["original"] as string | undefined) ||
        (asRecord(rawResult["query"])?.["interpreted"] as string | undefined) ||
        "";

  return {
    query: String(queryValue || ""),
    intent: normalizedIntent,
    location: normalizedLocation,
    business: normalizedBusiness,
    licenses,
    documents: documentGroups,
    dependencyGraph: (rawResult["dependencyGraph"] || rawResult["dependencies"] || undefined) as unknown as ProcessResult["dependencyGraph"],
    timeline,
    costs: normalizedCosts,
    risks: normalizedRisks,
    outputs: normalizedOutputs,
    drafts,
    meta: (rawResult["meta"] as Record<string, unknown> | undefined) || undefined,
  } as ProcessResult;
}

// Convert ProcessResult to UI-friendly formats - EXPORTED for use in report pages
export function resultToSteps(result: ProcessResult): ProcessStep[] {
  if (!Array.isArray(result.timeline) || !result.timeline.length) return [];
  return result.timeline.map((item, idx) => ({
    id: String(item.id || `step-${idx}`),
    title: String(item.name || "Step"),
    owner: "Citizen",
    eta: `${item.estimateDays?.min || 0}-${item.estimateDays?.max || 0} days`,
    status: idx === 0 ? ("in_progress" as const) : ("pending" as const),
    notes: Array.isArray(item.notes) ? item.notes.join("; ") : undefined,
  }));
}

export function resultToCosts(result: ProcessResult): ProcessCost[] {
  const lineItems = result.costs?.lineItems;
  if (!Array.isArray(lineItems) || !lineItems.length) return [];
  return lineItems.map((item, idx) => ({
    id: String(item.id || `cost-${idx}`),
    label: String(item.name || "Cost"),
    amountINR: Number(item.amountInr ?? item.rangeInr?.min ?? 0),
    note: Array.isArray(item.notes) ? item.notes.join("; ") : undefined,
  }));
}

export function resultToRisks(result: ProcessResult): ProcessRisk[] {
  const items = result.risks?.items;
  if (!Array.isArray(items) || !items.length) return [];
  return items.map((item, idx) => ({
    id: `risk-${idx}`,
    title: String(item.description || "Risk"),
    severity: item.severity || "medium",
    mitigation: String(item.action || "Review and address"),
  }));
}

export function resultToDocuments(result: ProcessResult): ProcessDocument[] {
  if (!Array.isArray(result.documents) || !result.documents.length) return [];
  const docs: ProcessDocument[] = [];
  result.documents.forEach((group) => {
    group.items.forEach((item) => {
      docs.push({
        id: String(item.id || `doc-${docs.length}`),
        title: String(item.name || "Document"),
        optional: item.required === false,
      });
    });
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
      // Use Cloud Run backend directly to avoid Netlify proxy timeout
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const apiUrl = backendUrl ? `${backendUrl}/api/analyze?stream=1` : "/api/analyze?stream=1";
      
      const response = await fetch(apiUrl, {
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

      let eventType = "";
      let eventDataLines: string[] = [];

      const processLines = (lines: string[]) => {
        for (const rawLine of lines) {
          const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;

          if (line.startsWith("event:")) {
            eventType = line.slice("event:".length).trim();
          } else if (line.startsWith("data:")) {
            eventDataLines.push(line.slice("data:".length).trimStart());
          } else if (line.trim() === "") {
            if (eventType && eventDataLines.length) {
              try {
                const data = JSON.parse(eventDataLines.join("\n"));
                handleSSEEvent(eventType, data, setState, caseId, query);
              } catch (e) {
                console.error("Failed to parse SSE data:", e, "Event:", eventType, "Data:", eventDataLines.join("").slice(0, 200));
              }
            }
            eventType = "";
            eventDataLines = [];
          }
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Process any remaining data in buffer when stream ends
          if (buffer.trim()) {
            console.log("[Analysis] Processing remaining buffer on stream end, length:", buffer.length);
            const remainingLines = buffer.split("\n");
            remainingLines.push(""); // Add empty line to trigger final event processing
            processLines(remainingLines);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        processLines(lines);
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
      
      const parsed = parseJsonLoose(rawResult);
      
      console.log("[Analysis] Parsed type:", typeof parsed, Array.isArray(parsed) ? "(array)" : "");
      
      // Normalize the result to handle both demo and full pipeline formats
      let parsedRecord = asRecord(parsed);
      
      // If parsing failed and we got a string back, log it for debugging
      if (!parsedRecord && typeof parsed === "string") {
        console.error("[Analysis] JSON parsing failed! Raw string length:", parsed.length);
        console.error("[Analysis] First 500 chars:", parsed.slice(0, 500));
        console.error("[Analysis] Last 500 chars:", parsed.slice(-500));
        
        // Try one more aggressive extraction
        const lastDitchMatch = parsed.match(/\{[\s\S]*"query"[\s\S]*"licenses"[\s\S]*\}/);
        if (lastDitchMatch) {
          try {
            parsedRecord = JSON.parse(lastDitchMatch[0]);
            console.log("[Analysis] Last ditch extraction worked!");
          } catch {
            console.error("[Analysis] Last ditch extraction also failed");
          }
        }
      }
      
      if (parsedRecord) {
        result = normalizeResult(parsedRecord);
        console.log("[Analysis] Normalized result:", result ? "SUCCESS" : "FAILED");
      } else {
        console.error("[Analysis] Could not parse result into a record object");
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
          
          // Optional: synthetic debate (off by default; real debate streams from the server)
          const debateMessages =
            prev.debateMessages.length === 0 && ENABLE_SYNTHETIC_DEBATE
              ? generateSyntheticDebateMessages(result)
              : prev.debateMessages;
          
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

import type { CurrencyINR, TimelineEstimateDays } from "./data";

export type Urgency = "normal" | "urgent" | "critical";
export type BusinessIntent =
  | "START_BUSINESS"
  | "RENEW_LICENSE"
  | "QUERY_REQUIREMENTS"
  | "STUCK_APPLICATION"
  | "COMPLAINT"
  | "OTHER";

export interface IntentResult {
  intent: BusinessIntent;
  businessTypeId?: string | null;
  businessSubTypeId?: string | null;
  location?: { city?: string | null; state?: string | null };
  urgency: Urgency;
  confidence: number;
  clarifyingQuestions: string[];
  rawEntities?: Record<string, unknown>;
}

export interface LocationResult {
  state?: string | null;
  stateId?: string | null;
  city?: string | null;
  municipality?: string | null;
  zone?: "commercial" | "residential" | "mixed" | "unknown";
  specialRules?: string[];
  stateVariations?: string[];
}

export interface DocumentChecklistGroup {
  title: string;
  items: Array<{
    id: string;
    name: string;
    required: boolean;
    specification?: string;
    tips?: string[];
  }>;
}

export interface DependencyGraph {
  nodes: Array<{ id: string; type: "document" | "license" | "step"; name: string; meta?: unknown }>;
  edges: Array<{ from: string; to: string; type: "requires" | "enables" | "blocks" }>;
  criticalPath?: string[];
  parallelGroups?: string[][];
}

export interface TimelinePlanItem {
  id: string;
  name: string;
  estimateDays: TimelineEstimateDays;
  canRunInParallelWith?: string[];
  prerequisites?: string[];
  notes?: string[];
}

export interface CostBreakdown {
  officialFeesInr: CurrencyINR;
  practicalCostsInrRange?: { min: CurrencyINR; max: CurrencyINR };
  lineItems: Array<{
    id: string;
    name: string;
    kind: "official_fee" | "practical_cost";
    amountInr?: CurrencyINR;
    rangeInr?: { min: CurrencyINR; max: CurrencyINR };
    notes?: string[];
  }>;
}

export interface RiskItem {
  type: "DELAY" | "BRIBE_REQUEST" | "DOCUMENT_ISSUE" | "ZONE_ISSUE" | "REJECTION" | "OTHER";
  severity: "low" | "medium" | "high";
  description: string;
  action: string;
  urgency: "immediate" | "soon" | "later";
}

export interface GeneratedDraft {
  kind: "RTI" | "GRIEVANCE" | "APPEAL";
  title: string;
  body: string;
}

export interface ProcessResult {
  query: string;
  intent: IntentResult;
  location: LocationResult;
  business: { id?: string | null; subTypeId?: string | null; name?: string | null };
  licenses: Array<{
    id: string;
    name: string;
    authority?: string;
    timelineDays?: TimelineEstimateDays;
    feesInr?: unknown;
  }>;
  documents: DocumentChecklistGroup[];
  dependencyGraph?: DependencyGraph;
  timeline: TimelinePlanItem[];
  costs?: CostBreakdown;
  risks?: { riskScore0to10: number; items: RiskItem[]; preventiveMeasures?: string[] };
  outputs?: {
    visitPlan?: string;
    reminders?: string[];
    statusTracking?: string;
    stateComparison?: unknown;
    whatIf?: unknown;
    expertAdvice?: unknown;
  };
  drafts?: GeneratedDraft[];
  meta?: Record<string, unknown>;
}

// Preview types for UI components (used before full ProcessResult is available)
export type ProcessStepStatus = "pending" | "in_progress" | "done" | "blocked";

export interface ProcessStep {
  id: string;
  title: string;
  owner: string;
  eta: string;
  status: ProcessStepStatus;
  notes?: string;
}

export interface ProcessCost {
  id: string;
  label: string;
  amountINR: number;
  note?: string;
}

export interface ProcessRisk {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  mitigation: string;
}

export interface ProcessDocument {
  id: string;
  title: string;
  optional?: boolean;
}

export interface ProcessPreview {
  id: string;
  title: string;
  location: string;
  steps: ProcessStep[];
  costs: ProcessCost[];
  risks: ProcessRisk[];
  documents: ProcessDocument[];
}

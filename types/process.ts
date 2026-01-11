import type { CurrencyINR, TimelineEstimateDays } from "./data";

// ===============================
// VERIFICATION TYPES (Live Data)
// ===============================

export type VerificationSource = "official_portal" | "knowledge_base" | "live_search" | "estimated" | "cached";

export interface VerificationInfo {
  verified: boolean;
  source: VerificationSource;
  sourceName?: string;
  sourceUrl?: string;
  lastVerified?: string;
  confidence: number;
  fromCache?: boolean;
}

export interface VerificationSummary {
  totalItems: number;
  verifiedCount: number;
  cachedCount: number;
  unverifiedCount: number;
  lastUpdated: string;
  overallConfidence: number;
}

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
  verification?: VerificationInfo;
  currentDelayFactor?: number; // 1.0 = normal, 1.5 = 50% slower than usual
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
    verification?: VerificationInfo;
  }>;
  verificationSummary?: VerificationSummary;
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

// ===============================
// VISIT PLAN TYPES
// ===============================

export interface VisitTiming {
  officeOpens?: string;
  tokenWindow?: string;
  lunchBreak?: string;
  recommendation?: string;
}

export interface VisitLocation {
  address?: string;
  landmark?: string;
  parking?: string;
  googleMapsUrl?: string;
}

export interface VisitDocuments {
  originals?: string[];
  copies?: string[];
  photos?: string;
  forms?: string;
  fees?: string;
}

export type VisitPriority = "critical" | "high" | "medium" | "low";

export interface Visit {
  visitId: string;
  office: string;
  purpose: string;
  priority?: VisitPriority;
  arrivalTime?: string;
  expectedDuration?: string;
  timing?: VisitTiming;
  location?: VisitLocation;
  whatToExpect?: string[];
  documentsToCarry?: VisitDocuments;
  tips?: string[];
  possibleOutcomes?: string[];
  backupPlan?: string;
  distanceFromPrevious?: string;
  note?: string;
}

export interface VisitDay {
  day: number;
  date?: string;
  dayType?: string;
  theme?: string;
  visits: Visit[];
  dayEndGoal?: string;
  contingencyTime?: string;
}

export interface VisitPlanSummary {
  totalVisitsRequired: number;
  estimatedDays: number;
  officesInvolved: string[];
  onlineOnlyItems?: string[];
  optimizationSavings?: string;
}

export interface VisitPlanData {
  summary?: VisitPlanSummary;
  visitPlan?: VisitDay[];
  // Fallback for simpler/legacy format
  visits?: Array<{
    time?: string;
    office: string;
    purpose: string;
    tips?: string[];
    documentsNeeded?: string[];
  }>;
  optimizationTips?: string[];
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
    visitPlan?: VisitPlanData | string;
    reminders?: string[];
    statusTracking?: string;
    stateComparison?: unknown;
    whatIf?: unknown;
    expertAdvice?: unknown;
  };
  drafts?: GeneratedDraft[];
  meta?: Record<string, unknown>;
  verification?: {
    costs?: VerificationSummary;
    timeline?: VerificationSummary;
    policies?: VerificationSummary;
    overallConfidence?: number;
    lastUpdated?: string;
  };
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

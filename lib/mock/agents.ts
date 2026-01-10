import type { Agent, AgentActivityEvent } from "@/types";

export const mockAgents: Agent[] = [
  { id: "intent", name: "Intent Decoder", tier: "intake", status: "done", summary: "Detected: business setup" },
  { id: "location", name: "Location Intel", tier: "intake", status: "working", summary: "Ahmedabad municipality rules" },
  { id: "classifier", name: "Business Classifier", tier: "intake", status: "done", summary: "Café / QSR" },
  { id: "librarian", name: "Regulation Librarian", tier: "research", status: "thinking", summary: "Pulling license list" },
  { id: "mapper", name: "Department Mapper", tier: "research", status: "idle" },
  { id: "dependency", name: "Dependency Builder", tier: "strategy", status: "working", summary: "Sequencing prerequisites" },
  { id: "timeline", name: "Timeline Architect", tier: "strategy", status: "idle" },
  { id: "risk", name: "Risk Assessor", tier: "intelligence", status: "thinking", summary: "Zoning, OC, inspections" },
  { id: "validator", name: "Document Validator", tier: "document", status: "idle" },
  { id: "visit", name: "Visit Planner", tier: "execution", status: "idle" },
];

export const mockActivity: AgentActivityEvent[] = [
  {
    id: "a1",
    timestamp: "Just now",
    agentName: "Location Intel",
    tier: "intake",
    title: "Mapped jurisdiction",
    detail: "AMC ward + nearest fire station desk",
    severity: "info",
  },
  {
    id: "a2",
    timestamp: "2m",
    agentName: "Dependency Builder",
    tier: "strategy",
    title: "Drafted dependency chain",
    detail: "PAN → GST → Shop & Establishment → Fire NOC",
    severity: "info",
  },
  {
    id: "a3",
    timestamp: "6m",
    agentName: "Risk Assessor",
    tier: "intelligence",
    title: "Flagged 2 high risks",
    detail: "Occupancy certificate + zoning category mismatch",
    severity: "risk",
  },
  {
    id: "a4",
    timestamp: "12m",
    agentName: "Regulation Librarian",
    tier: "research",
    title: "Collected baseline requirements",
    detail: "FSSAI + GST + local trade license checklist",
    severity: "info",
  },
  {
    id: "a5",
    timestamp: "18m",
    agentName: "Intent Decoder",
    tier: "intake",
    title: "Normalized user prompt",
    detail: "“café kholna” → “food service establishment”",
    severity: "info",
  },
];


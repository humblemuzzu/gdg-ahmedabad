export type AgentTier =
  | "intake"
  | "research"
  | "strategy"
  | "document"
  | "execution"
  | "intelligence";

export type AgentStatus = "idle" | "thinking" | "working" | "done" | "blocked";

export type Agent = {
  id: string;
  name: string;
  tier: AgentTier;
  status: AgentStatus;
  summary?: string;
};

export type AgentActivityEvent = {
  id: string;
  timestamp: string;
  agentName: string;
  tier: AgentTier;
  title: string;
  detail?: string;
  severity?: "info" | "warning" | "risk";
};


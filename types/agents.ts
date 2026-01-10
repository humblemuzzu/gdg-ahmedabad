import type { Tier } from "./data";

export type AgentStatus = "idle" | "thinking" | "complete" | "error";
export type AgentDisplayStatus = "idle" | "thinking" | "working" | "done" | "blocked";

export interface Agent {
  id: string;
  name: string;
  tier: Tier;
  status: AgentDisplayStatus;
  summary?: string;
}
export type AgentMessageType = "INFO" | "WARNING" | "QUERY" | "RESPONSE" | "CONSENSUS";

export interface AgentDefinition {
  id: string;
  name: string;
  displayName: string;
  tier: Tier;
  description: string;
  icon?: string;
  model: "gemini-2.0-flash" | "gemini-2.0-flash-thinking-exp" | string;
}

export interface AgentActivityEvent {
  type: "agent_activity";
  agentId: string;
  agentName: string;
  tier: Tier;
  status: AgentStatus;
  message: string;
  timestamp: number;
  payload?: unknown;
}

// UI-specific activity event for the activity stream
export interface AgentActivityStreamEvent {
  id: string;
  timestamp: string;
  agentName: string;
  tier: Tier;
  title: string;
  detail?: string;
  severity: "info" | "warning" | "risk";
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: AgentMessageType;
  content: unknown;
  timestamp: number;
  confidence?: number;
}

export interface AgentOutput<T = unknown> {
  agentId: string;
  result: T;
  reasoning?: string;
  suggestions?: string[];
  warnings?: string[];
}


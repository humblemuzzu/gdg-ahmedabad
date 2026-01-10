import crypto from "node:crypto";
import {
  BaseAgent,
  InMemoryRunner,
  getFunctionCalls,
  getFunctionResponses,
  isFinalResponse,
  stringifyContent,
  type Event,
} from "@google/adk";
import type { Content } from "@google/genai";
import type { ProcessResult, DebateMessage } from "../../types";
import { generateDebateMessage, AGENT_INFO } from "./debate-generator";

export type OrchestratorStreamItem =
  | {
      type: "event";
      author?: string;
      timestamp: number;
      text?: string;
      partial?: boolean;
      functionCalls?: unknown[];
      functionResponses?: unknown[];
      rawEvent: Event;
    }
  | {
      type: "debate";
      message: DebateMessage;
    }
  | {
      type: "typing";
      agentId: string;
      agentName: string;
      isTyping: boolean;
    }
  | {
      type: "complete";
      timestamp: number;
      result: ProcessResult | unknown;
      sessionId: string;
      userId: string;
    };

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

function safeJsonParse(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch =
      trimmed.match(/```json\s*([\s\S]*?)\s*```/) || trimmed.match(/```\s*([\s\S]*?)\s*```/);
    const candidate = (jsonMatch ? jsonMatch[1] : trimmed).trim();
    try {
      return JSON.parse(candidate);
    } catch {
      const extracted = extractFirstJson(candidate);
      if (!extracted) return value;
      return JSON.parse(extracted);
    }
  } catch {
    return value;
  }
}

function mergeSessionStateIntoResult(state: Record<string, unknown>, result: unknown): unknown {
  if (!result || typeof result !== "object") return result;

  const r = result as Record<string, unknown>;
  const outputs = (r.outputs && typeof r.outputs === "object" ? (r.outputs as Record<string, unknown>) : {});

  const get = (key: string) => safeJsonParse(state[key]);

  const dependencyGraph = get("bb_dependencies");
  if (!r.dependencyGraph && dependencyGraph) r.dependencyGraph = dependencyGraph;

  const documents = get("bb_documents");
  if (!r.documents && documents) r.documents = documents;

  const timeline = get("bb_timeline");
  if (!r.timeline && timeline) r.timeline = timeline;

  const costs = get("bb_costs");
  if (!r.costs && costs) r.costs = costs;

  const risks = get("bb_risks");
  if (!r.risks && risks) r.risks = risks;

  const stateComparison = get("bb_comparison");
  if (outputs.stateComparison == null && stateComparison) outputs.stateComparison = stateComparison;

  const whatIf = get("bb_whatif");
  if (outputs.whatIf == null && whatIf) outputs.whatIf = whatIf;

  const expertAdvice = get("bb_expert");
  if (outputs.expertAdvice == null && expertAdvice) outputs.expertAdvice = expertAdvice;

  const visitPlan = get("bb_visit_plan");
  if (outputs.visitPlan == null && visitPlan) outputs.visitPlan = visitPlan;

  const reminders = get("bb_reminders");
  if (outputs.reminders == null && reminders) outputs.reminders = reminders;

  const statusTracking = get("bb_status");
  if (outputs.statusTracking == null && statusTracking) outputs.statusTracking = statusTracking;

  const draftsValue = r.drafts;
  const hasDrafts = Array.isArray(draftsValue) ? draftsValue.length > 0 : Boolean(draftsValue);
  if (!hasDrafts) {
    const drafts: Array<{ kind: string; title: string; body: string }> = [];
    const rti = get("bb_rti");
    const grievance = get("bb_grievance");
    const appeal = get("bb_appeal");

    const pushDraft = (kind: string, value: unknown) => {
      if (!value) return;
      if (typeof value === "string") {
        drafts.push({ kind, title: `${kind} Draft`, body: value });
        return;
      }
      if (typeof value === "object") {
        const v = value as Record<string, unknown>;
        const title = typeof v.title === "string" ? v.title : `${kind} Draft`;
        const body = typeof v.body === "string" ? v.body : JSON.stringify(v, null, 2);
        drafts.push({ kind, title, body });
      }
    };

    pushDraft("RTI", rti);
    pushDraft("GRIEVANCE", grievance);
    pushDraft("APPEAL", appeal);
    if (drafts.length) r.drafts = drafts;
  }

  if (Object.keys(outputs).length) r.outputs = outputs;

  // Attach the raw per-agent state for debugging without breaking UI.
  const meta = (r.meta && typeof r.meta === "object" ? (r.meta as Record<string, unknown>) : {});
  if (meta.agentStateKeys == null) {
    meta.agentStateKeys = Object.keys(state).filter((k) => k.startsWith("bb_") && k !== "bb_result");
  }
  r.meta = meta;

  return r;
}

function sanitizeApiKey(key: string): string {
  let value = key.trim();
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

function listApiKeyCandidates(): Array<{ key: string; source: string }> {
  const candidates: Array<{ key: string; source: string }> = [];
  const add = (source: string, value: string | undefined) => {
    const sanitized = value ? sanitizeApiKey(value) : "";
    if (sanitized) candidates.push({ key: sanitized, source });
  };

  add("GOOGLE_GENAI_API_KEY", process.env.GOOGLE_GENAI_API_KEY);
  add("GEMINI_API_KEY", process.env.GEMINI_API_KEY);
  add("GOOGLE_API_KEY", process.env.GOOGLE_API_KEY);
  return candidates;
}

let apiKeyPreflight: Promise<void> | null = null;

async function ensureApiKeyWorks(): Promise<void> {
  if (process.env.BB_SKIP_KEY_PREFLIGHT === "true") return;
  if (apiKeyPreflight) return apiKeyPreflight;

  apiKeyPreflight = (async () => {
    const candidates = listApiKeyCandidates();
    if (!candidates.length) {
      throw new Error(
        "Missing Gemini API key. Set GOOGLE_GENAI_API_KEY (preferred) or GEMINI_API_KEY or GOOGLE_API_KEY in `.env.local`, then restart `npm run dev`."
      );
    }

    const model = process.env.BB_GEMINI_MODEL || "gemini-2.0-flash";
    let lastReason: string | null = null;

    for (const candidate of candidates) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(candidate.key)}`;

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "ping" }] }],
        }),
      });

      if (resp.ok) {
        // Ensure downstream model construction uses the validated key.
        process.env.GOOGLE_GENAI_API_KEY = candidate.key;
        process.env.BB_API_KEY_SOURCE = candidate.source;
        return;
      }

      lastReason = `HTTP ${resp.status}`;
      try {
        const data = (await resp.json()) as unknown;
        const record = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
        const error = record && typeof record.error === "object" ? (record.error as Record<string, unknown>) : null;
        const message = typeof error?.message === "string" ? error.message : null;
        const details = Array.isArray(error?.details) ? (error!.details as unknown[]) : null;
        const firstDetail =
          details?.[0] && typeof details[0] === "object" ? (details[0] as Record<string, unknown>) : null;
        const errorReason = typeof firstDetail?.reason === "string" ? firstDetail.reason : null;
        lastReason = [errorReason, message].filter(Boolean).join(": ") || lastReason;
      } catch {
        // ignore json parse errors
      }
    }

    throw new Error(
      `Gemini API key check failed (${candidates.map((c) => c.source).join(", ")}). ${lastReason ?? "Unknown error"}. Fix `.concat(
        "`.env.local` with a valid key (Google AI Studio), then restart `npm run dev`."
      )
    );
  })();

  return apiKeyPreflight;
}

export class AgentOrchestrator {
  private appName: string;
  private runner: InMemoryRunner | null = null;
  private isDemoMode: boolean = false;

  constructor(appName = "bureaucracy_breaker") {
    this.appName = appName;
  }

  private resolveDemoMode(): boolean {
    const mode = (process.env.BB_PIPELINE_MODE ?? "").toLowerCase().trim();
    if (mode === "demo") return true;
    if (mode === "full") return false;

    // Backwards-compat: previous versions used FULL_PIPELINE=true to force full mode.
    if (process.env.FULL_PIPELINE === "true") return false;

    // Opt-in demo mode (never default).
    return process.env.DEMO_MODE === "true";
  }

  private async getRunner(): Promise<InMemoryRunner> {
    if (this.runner) return this.runner;
    
    // Default to the full multi-agent pipeline. Demo mode is explicit opt-in.
    this.isDemoMode = this.resolveDemoMode();

    // Fail fast with a clear error instead of "all agents finished instantly with no output".
    await ensureApiKeyWorks();
    
    let agent: BaseAgent;
    if (this.isDemoMode) {
      console.log("[Orchestrator] Running in DEMO MODE (single agent)");
      const mod = (await import("../../adk/agents/demo")) as { demoAgent: BaseAgent };
      agent = mod.demoAgent;
    } else {
      console.log("[Orchestrator] Running FULL pipeline (all agents)");
      const mod = (await import("../../adk/agents/main/agent")) as { default: BaseAgent };
      agent = mod.default;
    }
    
    this.runner = new InMemoryRunner({ agent, appName: this.appName });
    return this.runner;
  }

  async *runQuery(
    query: string,
    opts?: { userId?: string; sessionId?: string }
  ): AsyncGenerator<OrchestratorStreamItem, void, void> {
    const runner = await this.getRunner();
    const userId = opts?.userId ?? "local_user";
    const sessionId = opts?.sessionId ?? crypto.randomUUID();

    console.log("[Orchestrator] Starting query processing:", query.slice(0, 100));

    await runner.sessionService.createSession({
      appName: this.appName,
      userId,
      sessionId,
      state: {},
    });

    const newMessage: Content = {
      role: "user",
      parts: [{ text: query }],
    };

    // Track agents that have already spoken for references
    const previousAgents: string[] = [];
    const debateMessages: DebateMessage[] = [];
    let lastAgent: string | null = null;
    let eventCount = 0;

    // Determine the final agent name based on mode
    const finalAgentName = this.isDemoMode ? "demo_agent" : "final_compiler";

    let apiError: Error | null = null;
    
    try {
      for await (const event of runner.runAsync({ userId, sessionId, newMessage })) {
        eventCount++;
        const text = stringifyContent(event);
        const functionCalls = getFunctionCalls(event);
        const functionResponses = getFunctionResponses(event);
        const currentAgent = event.author?.replace(/-/g, "_") ?? null;

        console.log(`[Orchestrator] Event ${eventCount}: author=${event.author}, textLen=${text?.length || 0}, partial=${event.partial}`);

        // Yield typing indicator when agent changes
        if (currentAgent && currentAgent !== lastAgent) {
          // Stop typing for previous agent
          if (lastAgent) {
            const lastInfo = AGENT_INFO[lastAgent];
            if (lastInfo) {
              yield {
                type: "typing",
                agentId: lastAgent,
                agentName: lastInfo.name,
                isTyping: false,
              };
            }
          }
          
          // Start typing for new agent
          const currentInfo = AGENT_INFO[currentAgent];
          if (currentInfo) {
            yield {
              type: "typing",
              agentId: currentAgent,
              agentName: currentInfo.name,
              isTyping: true,
            };
          }
          
          lastAgent = currentAgent;
        }

        // Yield the original event
        yield {
          type: "event",
          author: event.author,
          timestamp: event.timestamp,
          text: text || undefined,
          partial: event.partial ?? undefined,
          functionCalls: functionCalls.length ? functionCalls : undefined,
          functionResponses: functionResponses.length ? functionResponses : undefined,
          rawEvent: event,
        };

        // Generate debate message from meaningful text (not in demo mode for simulated debate)
        if (!this.isDemoMode && text && text.length > 20 && event.author && !event.partial) {
          const normalizedAgent = event.author.replace(/-/g, "_");
          const debateMsg = generateDebateMessage(
            normalizedAgent,
            text,
            previousAgents,
            debateMessages
          );
          
          if (debateMsg) {
            debateMessages.push(debateMsg);
            yield {
              type: "debate",
              message: debateMsg,
            };
            
            // Track this agent for future references
            if (!previousAgents.includes(normalizedAgent)) {
              previousAgents.push(normalizedAgent);
            }
          }
        }

        // Check if this is the final response (works for both demo and full mode)
        const isFinal = isFinalResponse(event);
        const isFinalAgent = currentAgent === finalAgentName || currentAgent === "demo_orchestrator";
        
        if (isFinal && isFinalAgent) {
          console.log("[Orchestrator] Final response detected from:", currentAgent);
          // Stop typing indicator
          if (lastAgent) {
            const info = AGENT_INFO[lastAgent];
            if (info) {
              yield {
                type: "typing",
                agentId: lastAgent,
                agentName: info.name,
                isTyping: false,
              };
            }
          }
        }
      }
    } catch (error) {
      console.error("[Orchestrator] Error during agent execution:", error);
      apiError = error instanceof Error ? error : new Error(String(error));
    }

    console.log("[Orchestrator] Agent loop complete. Total events:", eventCount);

    // Stop any remaining typing indicators
    if (lastAgent) {
      const info = AGENT_INFO[lastAgent];
      if (info) {
        yield {
          type: "typing",
          agentId: lastAgent,
          agentName: info.name,
          isTyping: false,
        };
      }
    }

    if (apiError) {
      throw apiError;
    }

    const session = await runner.sessionService.getSession({
      appName: this.appName,
      userId,
      sessionId,
      config: { numRecentEvents: 50 },
    });

    const rawResult = session?.state?.bb_result;
    
    // Debug logging
    console.log("[Orchestrator] Session state keys:", Object.keys(session?.state ?? {}));
    console.log("[Orchestrator] Raw result type:", typeof rawResult);
    if (typeof rawResult === "string") {
      console.log("[Orchestrator] Raw result preview:", rawResult.slice(0, 500));
    } else {
      console.log("[Orchestrator] Raw result preview:", JSON.stringify(rawResult)?.slice(0, 500));
    }
    
    let result = safeJsonParse(rawResult);
    
    if (!result || (typeof result === "object" && Object.keys(result as object).length === 0)) {
      const keys = Object.keys(session?.state ?? {});
      if (keys.length === 0) {
        throw new Error(
          'No agent outputs were written to session state. This usually means Gemini calls are failing (invalid API key, disabled API, quota, or blocked model). Check `.env.local` and server logs.'
        );
      }
      throw new Error(`No final result found in session state (expected key "bb_result"). State keys: ${keys.join(", ")}`);
    }

    result = mergeSessionStateIntoResult((session?.state ?? {}) as Record<string, unknown>, result);

    yield {
      type: "complete",
      timestamp: Date.now(),
      result,
      sessionId,
      userId,
    };
  }

  async processQuery(
    query: string,
    opts?: { userId?: string; sessionId?: string }
  ): Promise<{ result: ProcessResult | unknown; sessionId: string; userId: string }> {
    let last: OrchestratorStreamItem | null = null;
    for await (const item of this.runQuery(query, opts)) last = item;
    if (!last || last.type !== "complete") {
      throw new Error("Orchestrator did not produce a final result.");
    }
    return { result: last.result, sessionId: last.sessionId, userId: last.userId };
  }
}

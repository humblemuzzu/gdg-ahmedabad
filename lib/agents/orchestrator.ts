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
import type { ProcessResult } from "../../types";

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
      type: "complete";
      timestamp: number;
      result: ProcessResult | unknown;
      sessionId: string;
      userId: string;
    };

function safeJsonParse(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

export class AgentOrchestrator {
  private appName: string;
  private runner: InMemoryRunner | null = null;

  constructor(appName = "bureaucracy_breaker") {
    this.appName = appName;
  }

  private async getRunner(): Promise<InMemoryRunner> {
    if (this.runner) return this.runner;
    const mod = (await import("../../adk/agents/main/agent")) as { default: BaseAgent };
    const agent: BaseAgent = mod.default;
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

    for await (const event of runner.runAsync({ userId, sessionId, newMessage })) {
      const text = stringifyContent(event);
      const functionCalls = getFunctionCalls(event);
      const functionResponses = getFunctionResponses(event);

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

      if (isFinalResponse(event) && event.author === "final_compiler") {
        // The result also gets saved to state via outputKey, but we can early-exit
        // once the compiler finishes.
      }
    }

    const session = await runner.sessionService.getSession({
      appName: this.appName,
      userId,
      sessionId,
      config: { numRecentEvents: 50 },
    });

    const rawResult = session?.state?.bb_result;
    const result = safeJsonParse(rawResult);

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

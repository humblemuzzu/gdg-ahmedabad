import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { defaultModel } from "../shared/model";

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

export const finalCompilerAgent = new LlmAgent({
  name: "final_compiler",
  description: "Compiles all agent outputs into one final ProcessResult JSON.",
  model: defaultModel,
  instruction: [PROMPTS.GLOBAL_IDENTITY, PROMPTS.JSON_OUTPUT_RULES, PROMPTS.FINAL_COMPILER].join("\n\n"),
  outputKey: "bb_result",
  // Note: outputSchema removed as it conflicts with sequential agent orchestration
  beforeModelCallback: async ({ context, request }) => {
    const record = context.state.toRecord();
    const parsed: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(record)) parsed[k] = safeJsonParse(v);

    request.config ??= {};

    // Force Gemini to emit machine-parseable JSON (prevents ```json fences and stray text)
    request.config.responseMimeType = "application/json";
    
    // CRITICAL: Increase max output tokens to handle large JSON responses
    // Default is 8192 which can truncate large ProcessResult objects
    request.config.maxOutputTokens = 16384;

    // Compact the snapshot to reduce context size
    const snapshot = JSON.stringify(parsed);
    request.config.systemInstruction =
      (request.config.systemInstruction ? `${request.config.systemInstruction}\n\n` : "") +
      `CONTEXT_SNAPSHOT_JSON:\n${snapshot}`;
    return undefined;
  },
});


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
    const snapshot = JSON.stringify(parsed, null, 2);
    request.config.systemInstruction =
      (request.config.systemInstruction ? `${request.config.systemInstruction}\n\n` : "") +
      `CONTEXT_SNAPSHOT_JSON:\n${snapshot}`;
    return undefined;
  },
});


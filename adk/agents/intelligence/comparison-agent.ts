import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbListStatesTool, kbGetStateTool } from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const comparisonAgent = new LlmAgent({
  name: "comparison_agent",
  description: "Compares states by complexity/timeline heuristics (KB-backed).",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.COMPARISON_AGENT),
  tools: [kbListStatesTool, kbGetStateTool],
  outputKey: "bb_comparison",
});


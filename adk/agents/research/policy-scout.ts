import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetStatisticsTool } from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const policyScoutAgent = new LlmAgent({
  name: "policy_scout",
  description: "Flags likely policy-change watchouts using KB statistics (no web).",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.POLICY_SCOUT),
  tools: [kbGetStatisticsTool],
  outputKey: "bb_policy",
});


import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetBusinessTypeTool } from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const expertSimulatorAgent = new LlmAgent({
  name: "expert_simulator",
  description: "Provides multiple expert perspectives and a recommendation.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.EXPERT_SIMULATOR),
  tools: [kbGetBusinessTypeTool],
  outputKey: "bb_expert",
});


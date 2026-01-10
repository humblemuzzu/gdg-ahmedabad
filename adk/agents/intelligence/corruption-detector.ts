import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetStatisticsTool, kbSearchTool } from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const corruptionDetectorAgent = new LlmAgent({
  name: "corruption_detector",
  description: "Flags corruption/delay red flags and safe escalation actions.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.CORRUPTION_DETECTOR),
  tools: [kbGetStatisticsTool, kbSearchTool],
  outputKey: "bb_corruption",
});


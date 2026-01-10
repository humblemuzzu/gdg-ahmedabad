import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetLicenseTool, kbGetStatisticsTool } from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const timelineArchitectAgent = new LlmAgent({
  name: "timeline_architect",
  description: "Estimates timelines (KB timelines + ranges).",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.TIMELINE_ARCHITECT),
  tools: [kbGetStatisticsTool, kbGetLicenseTool],
  outputKey: "bb_timeline",
});


import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import {
  kbGetBusinessTypeTool,
  kbListBusinessTypesTool,
  kbSearchTool,
} from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const businessClassifierAgent = new LlmAgent({
  name: "business_classifier",
  description: "Classifies business type/subtype and likely license set (KB-backed).",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.BUSINESS_CLASSIFIER),
  tools: [kbSearchTool, kbListBusinessTypesTool, kbGetBusinessTypeTool],
  outputKey: "bb_business",
});


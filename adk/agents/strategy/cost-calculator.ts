import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetLicenseTool, kbGetStateTool } from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const costCalculatorAgent = new LlmAgent({
  name: "cost_calculator",
  description: "Calculates official + practical costs (KB-backed).",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.COST_CALCULATOR),
  tools: [kbGetLicenseTool, kbGetStateTool],
  outputKey: "bb_costs",
});


import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const visitPlannerAgent = new LlmAgent({
  name: "visit_planner",
  description: "Plans in-person visits, carry checklist, and sequencing.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.VISIT_PLANNER),
  outputKey: "bb_visit_plan",
});


import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const statusTrackerAgent = new LlmAgent({
  name: "status_tracker",
  description: "Defines status tracking model and escalation ladder.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.STATUS_TRACKER),
  outputKey: "bb_status",
});


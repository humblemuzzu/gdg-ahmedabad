import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const reminderEngineAgent = new LlmAgent({
  name: "reminder_engine",
  description: "Generates follow-up reminders and escalation schedule.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.REMINDER_ENGINE),
  outputKey: "bb_reminders",
});


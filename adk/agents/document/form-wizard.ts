import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetLicenseTool } from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const formWizardAgent = new LlmAgent({
  name: "form_wizard",
  description: "Provides form-filling guidance for key applications.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.FORM_WIZARD),
  tools: [kbGetLicenseTool],
  outputKey: "bb_forms",
});


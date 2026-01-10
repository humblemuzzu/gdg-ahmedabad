import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const documentValidatorAgent = new LlmAgent({
  name: "document_validator",
  description: "Provides a document validation checklist and common defects.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.DOCUMENT_VALIDATOR),
  outputKey: "bb_doc_validation",
});


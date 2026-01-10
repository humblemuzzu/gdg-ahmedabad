import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import {
  kbGetBusinessTypeTool,
  kbGetLicenseTool,
  kbGetStateTool,
  kbSearchTool,
} from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const documentDetectiveAgent = new LlmAgent({
  name: "document_detective",
  description: "Generates categorized document checklist (KB-backed).",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.DOCUMENT_DETECTIVE),
  tools: [kbSearchTool, kbGetBusinessTypeTool, kbGetStateTool, kbGetLicenseTool],
  outputKey: "bb_documents",
});


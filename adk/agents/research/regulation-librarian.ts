import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetLicenseTool, kbSearchTool } from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const regulationLibrarianAgent = new LlmAgent({
  name: "regulation_librarian",
  description: "Summarizes applicable compliance requirements (KB-only; no web).",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.REGULATION_LIBRARIAN),
  tools: [kbSearchTool, kbGetLicenseTool],
  outputKey: "bb_laws",
});


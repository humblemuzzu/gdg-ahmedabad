import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbRenderTemplateTool, kbGetTemplatesTool } from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const appealCrafterAgent = new LlmAgent({
  name: "appeal_crafter",
  description: "Drafts RTI first appeals using KB templates.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.APPEAL_CRAFTER),
  tools: [kbGetTemplatesTool, kbRenderTemplateTool],
  outputKey: "bb_appeal",
});


import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbRenderTemplateTool, kbGetTemplatesTool } from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const grievanceWriterAgent = new LlmAgent({
  name: "grievance_writer",
  description: "Drafts grievances (e.g., CPGRAMS) using KB templates.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.GRIEVANCE_WRITER),
  tools: [kbGetTemplatesTool, kbRenderTemplateTool],
  outputKey: "bb_grievance",
});


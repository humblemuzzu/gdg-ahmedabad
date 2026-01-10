import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbRenderTemplateTool, kbGetTemplatesTool } from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const rtiDrafterAgent = new LlmAgent({
  name: "rti_drafter",
  description: "Drafts RTI applications for delays using KB templates.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.RTI_DRAFTER),
  tools: [kbGetTemplatesTool, kbRenderTemplateTool],
  outputKey: "bb_rti",
});


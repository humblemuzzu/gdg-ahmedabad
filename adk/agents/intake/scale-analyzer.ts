import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const scaleAnalyzerAgent = new LlmAgent({
  name: "scale_analyzer",
  description: "Infers business scale (employees/turnover/area) and thresholds.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.SCALE_ANALYZER),
  outputKey: "bb_scale",
  // Note: outputSchema removed as it conflicts with sequential agent orchestration
});


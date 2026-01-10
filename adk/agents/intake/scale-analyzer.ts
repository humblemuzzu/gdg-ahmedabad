import { LlmAgent } from "@google/adk";
import { Type } from "@google/genai";
import { PROMPTS } from "../../prompts/templates";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const scaleAnalyzerAgent = new LlmAgent({
  name: "scale_analyzer",
  description: "Infers business scale (employees/turnover/area) and thresholds.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.SCALE_ANALYZER),
  outputKey: "bb_scale",
  outputSchema: {
    type: Type.OBJECT,
    properties: {
      employees: { type: Type.OBJECT },
      turnoverInr: { type: Type.OBJECT },
      areaSqFt: { type: Type.OBJECT },
      thresholdFindings: { type: Type.ARRAY, items: { type: Type.OBJECT } },
      clarifyingQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["thresholdFindings", "clarifyingQuestions"],
  },
});


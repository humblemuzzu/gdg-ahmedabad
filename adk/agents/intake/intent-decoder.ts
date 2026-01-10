import { LlmAgent } from "@google/adk";
import { Type } from "@google/genai";
import { PROMPTS } from "../../prompts/templates";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const intentDecoderAgent = new LlmAgent({
  name: "intent_decoder",
  description: "Understands user intent + extracts entities (Hinglish-aware).",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.INTENT_DECODER),
  outputKey: "bb_intent",
  outputSchema: {
    type: Type.OBJECT,
    properties: {
      intent: { type: Type.STRING },
      businessTypeId: { type: Type.STRING, nullable: true },
      businessSubTypeId: { type: Type.STRING, nullable: true },
      location: {
        type: Type.OBJECT,
        properties: {
          city: { type: Type.STRING, nullable: true },
          state: { type: Type.STRING, nullable: true },
        },
      },
      urgency: { type: Type.STRING },
      confidence: { type: Type.NUMBER },
      clarifyingQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      rawEntities: { type: Type.OBJECT, nullable: true },
    },
    required: ["intent", "urgency", "confidence", "clarifyingQuestions"],
  },
});


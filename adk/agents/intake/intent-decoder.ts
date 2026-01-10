import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const intentDecoderAgent = new LlmAgent({
  name: "intent_decoder",
  description: "Understands user intent + extracts entities (Hinglish-aware).",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.INTENT_DECODER),
  outputKey: "bb_intent",
  // Note: outputSchema removed as it conflicts with sequential agent orchestration
});


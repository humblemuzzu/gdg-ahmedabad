import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const whatIfSimulatorAgent = new LlmAgent({
  name: "whatif_simulator",
  description: "Simulates likely failure scenarios and mitigations.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.WHATIF_SIMULATOR),
  outputKey: "bb_whatif",
});


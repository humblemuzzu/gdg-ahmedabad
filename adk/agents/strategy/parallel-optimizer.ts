import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const parallelOptimizerAgent = new LlmAgent({
  name: "parallel_optimizer",
  description: "Optimizes timeline into parallel execution plan.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.PARALLEL_OPTIMIZER),
  outputKey: "bb_parallel",
});


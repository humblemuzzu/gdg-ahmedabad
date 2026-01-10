import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetLicenseTool, kbSearchTool } from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const dependencyBuilderAgent = new LlmAgent({
  name: "dependency_builder",
  description: "Builds dependency graph + critical path.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.DEPENDENCY_BUILDER),
  tools: [kbSearchTool, kbGetLicenseTool],
  outputKey: "bb_dependencies",
});


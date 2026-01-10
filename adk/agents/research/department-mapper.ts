import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetLicenseTool, kbGetStateTool } from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const departmentMapperAgent = new LlmAgent({
  name: "department_mapper",
  description: "Maps licenses to departments/portals using KB.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.DEPARTMENT_MAPPER),
  tools: [kbGetLicenseTool, kbGetStateTool],
  outputKey: "bb_departments",
});


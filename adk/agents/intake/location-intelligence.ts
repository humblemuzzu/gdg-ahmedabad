import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import {
  kbGetStateTool,
  kbListStatesTool,
  kbResolveStateByCityTool,
} from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const locationIntelligenceAgent = new LlmAgent({
  name: "location_intelligence",
  description: "Maps city->state, applies state-specific variations (KB-backed).",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.LOCATION_INTELLIGENCE),
  tools: [kbResolveStateByCityTool, kbGetStateTool, kbListStatesTool],
  outputKey: "bb_location",
});


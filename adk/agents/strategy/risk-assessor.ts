import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetStatisticsTool } from "../../tools/knowledge-base";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

export const riskAssessorAgent = new LlmAgent({
  name: "risk_assessor",
  description: "Flags zone/document/delay risks and mitigations.",
  model: defaultModel,
  instruction: jsonInstruction(PROMPTS.RISK_ASSESSOR),
  tools: [kbGetStatisticsTool],
  outputKey: "bb_risks",
});


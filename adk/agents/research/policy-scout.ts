import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetStatisticsTool } from "../../tools/knowledge-base";
import { checkPolicyChangesTool } from "../../tools/perplexity";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

// Check if Perplexity API is configured
const hasPerplexityKey = !!process.env.PERPLEXITY_API_KEY;

// Only add verification instructions if API key is available
const verificationPrompt = hasPerplexityKey ? `

## LIVE POLICY VERIFICATION
You have access to check_policy_changes tool. Use it for major licenses only.
Include verification status in output when available.
` : "";

const enhancedPrompt = `${PROMPTS.POLICY_SCOUT}${verificationPrompt}`;

// Only include Perplexity tool if API key is configured
const tools = hasPerplexityKey
  ? [kbGetStatisticsTool, checkPolicyChangesTool]
  : [kbGetStatisticsTool];

export const policyScoutAgent = new LlmAgent({
  name: "policy_scout",
  description: "Flags likely policy-change watchouts using KB statistics.",
  model: defaultModel,
  instruction: jsonInstruction(enhancedPrompt),
  tools,
  outputKey: "bb_policy",
});


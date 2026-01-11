import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetLicenseTool, kbGetStateTool } from "../../tools/knowledge-base";
import { verifyFeesTool } from "../../tools/perplexity";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

// Check if Perplexity API is configured
const hasPerplexityKey = !!process.env.PERPLEXITY_API_KEY;

// Only add verification instructions if API key is available
const verificationPrompt = hasPerplexityKey ? `

## LIVE FEE VERIFICATION
You have access to verify_government_fees tool. Use it to verify the TOP 2 most expensive license fees.
Include verification status in output when available.
` : "";

const enhancedPrompt = `${PROMPTS.COST_CALCULATOR}${verificationPrompt}`;

// Only include Perplexity tool if API key is configured
const tools = hasPerplexityKey 
  ? [kbGetLicenseTool, kbGetStateTool, verifyFeesTool]
  : [kbGetLicenseTool, kbGetStateTool];

export const costCalculatorAgent = new LlmAgent({
  name: "cost_calculator",
  description: "Calculates official + practical costs (KB-backed).",
  model: defaultModel,
  instruction: jsonInstruction(enhancedPrompt),
  tools,
  outputKey: "bb_costs",
});


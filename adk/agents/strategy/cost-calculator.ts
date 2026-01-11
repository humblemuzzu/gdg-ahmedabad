import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetLicenseTool, kbGetStateTool } from "../../tools/knowledge-base";
import { verifyFeesTool } from "../../tools/perplexity";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

// Check if Perplexity API is configured
const hasPerplexityKey = !!process.env.PERPLEXITY_API_KEY;

// Add MANDATORY verification instructions if API key is available
const verificationPrompt = hasPerplexityKey ? `

## MANDATORY: LIVE FEE VERIFICATION REQUIRED
**YOU MUST USE THE verify_government_fees TOOL** for critical fees.

SMART VERIFICATION RULES:
1. Identify the TOP 2-3 most expensive licenses FROM THE USER'S SPECIFIC CASE
   - Look at what licenses were identified by previous agents
   - Pick the ones with highest fees or most uncertainty
   - DO NOT hardcode - verify what's RELEVANT to THIS user's business

2. WHEN TO VERIFY:
   - Fees > ₹2000 (worth verifying)
   - Fees that vary by state/city
   - Fees that change frequently (trade licenses, health licenses)
   - Any fee you're uncertain about

3. HOW TO USE:
   - verify_government_fees(licenseName, state, expectedFee)
   - Use the ACTUAL license names from the user's case
   - Use the user's ACTUAL state/city

4. INCLUDE verification details in output for each verified fee

Example: If user wants a "cafe in Dhoraji, Gujarat" - verify:
- Shop & Establishment fee for Gujarat
- Health Trade License fee for Dhoraji municipality  
- Fire NOC fee (if applicable)
NOT random licenses unrelated to their business.
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


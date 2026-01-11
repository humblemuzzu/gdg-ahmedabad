import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetStatisticsTool } from "../../tools/knowledge-base";
import { checkPolicyChangesTool } from "../../tools/perplexity";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

// Check if Perplexity API is configured
const hasPerplexityKey = !!process.env.PERPLEXITY_API_KEY;

// Add verification instructions if API key is available
const verificationPrompt = hasPerplexityKey ? `

## LIVE POLICY CHANGE VERIFICATION
**USE check_policy_changes TOOL** for relevant policy areas.

SMART VERIFICATION RULES:
1. Check for policy changes RELEVANT to the user's specific case:
   - Their business type (cafe, restaurant, IT company, etc.)
   - Their location (state-specific rules)
   - Their scale (thresholds that might affect them)

2. WHEN TO CHECK:
   - Major licenses for their business type
   - State-specific regulations for their location
   - GST rules IF their turnover is near thresholds
   - Recent government initiatives in their state

3. HOW TO USE:
   - check_policy_changes(topic, state, timeframe)
   - topic = specific to USER'S business (not generic)
   - state = user's actual state
   - timeframe = "last 6 months" usually

4. BE SELECTIVE:
   - Don't check everything, check what MATTERS for this user
   - A small cafe doesn't need export policy checks
   - An IT company doesn't need food safety policy checks

Example: For "cafe in Dhoraji, Gujarat" - check:
- "Shop and Establishment Act changes in Gujarat"
- "Food business regulations Gujarat 2024-2025"
- "Municipal licensing Dhoraji"
NOT unrelated policies like "FSSAI central license" for a small cafe.
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


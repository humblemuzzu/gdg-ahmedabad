import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetLicenseTool, kbGetStatisticsTool } from "../../tools/knowledge-base";
import { verifyTimelineTool } from "../../tools/perplexity";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

// Check if Perplexity API is configured
const hasPerplexityKey = !!process.env.PERPLEXITY_API_KEY;

// Add MANDATORY verification instructions if API key is available
const verificationPrompt = hasPerplexityKey ? `

## MANDATORY: LIVE TIMELINE VERIFICATION
**USE verify_processing_timeline TOOL** for critical timelines.

SMART VERIFICATION RULES:
1. Identify the 2-3 LONGEST processing times FROM THE USER'S SPECIFIC CASE
   - Look at licenses identified for THIS user's business type
   - Focus on ones that typically cause delays
   - DO NOT hardcode - verify what's RELEVANT to THIS query

2. WHEN TO VERIFY:
   - Processing time > 15 days (significant wait)
   - Timelines that vary significantly by location
   - Licenses known for delays (municipal licenses, fire dept)
   - Any timeline you're uncertain about

3. HOW TO USE:
   - verify_processing_timeline(licenseName, department, state, expectedDays)
   - Use ACTUAL license names from the user's case
   - Use user's ACTUAL location

4. INCLUDE verification in output for each verified timeline

Example: If user wants "cafe in Dhoraji" - verify timelines for:
- Dhoraji Municipality trade license processing time
- Gujarat Fire NOC processing time (if needed for their premises)
- Health license processing in that region
NOT generic timelines for unrelated licenses.
` : "";

const enhancedPrompt = `${PROMPTS.TIMELINE_ARCHITECT}${verificationPrompt}`;

// Only include Perplexity tool if API key is configured
const tools = hasPerplexityKey
  ? [kbGetStatisticsTool, kbGetLicenseTool, verifyTimelineTool]
  : [kbGetStatisticsTool, kbGetLicenseTool];

export const timelineArchitectAgent = new LlmAgent({
  name: "timeline_architect",
  description: "Estimates timelines (KB timelines + ranges).",
  model: defaultModel,
  instruction: jsonInstruction(enhancedPrompt),
  tools,
  outputKey: "bb_timeline",
});


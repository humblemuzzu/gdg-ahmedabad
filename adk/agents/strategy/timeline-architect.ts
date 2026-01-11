import { LlmAgent } from "@google/adk";
import { PROMPTS } from "../../prompts/templates";
import { kbGetLicenseTool, kbGetStatisticsTool } from "../../tools/knowledge-base";
import { verifyTimelineTool } from "../../tools/perplexity";
import { defaultModel } from "../shared/model";
import { jsonInstruction } from "../shared/instructions";

// Check if Perplexity API is configured
const hasPerplexityKey = !!process.env.PERPLEXITY_API_KEY;

// Only add verification instructions if API key is available
const verificationPrompt = hasPerplexityKey ? `

## LIVE TIMELINE VERIFICATION
You have access to verify_processing_timeline tool. Use it for licenses with estimated time > 20 days.
Include verification status in output when available.
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


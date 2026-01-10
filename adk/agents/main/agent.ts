/**
 * GDG Ahmedabad - Main Agent Configuration
 *
 * This is the root agent for the ADK setup.
 * Customize this agent based on your project requirements.
 */

import { PROMPTS } from "../../prompts/templates";

// ============================================================================
// ROOT AGENT
// ============================================================================

/**
 * Root Coordinator Agent
 * Main orchestrator for the AI agent workflow
 */
export const rootAgent = {
  name: "gdg_ahmedabad_agent",
  model: "gemini-2.0-flash",
  description: "Main AI agent for GDG Ahmedabad project",
  instruction: PROMPTS.ROOT_AGENT,

  // Sub-agents that this agent can delegate to
  subAgents: [],

  // Tools available to this agent
  tools: [],
};

// Export for ADK CLI
export default rootAgent;

import { SequentialAgent } from "@google/adk";
import { simplifiedDemoAgent } from "./simplified-agent";

/**
 * DEMO MODE ORCHESTRATOR
 * 
 * Uses a single combined agent instead of 26 sequential agents.
 * This is MUCH faster and cheaper for hackathon demos.
 * 
 * Usage: Set DEMO_MODE=true in environment to use this instead of full pipeline
 */
export const demoAgent = new SequentialAgent({
  name: "demo_orchestrator",
  description: "Simplified demo version - single API call instead of 26",
  subAgents: [simplifiedDemoAgent],
});

export { simplifiedDemoAgent };

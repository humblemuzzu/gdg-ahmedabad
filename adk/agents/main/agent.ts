import { bureaucracyBreakerAgent } from "../orchestrator";

/**
 * Root agent for ADK CLI (`adk run` / `adk web` / `adk api_server`).
 *
 * Must be an instance of `@google/adk` BaseAgent (e.g., SequentialAgent/LlmAgent).
 */
export const rootAgent = bureaucracyBreakerAgent;

export default rootAgent;

import { PROMPTS } from "../../prompts/templates";

export function jsonInstruction(body: string): string {
  return [PROMPTS.GLOBAL_IDENTITY, PROMPTS.JSON_OUTPUT_RULES, body].join("\n\n");
}


import { Gemini } from "@google/adk";

function getApiKey(): string | undefined {
  return (
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    undefined
  );
}

export function makeGemini(model: string): Gemini {
  return new Gemini({ model, apiKey: getApiKey() });
}

export const DEFAULT_MODEL_NAME = process.env.BB_GEMINI_MODEL || "gemini-2.0-flash";
export const defaultModel = makeGemini(DEFAULT_MODEL_NAME);


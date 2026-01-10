import { Gemini } from "@google/adk";

function getApiKey(): string | undefined {
  const key = 
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    undefined;
  
  if (!key) {
    console.error("[Model] ERROR: No API key found!");
    console.error("[Model] Please set one of: GOOGLE_GENAI_API_KEY, GEMINI_API_KEY, or GOOGLE_API_KEY");
    console.error("[Model] Get your key from: https://makersuite.google.com/app/apikey");
  } else {
    console.log("[Model] API key found (length:", key.length, ")");
    // Google API keys should be 39 characters and start with "AIza"
    if (key.length !== 39) {
      console.warn("[Model] WARNING: API key length is", key.length, "- expected 39 characters");
      console.warn("[Model] If your API key appears truncated, check your .env.local file");
    }
    if (!key.startsWith("AIza")) {
      console.warn("[Model] WARNING: API key doesn't start with 'AIza' - may be invalid");
    }
  }
  
  return key;
}

export function makeGemini(model: string): Gemini {
  const apiKey = getApiKey();
  console.log("[Model] Creating Gemini client with model:", model);
  return new Gemini({ model, apiKey });
}

export const DEFAULT_MODEL_NAME = process.env.BB_GEMINI_MODEL || "gemini-2.0-flash";
export const defaultModel = makeGemini(DEFAULT_MODEL_NAME);


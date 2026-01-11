/**
 * Gemini Service for AI Chat
 * 
 * Simple wrapper around Google GenAI SDK for chat functionality.
 */

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("[Gemini] No API key found. Set GOOGLE_API_KEY or GEMINI_API_KEY environment variable.");
}

const genAI = new GoogleGenAI({ apiKey: apiKey || "" });

// Model configurations
const MODELS = {
  FAST: "gemini-2.0-flash", // Fast responses for chat
  PRO: "gemini-2.5-pro-preview-06-05", // High quality responses
};

export interface GenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

const DEFAULT_CHAT_CONFIG: GenerationConfig = {
  temperature: 0.7,
  topP: 0.9,
  maxOutputTokens: 2048,
};

/**
 * Generate content using Gemini
 */
export async function generateContent(
  prompt: string,
  modelType: keyof typeof MODELS = "FAST",
  config: GenerationConfig = DEFAULT_CHAT_CONFIG
): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  try {
    const model = genAI.models.generateContent({
      model: MODELS[modelType],
      contents: prompt,
      config: {
        temperature: config.temperature,
        topP: config.topP,
        topK: config.topK,
        maxOutputTokens: config.maxOutputTokens,
      },
    });

    const response = await model;
    const text = response.text || "";
    
    return text.trim();
  } catch (error) {
    console.error("[Gemini] Generation error:", error);
    throw error;
  }
}

/**
 * Generate chat response with conversation context
 */
export async function generateChatResponse(
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string,
  config: GenerationConfig = DEFAULT_CHAT_CONFIG
): Promise<string> {
  // Build the full prompt with conversation context
  const historyText = conversationHistory
    .slice(-10) // Keep last 10 messages for context
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  const fullPrompt = `${systemPrompt}

## Conversation History
${historyText || "No previous messages"}

## Current User Message
User: ${userMessage}

Respond as the Assistant:`;

  return generateContent(fullPrompt, "FAST", config);
}

export default {
  generateContent,
  generateChatResponse,
  MODELS,
};

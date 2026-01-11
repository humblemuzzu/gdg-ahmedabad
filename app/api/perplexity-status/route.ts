import { NextResponse } from "next/server";
import { getPerplexityStatus, getApiStats, getCacheStats } from "@/adk/tools/perplexity";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = getPerplexityStatus();
    const apiStats = getApiStats();
    const cacheStats = getCacheStats();
    
    return NextResponse.json({
      success: true,
      perplexity: {
        isActive: status.isConfigured,
        keyStatus: status.status,
        stats: {
          totalCalls: apiStats.totalCalls,
          successfulCalls: apiStats.successfulCalls,
          failedCalls: apiStats.failedCalls,
          cacheHits: apiStats.cacheHits,
          fallbackCalls: apiStats.fallbackCalls,
        },
        cache: {
          size: cacheStats.size,
          keys: cacheStats.keys.slice(0, 10), // Only show first 10 keys
        },
        message: status.isConfigured 
          ? "Perplexity API is configured and ready for live verification"
          : "Perplexity API key not configured - using static knowledge base only",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking Perplexity status:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to check Perplexity status",
      perplexity: {
        isActive: false,
        keyStatus: "error",
        message: "Could not determine Perplexity API status",
      },
    }, { status: 500 });
  }
}

// Test the API key by making a simple verification request
export async function POST() {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey || apiKey === 'your_perplexity_api_key_here') {
    return NextResponse.json({
      success: false,
      test: {
        passed: false,
        error: "PERPLEXITY_API_KEY not configured",
        message: "Please add your Perplexity API key to .env.local",
        howToGet: "Get your API key from: https://www.perplexity.ai/settings/api",
      },
    });
  }
  
  try {
    // Make a minimal test request
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "user", content: "What is 2+2? Reply with just the number." },
        ],
        max_tokens: 10,
        temperature: 0,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        test: {
          passed: false,
          error: `API returned ${response.status}`,
          details: errorText.substring(0, 200),
          message: "Your API key might be invalid or expired",
        },
      });
    }
    
    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "";
    
    return NextResponse.json({
      success: true,
      test: {
        passed: true,
        response: answer,
        message: "Perplexity API is working correctly!",
        model: data.model || "sonar",
        usage: data.usage || null,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      test: {
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to connect to Perplexity API",
      },
    }, { status: 500 });
  }
}

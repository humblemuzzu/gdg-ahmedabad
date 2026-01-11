import { FunctionTool } from "@google/adk";
import { Type } from "@google/genai";

// Simple in-memory cache with TTL (6 hours)
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { result: VerificationResult; timestamp: number }>();

// Track API call statistics
let apiCallStats = {
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  cacheHits: 0,
  fallbackCalls: 0,
};

// Log with timestamp and category for easy debugging
function logPerplexity(level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const prefix = `[PERPLEXITY ${level}] ${timestamp}`;
  
  if (data) {
    console.log(`${prefix}: ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix}: ${message}`);
  }
}

// Check API key status on module load
const apiKeyStatus = (() => {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) {
    logPerplexity('WARN', 'PERPLEXITY_API_KEY not configured - will use static knowledge base only');
    return 'missing';
  }
  if (key === 'your_perplexity_api_key_here' || key.length < 20) {
    logPerplexity('WARN', 'PERPLEXITY_API_KEY appears to be a placeholder or invalid');
    return 'invalid';
  }
  logPerplexity('SUCCESS', 'PERPLEXITY_API_KEY configured - live verification enabled');
  return 'configured';
})();

// Export function to check API status
export function getPerplexityStatus() {
  return {
    isConfigured: apiKeyStatus === 'configured',
    status: apiKeyStatus,
    stats: { ...apiCallStats },
  };
}

export interface VerificationResult {
  verified: boolean;
  value?: string;
  source?: string;
  sourceUrl?: string;
  lastUpdated?: string;
  confidence: number;
  category: string;
  originalQuery: string;
  fromCache?: boolean;
  error?: string;
}

function getCacheKey(query: string, category: string): string {
  return `${category}:${query.toLowerCase().trim()}`;
}

function getFromCache(key: string): VerificationResult | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    logPerplexity('INFO', `Cache expired for key: ${key.substring(0, 50)}...`);
    return null;
  }
  
  apiCallStats.cacheHits++;
  logPerplexity('INFO', `Cache HIT for: ${key.substring(0, 50)}...`, {
    cacheAge: Math.round((Date.now() - cached.timestamp) / 1000 / 60) + ' minutes',
  });
  return { ...cached.result, fromCache: true };
}

function setCache(key: string, result: VerificationResult): void {
  cache.set(key, { result, timestamp: Date.now() });
}

async function callPerplexityAPI(query: string, category: string): Promise<VerificationResult> {
  apiCallStats.totalCalls++;
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey || apiKey === 'your_perplexity_api_key_here') {
    apiCallStats.fallbackCalls++;
    logPerplexity('WARN', `FALLBACK: No API key - using static data for: ${query.substring(0, 80)}...`);
    return {
      verified: false,
      confidence: 0.5,
      category,
      originalQuery: query,
      error: "Perplexity API key not configured - using static knowledge base",
    };
  }
  
  logPerplexity('INFO', `Making LIVE API call for category: ${category}`, {
    query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
    totalCallsSoFar: apiCallStats.totalCalls,
  });

  const systemPrompt = `You are a verification agent for Indian government bureaucracy data. 
You must verify information about government fees, timelines, licenses, and policies.
Focus on: ${category}

IMPORTANT: Return ONLY a valid JSON object, no markdown, no explanation:
{
  "verified": boolean,
  "value": "the verified value (fee amount, timeline in days, etc.)",
  "source": "official source name (e.g., 'FSSAI Official Website', 'Maharashtra Government Portal')",
  "sourceUrl": "URL if available",
  "lastUpdated": "when this info was last updated (e.g., 'January 2025')",
  "confidence": number between 0 and 1
}

If you cannot verify with high confidence, set verified=false and explain in value field.`;

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar", // Most cost-effective model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Verify this information for India (2024-2025): ${query}` },
        ],
        max_tokens: 300,
        temperature: 0.1, // Low temperature for factual responses
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      apiCallStats.failedCalls++;
      logPerplexity('ERROR', `API call FAILED with status ${response.status}`, {
        error: errorText.substring(0, 200),
        query: query.substring(0, 80),
      });
      return {
        verified: false,
        confidence: 0.5,
        category,
        originalQuery: query,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return {
        verified: false,
        confidence: 0.5,
        category,
        originalQuery: query,
        error: "No response from API",
      };
    }

    // Parse JSON response (handle potential markdown wrapping)
    let parsed: Partial<VerificationResult>;
    try {
      // Remove potential markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleanContent);
    } catch (parseError) {
      // If JSON parsing fails, extract what we can
      return {
        verified: false,
        value: content.substring(0, 200),
        confidence: 0.3,
        category,
        originalQuery: query,
        error: "Could not parse structured response",
      };
    }

    apiCallStats.successfulCalls++;
    logPerplexity('SUCCESS', `API call SUCCEEDED for: ${query.substring(0, 50)}...`, {
      verified: parsed.verified,
      confidence: parsed.confidence,
      source: parsed.source,
      value: parsed.value?.substring(0, 100),
    });
    
    return {
      verified: parsed.verified ?? false,
      value: parsed.value,
      source: parsed.source,
      sourceUrl: parsed.sourceUrl,
      lastUpdated: parsed.lastUpdated,
      confidence: parsed.confidence ?? 0.5,
      category,
      originalQuery: query,
    };
  } catch (error) {
    apiCallStats.failedCalls++;
    logPerplexity('ERROR', `API request FAILED`, {
      error: error instanceof Error ? error.message : String(error),
      query: query.substring(0, 80),
    });
    return {
      verified: false,
      confidence: 0.5,
      category,
      originalQuery: query,
      error: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Tool for verifying government fees (license costs, registration fees, etc.)
 */
export const verifyFeesTool = new FunctionTool({
  name: "verify_government_fees",
  description: "Verify current government license/registration fees against live sources. Use for critical cost verification.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      licenseName: {
        type: Type.STRING,
        description: "Name of the license/registration (e.g., 'FSSAI State License', 'GST Registration')",
      },
      state: {
        type: Type.STRING,
        description: "State name for state-specific fees (e.g., 'Maharashtra', 'Karnataka')",
      },
      expectedFee: {
        type: Type.STRING,
        description: "The fee amount from our database to verify (e.g., '₹5000/year')",
      },
    },
    required: ["licenseName"],
  },
  execute: async (input: unknown) => {
    const { licenseName, state, expectedFee } = input as {
      licenseName: string;
      state?: string;
      expectedFee?: string;
    };
    
    const query = state
      ? `Current official fee for ${licenseName} in ${state}, India 2025. ${expectedFee ? `Is it still ${expectedFee}?` : ""}`
      : `Current official fee for ${licenseName} in India 2025. ${expectedFee ? `Is it still ${expectedFee}?` : ""}`;
    
    const cacheKey = getCacheKey(query, "fees");
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
    
    const result = await callPerplexityAPI(query, "fees");
    if (!result.error) setCache(cacheKey, result);
    
    return result;
  },
});

/**
 * Tool for verifying processing timelines
 */
export const verifyTimelineTool = new FunctionTool({
  name: "verify_processing_timeline",
  description: "Verify current processing times for government applications. Use for timeline accuracy.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      licenseName: {
        type: Type.STRING,
        description: "Name of the license/registration",
      },
      department: {
        type: Type.STRING,
        description: "Department handling the application (e.g., 'FSSAI', 'Fire Department')",
      },
      state: {
        type: Type.STRING,
        description: "State name",
      },
      expectedDays: {
        type: Type.STRING,
        description: "Expected processing time from our database (e.g., '15-30 days')",
      },
    },
    required: ["licenseName"],
  },
  execute: async (input: unknown) => {
    const { licenseName, department, state, expectedDays } = input as {
      licenseName: string;
      department?: string;
      state?: string;
      expectedDays?: string;
    };
    
    let query = `Current processing time for ${licenseName}`;
    if (department) query += ` from ${department}`;
    if (state) query += ` in ${state}`;
    query += ` India 2025`;
    if (expectedDays) query += `. Is it still approximately ${expectedDays}?`;
    
    const cacheKey = getCacheKey(query, "timeline");
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
    
    const result = await callPerplexityAPI(query, "timeline");
    if (!result.error) setCache(cacheKey, result);
    
    return result;
  },
});

/**
 * Tool for checking recent policy changes
 */
export const checkPolicyChangesTool = new FunctionTool({
  name: "check_policy_changes",
  description: "Check for recent policy changes, amendments, or new rules affecting licenses/registrations. Use sparingly.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: {
        type: Type.STRING,
        description: "Topic to check for changes (e.g., 'FSSAI licensing requirements', 'GST thresholds')",
      },
      state: {
        type: Type.STRING,
        description: "State for state-specific changes",
      },
      timeframe: {
        type: Type.STRING,
        description: "Timeframe to check (default: 'last 6 months')",
      },
    },
    required: ["topic"],
  },
  execute: async (input: unknown) => {
    const { topic, state, timeframe = "last 6 months" } = input as {
      topic: string;
      state?: string;
      timeframe?: string;
    };
    
    let query = `Recent changes or amendments to ${topic}`;
    if (state) query += ` in ${state}`;
    query += ` India in ${timeframe} (2024-2025). Any new rules, fee changes, or process updates?`;
    
    const cacheKey = getCacheKey(query, "policy_change");
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
    
    const result = await callPerplexityAPI(query, "policy_change");
    if (!result.error) setCache(cacheKey, result);
    
    return result;
  },
});

/**
 * General verification tool for other requirements
 */
export const verifyRequirementTool = new FunctionTool({
  name: "verify_requirement",
  description: "General verification tool for government requirements, documents needed, or eligibility criteria.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      requirement: {
        type: Type.STRING,
        description: "The requirement to verify",
      },
      context: {
        type: Type.STRING,
        description: "Additional context (business type, state, etc.)",
      },
    },
    required: ["requirement"],
  },
  execute: async (input: unknown) => {
    const { requirement, context } = input as {
      requirement: string;
      context?: string;
    };
    
    let query = `Verify: ${requirement}`;
    if (context) query += `. Context: ${context}`;
    query += ` India 2025.`;
    
    const cacheKey = getCacheKey(query, "requirement");
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
    
    const result = await callPerplexityAPI(query, "requirement");
    if (!result.error) setCache(cacheKey, result);
    
    return result;
  },
});

// Export all tools as an array for easy importing
export const perplexityTools = [
  verifyFeesTool,
  verifyTimelineTool,
  checkPolicyChangesTool,
  verifyRequirementTool,
];

// Export cache stats for debugging
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

// Export API stats for debugging
export function getApiStats() {
  return {
    ...apiCallStats,
    cacheSize: cache.size,
    apiKeyStatus,
    isPerplexityActive: apiKeyStatus === 'configured',
  };
}

// Clear cache (for testing)
export function clearCache() {
  cache.clear();
}

// Reset stats (for testing)
export function resetStats() {
  apiCallStats = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    cacheHits: 0,
    fallbackCalls: 0,
  };
}

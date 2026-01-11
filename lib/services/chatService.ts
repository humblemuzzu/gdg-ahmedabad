/**
 * Chat Service
 * 
 * Handles AI chat functionality using stored analysis context.
 * No reprocessing - uses pre-computed analysis results.
 */

import { generateChatResponse } from "./gemini";
import type { ChatContext, ChatMessage, ChatRequest, ChatResponse } from "@/types/chat";
import type { ProcessResult } from "@/types/process";

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}...`;
}

/**
 * Build compressed context from ProcessResult
 */
export function buildChatContext(caseId: string, query: string, result: ProcessResult): ChatContext {
  const businessName = result.business?.name || result.intent?.businessTypeId || undefined;
  const location = result.location?.city
    ? `${result.location.city}, ${result.location.state || "India"}`
    : result.location?.state || undefined;

  // License summary
  const licenses = result.licenses || [];
  const licenseSummary = {
    total: licenses.length,
    names: licenses.map((l) => l.name).filter(Boolean),
  };

  // Document summary
  const allDocs: Array<{ name: string; required: boolean }> = [];
  for (const group of result.documents || []) {
    for (const item of group.items || []) {
      allDocs.push({ name: item.name, required: item.required });
    }
  }
  const documentSummary = {
    required: allDocs.filter((d) => d.required).length,
    optional: allDocs.filter((d) => !d.required).length,
    names: allDocs.map((d) => d.name),
  };

  // Risk summary
  const riskItems = result.risks?.items || [];
  const riskSummary = {
    score: result.risks?.riskScore0to10 || 0,
    highCount: riskItems.filter((r) => r.severity === "high").length,
    mediumCount: riskItems.filter((r) => r.severity === "medium").length,
    lowCount: riskItems.filter((r) => r.severity === "low").length,
    topRisks: riskItems
      .filter((r) => r.severity === "high" || r.severity === "medium")
      .slice(0, 5)
      .map((r) => r.description),
  };

  // Cost summary
  const costs = result.costs;
  const costSummary = {
    officialTotal: costs?.officialFeesInr || 0,
    practicalMin: costs?.practicalCostsInrRange?.min || 0,
    practicalMax: costs?.practicalCostsInrRange?.max || 0,
  };

  // Timeline summary
  const timeline = result.timeline || [];
  const totalDaysMin = timeline.reduce((sum, item) => sum + (item.estimateDays?.min || 0), 0);
  const totalDaysMax = timeline.reduce((sum, item) => sum + (item.estimateDays?.max || 0), 0);
  const timelineSummary = {
    totalDaysMin,
    totalDaysMax,
    stepsCount: timeline.length,
  };

  // Expert recommendation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expertAdvice = result.outputs?.expertAdvice as any;
  const expertRecommendation = expertAdvice?.recommendation || undefined;

  return {
    caseId,
    query,
    businessName,
    location,
    licenseSummary,
    documentSummary,
    riskSummary,
    costSummary,
    timelineSummary,
    expertRecommendation,
  };
}

/**
 * Format context for the AI prompt
 */
function formatContextForPrompt(context: ChatContext, result: ProcessResult): string {
  const sections: string[] = [];

  // Overview
  sections.push(`## Analysis Overview
- Original Query: "${context.query}"
- Business: ${context.businessName || "Not specified"}
- Location: ${context.location || "Not specified"}
- Risk Score: ${context.riskSummary.score}/10
- Estimated Timeline: ${context.timelineSummary.totalDaysMin}-${context.timelineSummary.totalDaysMax} days
- Official Fees: Rs ${context.costSummary.officialTotal.toLocaleString("en-IN")}`);

  // Licenses
  if (context.licenseSummary.total > 0) {
    sections.push(`## Licenses Required (${context.licenseSummary.total})
${context.licenseSummary.names.map((name, i) => `${i + 1}. ${name}`).join("\n")}`);
  }

  // License details with fees and timeline
  const licenses = result.licenses || [];
  if (licenses.length > 0) {
    sections.push(`## License Details`);
    for (const lic of licenses.slice(0, 10)) {
      const feeInfo = lic.feesInr ? `Fee: Rs ${lic.feesInr}` : "";
      const timeInfo = lic.timelineDays
        ? `Timeline: ${lic.timelineDays.min}-${lic.timelineDays.max} days`
        : "";
      const authorityInfo = lic.authority ? `Authority: ${lic.authority}` : "";
      sections.push(`### ${lic.name}
${[authorityInfo, feeInfo, timeInfo].filter(Boolean).join(" | ")}`);
    }
  }

  // Documents
  if (context.documentSummary.names.length > 0) {
    sections.push(`## Documents Required
- Required: ${context.documentSummary.required}
- Optional: ${context.documentSummary.optional}
Key documents: ${context.documentSummary.names.slice(0, 10).join(", ")}`);
  }

  // Risks
  if (context.riskSummary.topRisks.length > 0) {
    sections.push(`## Key Risks Identified
- High Risks: ${context.riskSummary.highCount}
- Medium Risks: ${context.riskSummary.mediumCount}
- Low Risks: ${context.riskSummary.lowCount}

Top Concerns:
${context.riskSummary.topRisks.map((r) => `- ${truncate(r, 200)}`).join("\n")}`);
  }

  // Risk mitigations
  const riskItems = result.risks?.items || [];
  if (riskItems.length > 0) {
    sections.push(`## Risk Mitigations`);
    for (const risk of riskItems.slice(0, 5)) {
      sections.push(`- ${risk.type}: ${truncate(risk.description, 150)}
  Action: ${truncate(risk.action, 150)}`);
    }
  }

  // Costs breakdown
  const costLineItems = result.costs?.lineItems || [];
  if (costLineItems.length > 0) {
    sections.push(`## Cost Breakdown`);
    for (const item of costLineItems.slice(0, 10)) {
      const amount = item.amountInr
        ? `Rs ${item.amountInr.toLocaleString("en-IN")}`
        : item.rangeInr
          ? `Rs ${item.rangeInr.min.toLocaleString("en-IN")} - ${item.rangeInr.max.toLocaleString("en-IN")}`
          : "TBD";
      sections.push(`- ${item.name}: ${amount}`);
    }
  }

  // Timeline steps
  const timeline = result.timeline || [];
  if (timeline.length > 0) {
    sections.push(`## Process Timeline`);
    for (const step of timeline.slice(0, 10)) {
      const days = step.estimateDays
        ? `${step.estimateDays.min}-${step.estimateDays.max} days`
        : "";
      sections.push(`- ${step.name}: ${days}`);
    }
  }

  // Expert recommendation
  if (context.expertRecommendation) {
    sections.push(`## Expert Recommendation
${truncate(context.expertRecommendation, 500)}`);
  }

  // Visit Plan
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visitPlan = result.outputs?.visitPlan as any;
  if (visitPlan?.visits?.length > 0 || visitPlan?.visitPlan?.length > 0) {
    sections.push(`## Visit Plan Available
The analysis includes a detailed visit plan for government offices.`);
  }

  return sections.join("\n\n");
}

/**
 * Generate suggested questions based on the analysis
 */
function generateSuggestedQuestions(userMessage: string, result: ProcessResult): string[] {
  const suggestions: string[] = [];
  const normalized = userMessage.toLowerCase();

  // Check what user asked about and suggest related topics
  const riskCount = (result.risks?.items || []).filter(
    (r) => r.severity === "high"
  ).length;
  if (riskCount > 0 && !normalized.includes("risk")) {
    suggestions.push("What are the high-risk areas I should focus on?");
  }

  const licenses = result.licenses || [];
  if (licenses.length > 0 && !normalized.includes("license")) {
    suggestions.push(`Tell me more about the ${licenses[0].name} license`);
  }

  if (!normalized.includes("cost") && !normalized.includes("fee")) {
    suggestions.push("What will be the total cost including practical expenses?");
  }

  if (!normalized.includes("time") && !normalized.includes("day")) {
    suggestions.push("How can I speed up the process?");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visitPlan = result.outputs?.visitPlan as any;
  if (visitPlan && !normalized.includes("visit")) {
    suggestions.push("What offices do I need to visit?");
  }

  suggestions.push("What should I do first?");
  suggestions.push("What documents should I prepare?");

  return suggestions.slice(0, 4);
}

/**
 * System prompt for the chat assistant
 */
const CHAT_SYSTEM_PROMPT = `You are the Bureaucracy Breaker AI Assistant. You help users understand government process analysis results and navigate bureaucratic requirements in India.

CAPABILITIES:
- Explain licenses, documents, and requirements in detail
- Break down costs and timelines
- Highlight risks and suggest mitigations
- Recommend next steps and priorities
- Explain the visit plan and office procedures
- Provide practical tips for dealing with government offices

RULES:
1. ONLY use information from the provided analysis context
2. NEVER invent or assume information not in the context
3. Cite specific license names, document names, and costs when relevant
4. Be concise but thorough
5. If asked about something not in the context, clearly state you don't have that information
6. Suggest relevant follow-up questions when appropriate
7. Use professional but accessible language
8. Be encouraging - bureaucracy is stressful but manageable

RESPONSE STYLE:
- Start with a direct answer to the question
- Provide supporting details from the analysis
- End with actionable recommendations when relevant
- Use bullet points for lists
- Keep responses focused and under 400 words unless detail is requested
- Use Rs for currency (Indian Rupees)`;

/**
 * Main chat function - uses stored analysis context
 */
export async function chat(
  request: ChatRequest,
  processResult: ProcessResult
): Promise<ChatResponse> {
  const context = buildChatContext(request.caseId, processResult.query, processResult);
  const contextString = formatContextForPrompt(context, processResult);

  const fullSystemPrompt = `${CHAT_SYSTEM_PROMPT}

## Analysis Context
${contextString}`;

  const conversationHistory = (request.history || []).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const response = await generateChatResponse(
    fullSystemPrompt,
    conversationHistory,
    request.message
  );

  return {
    message: {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
    },
    suggestedQuestions: generateSuggestedQuestions(request.message, processResult),
  };
}

export default {
  chat,
  buildChatContext,
};

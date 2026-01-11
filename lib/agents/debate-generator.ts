import type { DebateMessage, DebateMessageType, Tier } from "@/types";

// Agent info mapping
export const AGENT_INFO: Record<string, { name: string; tier: Tier; emoji: string }> = {
  // Demo mode agents
  demo_agent: { name: "AI Analyst", tier: "intelligence", emoji: "🤖" },
  demo_orchestrator: { name: "Demo Orchestrator", tier: "intelligence", emoji: "🎯" },
  
  // Tier 1: Intake Battalion
  intent_decoder: { name: "Intent Decoder", tier: "intake", emoji: "🎯" },
  location_intelligence: { name: "Location Intel", tier: "intake", emoji: "📍" },
  business_classifier: { name: "Business Classifier", tier: "intake", emoji: "🏢" },
  scale_analyzer: { name: "Scale Analyzer", tier: "intake", emoji: "📊" },
  
  // Tier 2: Research Battalion
  regulation_librarian: { name: "Regulation Librarian", tier: "research", emoji: "📚" },
  policy_scout: { name: "Policy Scout", tier: "research", emoji: "🔍" },
  document_detective: { name: "Document Detective", tier: "research", emoji: "📋" },
  department_mapper: { name: "Department Mapper", tier: "research", emoji: "🏛️" },
  
  // Tier 3: Strategy Battalion
  dependency_builder: { name: "Dependency Builder", tier: "strategy", emoji: "🔗" },
  timeline_architect: { name: "Timeline Architect", tier: "strategy", emoji: "⏱️" },
  parallel_optimizer: { name: "Parallel Optimizer", tier: "strategy", emoji: "🔀" },
  cost_calculator: { name: "Cost Calculator", tier: "strategy", emoji: "💰" },
  risk_assessor: { name: "Risk Assessor", tier: "strategy", emoji: "⚠️" },
  
  // Tier 4: Document Battalion
  form_wizard: { name: "Form Wizard", tier: "document", emoji: "📝" },
  document_validator: { name: "Document Validator", tier: "document", emoji: "✅" },
  rti_drafter: { name: "RTI Drafter", tier: "document", emoji: "📄" },
  grievance_writer: { name: "Grievance Writer", tier: "document", emoji: "📢" },
  appeal_crafter: { name: "Appeal Crafter", tier: "document", emoji: "📈" },
  
  // Tier 5: Execution Battalion
  visit_planner: { name: "Visit Planner", tier: "execution", emoji: "🗓️" },
  reminder_engine: { name: "Reminder Engine", tier: "execution", emoji: "🔔" },
  status_tracker: { name: "Status Tracker", tier: "execution", emoji: "📊" },
  
  // Tier 6: Intelligence Battalion
  corruption_detector: { name: "Corruption Detector", tier: "intelligence", emoji: "🕵️" },
  comparison_agent: { name: "Comparison Agent", tier: "intelligence", emoji: "🆚" },
  whatif_simulator: { name: "What-If Simulator", tier: "intelligence", emoji: "🔮" },
  expert_simulator: { name: "Expert Simulator", tier: "intelligence", emoji: "🧠" },
  final_compiler: { name: "Final Compiler", tier: "intelligence", emoji: "📦" },
};

// Patterns to detect message types
const MESSAGE_PATTERNS: { type: DebateMessageType; patterns: RegExp[] }[] = [
  {
    type: "warning",
    patterns: [
      /\b(warning|risk|danger|caution|critical|urgent|issue|problem|fail|reject|block|stuck)\b/i,
      /\b(must|mandatory|required|essential)\b.*\b(first|before)\b/i,
      /\b(will fail|will be rejected|won't work|cannot proceed)\b/i,
    ],
  },
  {
    type: "disagreement",
    patterns: [
      /\b(disagree|however|but|incorrect|wrong|actually|not quite|that's not)\b/i,
      /\b(I would argue|on the contrary|I don't think)\b/i,
    ],
  },
  {
    type: "agreement",
    patterns: [
      /\b(agree|correct|right|exactly|confirm|yes|indeed|absolutely)\b/i,
      /\b(building on|adding to|as .* mentioned|supports? this)\b/i,
    ],
  },
  {
    type: "question",
    patterns: [
      /\?$/,
      /\b(what about|how about|should we|could we|need to check|verify|clarify)\b/i,
    ],
  },
  {
    type: "suggestion",
    patterns: [
      /\b(suggest|recommend|should|could|consider|propose|advise)\b/i,
      /\b(better to|ideal to|best to)\b/i,
    ],
  },
  {
    type: "insight",
    patterns: [
      /\b(found|discovered|noticed|detected|identified|observed)\b/i,
      /\b(important|key|crucial|significant|notable)\b/i,
    ],
  },
  {
    type: "consensus",
    patterns: [
      /\b(consensus|agreed|final|conclusion|summary|overall)\b/i,
      /\b(all agents|we all|collectively)\b/i,
    ],
  },
  {
    type: "correction",
    patterns: [
      /\b(correction|update|revised|actually|let me clarify)\b/i,
    ],
  },
];

// Detect message type from content
function detectMessageType(content: string, tier: Tier): DebateMessageType {
  for (const { type, patterns } of MESSAGE_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        return type;
      }
    }
  }
  
  // Default based on tier
  switch (tier) {
    case "intelligence":
      return "insight";
    case "strategy":
      return "suggestion";
    case "research":
      return "observation";
    default:
      return "observation";
  }
}

// Agent references detection - finds mentions of other agents
function detectAgentReferences(content: string, previousAgents: string[]): { agentId: string; agentName: string } | undefined {
  const lowerContent = content.toLowerCase();
  
  // Check for explicit mentions
  for (const agentId of previousAgents) {
    const info = AGENT_INFO[agentId];
    if (info && (
      lowerContent.includes(info.name.toLowerCase()) ||
      lowerContent.includes(agentId.replace(/_/g, " "))
    )) {
      return { agentId, agentName: info.name };
    }
  }
  
  // Check for pronoun references (when agreeing/disagreeing)
  const referencePatterns = [
    /\b(as|like) (\w+) (said|mentioned|noted|pointed out|identified)\b/i,
    /\b(building on|adding to|agreeing with|contrary to) (\w+)'?s?\b/i,
    /\b(the|this) (previous|last|above) (agent|analysis|finding)\b/i,
  ];
  
  for (const pattern of referencePatterns) {
    if (pattern.test(content) && previousAgents.length > 0) {
      const lastAgent = previousAgents[previousAgents.length - 1];
      const info = AGENT_INFO[lastAgent];
      if (info) {
        return { agentId: lastAgent, agentName: info.name };
      }
    }
  }
  
  return undefined;
}

// Extract confidence from content
function extractConfidence(content: string): number | undefined {
  const confidencePatterns = [
    /\b(\d{1,2}(?:\.\d+)?)\s*%?\s*confiden(?:ce|t)\b/i,
    /\bconfiden(?:ce|t)\s*(?:is|of|:)?\s*(\d{1,2}(?:\.\d+)?)\s*%?\b/i,
    /\bhigh(?:ly)?\s+confiden/i,  // High confidence
    /\blow\s+confiden/i,          // Low confidence
    /\bmoderate\s+confiden/i,     // Moderate confidence
  ];
  
  for (const pattern of confidencePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      return value > 1 ? value / 100 : value;
    }
    if (match) {
      if (/high/i.test(match[0])) return 0.9;
      if (/moderate/i.test(match[0])) return 0.7;
      if (/low/i.test(match[0])) return 0.5;
    }
  }
  
  return undefined;
}

// Try to parse JSON from content (handles markdown code blocks too)
function tryParseJson(content: string): Record<string, unknown> | null {
  const trimmed = content.trim();
  
  // Try to extract JSON from markdown code blocks
  const jsonMatch =
    trimmed.match(/```json\s*([\s\S]*?)\s*```/) || trimmed.match(/```\s*([\s\S]*?)\s*```/);
  const candidate = (jsonMatch ? jsonMatch[1] : trimmed).trim();
  
  // Check if it looks like JSON
  if (!candidate.startsWith("{") && !candidate.startsWith("[")) {
    return null;
  }
  
  try {
    const parsed = JSON.parse(candidate);
    return typeof parsed === "object" ? parsed : null;
  } catch {
    // Try to extract first valid JSON object
    const start = candidate.indexOf("{");
    if (start === -1) return null;
    
    let depth = 0;
    let inString = false;
    let escape = false;
    
    for (let i = start; i < candidate.length; i++) {
      const ch = candidate[i];
      if (inString) {
        if (escape) { escape = false; continue; }
        if (ch === "\\") { escape = true; continue; }
        if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') { inString = true; continue; }
      if (ch === "{") depth++;
      if (ch === "}") {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(candidate.slice(start, i + 1));
          } catch {
            return null;
          }
        }
      }
    }
    return null;
  }
}

// Extract human-readable content from JSON based on agent type
function extractHumanReadableContent(json: Record<string, unknown>, agentId: string): string | null {
  // If there's a debateComment field, use it directly
  if (typeof json.debateComment === "string" && json.debateComment.length > 10) {
    return json.debateComment;
  }
  
  // Agent-specific extraction
  switch (agentId) {
    case "intent_decoder": {
      const intent = json.primaryIntent || json.intent;
      const confidence = json.confidenceScore || json.confidence;
      if (intent) {
        return `Detected user intent: "${intent}"${confidence ? ` with ${Math.round(Number(confidence) * 100)}% confidence` : ""}.`;
      }
      break;
    }
    
    case "location_intelligence": {
      const state = json.state || json.stateName;
      const district = json.district;
      const zones = json.applicableZones || json.zones;
      if (state) {
        let msg = `Location identified: ${district ? `${district}, ` : ""}${state}`;
        if (zones && Array.isArray(zones) && zones.length > 0) {
          msg += `. Applicable zones: ${zones.slice(0, 3).join(", ")}`;
        }
        return msg + ".";
      }
      break;
    }
    
    case "business_classifier": {
      const category = json.primaryCategory || json.category || json.businessCategory;
      const subCategory = json.subCategory;
      const riskLevel = json.riskLevel;
      if (category) {
        let msg = `Business classified as: ${category}`;
        if (subCategory) msg += ` (${subCategory})`;
        if (riskLevel) msg += `. Risk level: ${riskLevel}`;
        return msg + ".";
      }
      break;
    }
    
    case "scale_analyzer": {
      const scale = json.businessScale || json.scale;
      const employees = json.estimatedEmployees || json.employees;
      const investment = json.estimatedInvestment || json.investment;
      if (scale) {
        let msg = `Business scale: ${scale}`;
        if (employees) msg += `. Estimated employees: ${employees}`;
        if (investment) msg += `. Investment range: ${investment}`;
        return msg + ".";
      }
      break;
    }
    
    case "regulation_librarian": {
      const regulations = json.applicableRegulations || json.regulations;
      const acts = json.applicableActs || json.acts;
      if (Array.isArray(regulations) && regulations.length > 0) {
        return `Found ${regulations.length} applicable regulations: ${regulations.slice(0, 3).map((r: unknown) => typeof r === "string" ? r : (r as Record<string, unknown>).name || (r as Record<string, unknown>).title).join(", ")}${regulations.length > 3 ? "..." : ""}.`;
      }
      if (Array.isArray(acts) && acts.length > 0) {
        return `Applicable acts: ${acts.slice(0, 3).join(", ")}${acts.length > 3 ? "..." : ""}.`;
      }
      break;
    }
    
    case "policy_scout": {
      const policies = json.relevantPolicies || json.policies;
      const incentives = json.availableIncentives || json.incentives;
      if (Array.isArray(policies) && policies.length > 0) {
        return `Found ${policies.length} relevant policies that may apply to this business.`;
      }
      if (Array.isArray(incentives) && incentives.length > 0) {
        return `Identified ${incentives.length} potential incentives or subsidies available.`;
      }
      break;
    }
    
    case "document_detective": {
      const documents = json.requiredDocuments || json.documents;
      if (Array.isArray(documents) && documents.length > 0) {
        return `${documents.length} documents required: ${documents.slice(0, 3).map((d: unknown) => typeof d === "string" ? d : (d as Record<string, unknown>).name || (d as Record<string, unknown>).documentName).join(", ")}${documents.length > 3 ? "..." : ""}.`;
      }
      break;
    }
    
    case "department_mapper": {
      const departments = json.departments || json.relevantDepartments;
      const singleWindow = json.singleWindowAvailable || json.singleWindow;
      if (Array.isArray(departments) && departments.length > 0) {
        let msg = `${departments.length} departments involved: ${departments.slice(0, 3).map((d: unknown) => typeof d === "string" ? d : (d as Record<string, unknown>).name).join(", ")}`;
        if (singleWindow) msg += ". Single window system available!";
        return msg + ".";
      }
      break;
    }
    
    case "dependency_builder": {
      const summary = json.graphSummary || json.summary;
      const totalNodes = (summary as Record<string, unknown>)?.totalNodes || json.totalNodes;
      const criticalPath = (summary as Record<string, unknown>)?.criticalPathLength || json.criticalPathLength;
      const parallel = (summary as Record<string, unknown>)?.parallelTracksCount || json.parallelTracks;
      if (totalNodes) {
        let msg = `Built dependency graph with ${totalNodes} steps`;
        if (criticalPath) msg += `, critical path of ${criticalPath} stages`;
        if (parallel) msg += `, ${parallel} parallel tracks possible`;
        return msg + ".";
      }
      break;
    }
    
    case "timeline_architect": {
      const totalDays = json.totalEstimatedDays || json.estimatedDays || json.totalDays;
      const phases = json.phases || json.timeline;
      if (totalDays) {
        let msg = `Timeline estimate: ${totalDays} days total`;
        if (Array.isArray(phases) && phases.length > 0) {
          msg += ` across ${phases.length} phases`;
        }
        return msg + ".";
      }
      break;
    }
    
    case "parallel_optimizer": {
      const sequential = json.estimatedDaysIfSequential || json.sequentialDays;
      const parallel = json.estimatedDaysIfParallel || json.parallelDays;
      const savings = json.timeSavings || json.daysSaved;
      if (parallel && sequential) {
        return `Optimization complete! Sequential: ${sequential} days vs Parallel: ${parallel} days. Saves ${savings || (Number(sequential) - Number(parallel))} days.`;
      }
      if (parallel) {
        return `Optimized timeline: ${parallel} days with parallel processing enabled.`;
      }
      break;
    }
    
    case "cost_calculator": {
      const totalCost = json.totalEstimatedCost || json.totalCost;
      const breakdown = json.costBreakdown || json.breakdown;
      const range = json.costRange as Record<string, number> | undefined;
      if (totalCost) {
        const rangeStr = range && range.min && range.max 
          ? ` (range: ₹${range.min.toLocaleString("en-IN")} - ₹${range.max.toLocaleString("en-IN")})`
          : "";
        return `Estimated total cost: ₹${Number(totalCost).toLocaleString("en-IN")}${rangeStr}.`;
      }
      if (breakdown && typeof breakdown === "object") {
        const items = Object.entries(breakdown).slice(0, 3);
        return `Cost breakdown: ${items.map(([k, v]) => `${k}: ₹${Number(v).toLocaleString("en-IN")}`).join(", ")}...`;
      }
      break;
    }
    
    case "risk_assessor": {
      const risks = json.identifiedRisks || json.risks;
      const overallRisk = json.overallRiskLevel || json.riskLevel;
      if (Array.isArray(risks) && risks.length > 0) {
        const highRisks = risks.filter((r: unknown) => (r as Record<string, unknown>).severity === "high" || (r as Record<string, unknown>).level === "high");
        return `Identified ${risks.length} risks${highRisks.length > 0 ? ` (${highRisks.length} high priority)` : ""}. Overall risk: ${overallRisk || "moderate"}.`;
      }
      if (overallRisk) {
        return `Overall risk assessment: ${overallRisk}.`;
      }
      break;
    }
    
    case "form_wizard": {
      const forms = json.requiredForms || json.forms;
      if (Array.isArray(forms) && forms.length > 0) {
        return `${forms.length} forms identified: ${forms.slice(0, 3).map((f: unknown) => typeof f === "string" ? f : (f as Record<string, unknown>).name || (f as Record<string, unknown>).formName).join(", ")}${forms.length > 3 ? "..." : ""}.`;
      }
      break;
    }
    
    case "visit_planner": {
      const visits = json.plannedVisits || json.visits;
      const totalVisits = json.totalVisits;
      if (Array.isArray(visits) && visits.length > 0) {
        return `Planned ${visits.length} office visits. First visit: ${(visits[0] as Record<string, unknown>).department || (visits[0] as Record<string, unknown>).office || "Government office"}.`;
      }
      if (totalVisits) {
        return `${totalVisits} office visits will be required to complete all formalities.`;
      }
      break;
    }
    
    case "corruption_detector": {
      const flags = json.redFlags || json.warnings || json.corruptionIndicators;
      const score = json.transparencyScore || json.score;
      if (Array.isArray(flags) && flags.length > 0) {
        return `Alert: ${flags.length} potential red flags detected. Exercise caution during the process.`;
      }
      if (score) {
        return `Transparency score: ${score}/100. ${Number(score) > 70 ? "Generally safe process." : "Some areas need attention."}`;
      }
      return "No significant corruption risks identified for this process.";
    }
    
    case "expert_simulator":
    case "final_compiler": {
      const summary = json.summary || json.executiveSummary;
      const recommendation = json.recommendation || json.keyRecommendation;
      if (typeof summary === "string" && summary.length > 10) {
        return summary.length > 200 ? summary.slice(0, 200) + "..." : summary;
      }
      if (typeof recommendation === "string" && recommendation.length > 10) {
        return recommendation.length > 200 ? recommendation.slice(0, 200) + "..." : recommendation;
      }
      break;
    }
  }
  
  // Generic extraction: look for common summary fields
  const summaryFields = ["summary", "description", "overview", "result", "analysis", "finding", "conclusion", "message"];
  for (const field of summaryFields) {
    const value = json[field];
    if (typeof value === "string" && value.length > 15 && value.length < 300) {
      return value;
    }
  }
  
  // Try to extract from nested structures
  if (json.result && typeof json.result === "object") {
    const result = extractHumanReadableContent(json.result as Record<string, unknown>, agentId);
    if (result) return result;
  }
  
  if (json.output && typeof json.output === "object") {
    const output = extractHumanReadableContent(json.output as Record<string, unknown>, agentId);
    if (output) return output;
  }
  
  return null;
}

// Make content more conversational for debate
function makeConversational(content: string, type: DebateMessageType, agentName: string, agentId: string): string {
  // First, try to parse as JSON and extract human-readable content
  const json = tryParseJson(content);
  let text: string;
  
  if (json) {
    const extracted = extractHumanReadableContent(json, agentId);
    if (extracted) {
      text = extracted;
    } else {
      // JSON but couldn't extract - generate generic message based on agent
      text = generateGenericMessage(agentId, json);
    }
  } else {
    // Not JSON - use the raw content but clean it up
    text = content
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
  }
  
  // Truncate very long content
  if (text.length > 250) {
    text = text.slice(0, 247) + "...";
  }
  
  // Add conversational prefix based on type
  const prefixes: Record<DebateMessageType, string[]> = {
    warning: ["Heads up!", "Important:", "Caution:", "Watch out -"],
    agreement: ["Agreed!", "Yes,", "Exactly.", "Confirmed -"],
    disagreement: ["Actually,", "I'd argue", "Not quite -", "Let me clarify:"],
    question: ["Quick question:", "Need input:", "Checking:"],
    suggestion: ["I'd suggest", "Consider this:", "My recommendation:"],
    insight: ["Found something:", "Key insight:", "Noticed:"],
    consensus: ["All agreed:", "Final position:", "Consensus reached:"],
    correction: ["Update:", "Correction:", "Revised:"],
    observation: ["I'm seeing", "Analyzing:", "Looking at"],
  };
  
  // Only add prefix if content doesn't already start conversationally
  const hasPrefix = /^[A-Z][a-z]+[!:,.]/.test(text);
  if (!hasPrefix && prefixes[type]) {
    const prefix = prefixes[type][Math.floor(Math.random() * prefixes[type].length)];
    text = `${prefix} ${text}`;
  }
  
  return text;
}

// Generate a generic message when we can't extract specific content
function generateGenericMessage(agentId: string, json: Record<string, unknown>): string {
  const keyCount = Object.keys(json).length;
  
  const genericMessages: Record<string, string> = {
    intent_decoder: "Analyzing the user's business intent and requirements...",
    location_intelligence: "Processing location data and regional requirements...",
    business_classifier: "Classifying the business type and applicable categories...",
    scale_analyzer: "Evaluating business scale and operational parameters...",
    regulation_librarian: "Researching applicable laws and regulations...",
    policy_scout: "Scanning for relevant policies and incentives...",
    document_detective: "Compiling required documentation list...",
    department_mapper: "Mapping relevant government departments...",
    dependency_builder: "Building the process dependency graph...",
    timeline_architect: "Constructing the timeline estimate...",
    parallel_optimizer: "Optimizing for parallel processing opportunities...",
    cost_calculator: "Calculating estimated costs and fees...",
    risk_assessor: "Assessing potential risks and challenges...",
    form_wizard: "Identifying required forms and applications...",
    document_validator: "Validating document requirements...",
    visit_planner: "Planning required office visits...",
    reminder_engine: "Setting up reminder schedule...",
    status_tracker: "Configuring status tracking...",
    corruption_detector: "Running transparency checks...",
    comparison_agent: "Comparing options across different scenarios...",
    whatif_simulator: "Running what-if scenarios...",
    expert_simulator: "Generating expert recommendations...",
    final_compiler: "Compiling final analysis report...",
  };
  
  return genericMessages[agentId] || `Processing complete with ${keyCount} data points analyzed.`;
}

// Generate a debate message from agent event data
export function generateDebateMessage(
  agentId: string,
  content: string,
  previousAgents: string[],
  existingMessages: DebateMessage[] = []
): DebateMessage | null {
  // Normalize agent ID
  const normalizedId = agentId.replace(/-/g, "_");
  const info = AGENT_INFO[normalizedId];
  
  if (!info) {
    console.warn(`Unknown agent: ${agentId}`);
    return null;
  }
  
  // Skip very short or empty content
  if (!content || content.length < 15) {
    return null;
  }
  
  // Detect message properties
  const type = detectMessageType(content, info.tier);
  const reference = detectAgentReferences(content, previousAgents);
  const confidence = extractConfidence(content);
  const conversationalContent = makeConversational(content, type, info.name, normalizedId);
  
  return {
    id: `debate_${normalizedId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    fromAgent: normalizedId,
    fromDisplayName: info.name,
    fromTier: info.tier,
    type,
    referencesAgent: reference?.agentId,
    referencesAgentName: reference?.agentName,
    content: conversationalContent,
    confidence,
    emoji: info.emoji,
  };
}

// Generate synthetic debate messages for demo/testing
export function generateSyntheticDebate(businessType: string, location: string): DebateMessage[] {
  const now = Date.now();
  const messages: DebateMessage[] = [];
  
  const debates = [
    {
      agent: "intent_decoder",
      content: `Understood! User wants to start a ${businessType} business in ${location}. Clear intent detected with high confidence.`,
      type: "observation" as DebateMessageType,
    },
    {
      agent: "location_intelligence",
      content: `${location} identified. Checking state-specific requirements... Found some special rules that apply here.`,
      type: "insight" as DebateMessageType,
    },
    {
      agent: "business_classifier",
      content: `Classified as ${businessType}. This will require multiple category-specific licenses.`,
      type: "observation" as DebateMessageType,
      ref: "intent_decoder",
    },
    {
      agent: "regulation_librarian",
      content: `Found applicable regulations: FSSAI Act, Shop & Establishment Act, Fire Safety regulations. Several state-specific variations apply.`,
      type: "insight" as DebateMessageType,
    },
    {
      agent: "risk_assessor",
      content: `Warning: I'm flagging a potential issue. The building zone type needs verification - if it's residential, Fire NOC will be rejected!`,
      type: "warning" as DebateMessageType,
      ref: "location_intelligence",
    },
    {
      agent: "timeline_architect",
      content: `Based on current requirements, estimating 35-45 days for complete setup. But wait...`,
      type: "observation" as DebateMessageType,
    },
    {
      agent: "risk_assessor",
      content: `I'd argue we need to add buffer time. My analysis shows 40% of Fire NOC applications in this area face delays.`,
      type: "disagreement" as DebateMessageType,
      ref: "timeline_architect",
    },
    {
      agent: "timeline_architect",
      content: `Good point. Adjusting estimate to 45-60 days to account for the Fire NOC risk factor.`,
      type: "agreement" as DebateMessageType,
      ref: "risk_assessor",
    },
    {
      agent: "parallel_optimizer",
      content: `I can help here! If we run GST, FSSAI, and Shop Act in parallel, we save 15+ days. Here's the optimized plan...`,
      type: "suggestion" as DebateMessageType,
    },
    {
      agent: "cost_calculator",
      content: `Adding up all fees: Official costs around Rs 25,000-35,000. But practical costs including documentation will be Rs 45,000-65,000.`,
      type: "insight" as DebateMessageType,
    },
    {
      agent: "expert_simulator",
      content: `Consensus reached: Priority should be 1) Verify building OC, 2) Start parallel applications, 3) Keep buffer for Fire NOC. All agents aligned on this approach.`,
      type: "consensus" as DebateMessageType,
    },
  ];
  
  debates.forEach((debate, index) => {
    const info = AGENT_INFO[debate.agent];
    if (info) {
      const refInfo = debate.ref ? AGENT_INFO[debate.ref] : undefined;
      messages.push({
        id: `synthetic_${index}`,
        timestamp: now + (index * 2000), // 2 second gaps
        fromAgent: debate.agent,
        fromDisplayName: info.name,
        fromTier: info.tier,
        type: debate.type,
        referencesAgent: debate.ref,
        referencesAgentName: refInfo?.name,
        content: debate.content,
        emoji: info.emoji,
        confidence: debate.type === "warning" ? 0.85 : undefined,
      });
    }
  });
  
  return messages;
}

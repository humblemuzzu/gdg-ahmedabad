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

// Make content more conversational for debate
function makeConversational(content: string, type: DebateMessageType, agentName: string): string {
  // Truncate very long content
  let text = content.length > 200 ? content.slice(0, 200) + "..." : content;
  
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
  const conversationalContent = makeConversational(content, type, info.name);
  
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

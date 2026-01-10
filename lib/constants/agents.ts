import type { Tier } from "@/types";

// Client-side agent info mapping (for UI components)
export const AGENT_INFO: Record<string, { name: string; tier: Tier; emoji: string }> = {
  intent_decoder: { name: "Intent Decoder", tier: "intake", emoji: "🎯" },
  location_intelligence: { name: "Location Intel", tier: "intake", emoji: "📍" },
  business_classifier: { name: "Business Classifier", tier: "intake", emoji: "🏢" },
  scale_analyzer: { name: "Scale Analyzer", tier: "intake", emoji: "📊" },
  regulation_librarian: { name: "Regulation Librarian", tier: "research", emoji: "📚" },
  policy_scout: { name: "Policy Scout", tier: "research", emoji: "🔍" },
  document_detective: { name: "Document Detective", tier: "research", emoji: "📋" },
  department_mapper: { name: "Department Mapper", tier: "research", emoji: "🏛️" },
  dependency_builder: { name: "Dependency Builder", tier: "strategy", emoji: "🔗" },
  timeline_architect: { name: "Timeline Architect", tier: "strategy", emoji: "⏱️" },
  parallel_optimizer: { name: "Parallel Optimizer", tier: "strategy", emoji: "🔀" },
  cost_calculator: { name: "Cost Calculator", tier: "strategy", emoji: "💰" },
  risk_assessor: { name: "Risk Assessor", tier: "strategy", emoji: "⚠️" },
  form_wizard: { name: "Form Wizard", tier: "document", emoji: "📝" },
  document_validator: { name: "Document Validator", tier: "document", emoji: "✅" },
  rti_drafter: { name: "RTI Drafter", tier: "document", emoji: "📄" },
  grievance_writer: { name: "Grievance Writer", tier: "document", emoji: "📢" },
  appeal_crafter: { name: "Appeal Crafter", tier: "document", emoji: "📈" },
  visit_planner: { name: "Visit Planner", tier: "execution", emoji: "🗓️" },
  reminder_engine: { name: "Reminder Engine", tier: "execution", emoji: "🔔" },
  status_tracker: { name: "Status Tracker", tier: "execution", emoji: "📊" },
  corruption_detector: { name: "Corruption Detector", tier: "intelligence", emoji: "🕵️" },
  comparison_agent: { name: "Comparison Agent", tier: "intelligence", emoji: "🆚" },
  whatif_simulator: { name: "What-If Simulator", tier: "intelligence", emoji: "🔮" },
  expert_simulator: { name: "Expert Simulator", tier: "intelligence", emoji: "🧠" },
  final_compiler: { name: "Final Compiler", tier: "intelligence", emoji: "📦" },
};

// Tier display info
export const TIER_INFO: Record<Tier, { label: string; color: string; description: string }> = {
  intake: { 
    label: "Intake", 
    color: "cyan",
    description: "Understanding your query"
  },
  research: { 
    label: "Research", 
    color: "purple",
    description: "Gathering requirements and regulations"
  },
  strategy: { 
    label: "Strategy", 
    color: "orange",
    description: "Planning timelines, costs, and dependencies"
  },
  document: { 
    label: "Document", 
    color: "green",
    description: "Preparing forms and templates"
  },
  execution: { 
    label: "Execution", 
    color: "blue",
    description: "Planning visits and tracking"
  },
  intelligence: { 
    label: "Intelligence", 
    color: "pink",
    description: "Advanced analysis and insights"
  },
};

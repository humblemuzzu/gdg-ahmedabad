import type { ProcessRisk, ProcessCost } from "@/types";

/**
 * Default costs when AI doesn't return proper cost data
 * Based on common business types in India
 */
export const DEFAULT_COSTS_BY_TYPE: Record<string, { official: number; practicalMin: number; practicalMax: number }> = {
  restaurant: { official: 25000, practicalMin: 45000, practicalMax: 75000 },
  "food-service": { official: 25000, practicalMin: 45000, practicalMax: 75000 },
  "it-company": { official: 15000, practicalMin: 25000, practicalMax: 50000 },
  software: { official: 15000, practicalMin: 25000, practicalMax: 50000 },
  startup: { official: 12000, practicalMin: 20000, practicalMax: 40000 },
  "export-business": { official: 20000, practicalMin: 35000, practicalMax: 60000 },
  export: { official: 20000, practicalMin: 35000, practicalMax: 60000 },
  "retail-shop": { official: 10000, practicalMin: 18000, practicalMax: 35000 },
  retail: { official: 10000, practicalMin: 18000, practicalMax: 35000 },
  manufacturing: { official: 35000, practicalMin: 60000, practicalMax: 120000 },
  default: { official: 15000, practicalMin: 30000, practicalMax: 60000 },
};

/**
 * Get estimated costs based on business type
 */
export function getEstimatedCosts(businessType?: string): { official: number; practicalMin: number; practicalMax: number } {
  if (!businessType) return DEFAULT_COSTS_BY_TYPE.default;
  
  const normalizedType = businessType.toLowerCase().replace(/\s+/g, "-");
  
  // Try exact match
  if (DEFAULT_COSTS_BY_TYPE[normalizedType]) {
    return DEFAULT_COSTS_BY_TYPE[normalizedType];
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(DEFAULT_COSTS_BY_TYPE)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return value;
    }
  }
  
  return DEFAULT_COSTS_BY_TYPE.default;
}

/**
 * Default risks that apply to ALL government processes in India
 * These should always be shown when no specific risks are identified
 */
export const DEFAULT_RISKS: ProcessRisk[] = [
  {
    id: "default-delay",
    title: "Processing delays during peak seasons",
    severity: "medium",
    mitigation: "Apply early in the month and avoid end of financial year (March). Peak seasons include GST filing months and festival periods.",
  },
  {
    id: "default-documents",
    title: "Document verification may require multiple visits",
    severity: "low",
    mitigation: "Carry original documents plus 2 self-attested copies for each visit. Keep a folder organized by department.",
  },
  {
    id: "default-office-hours",
    title: "Office timings and availability may vary",
    severity: "low",
    mitigation: "Call ahead to confirm timings. Government offices typically work 10 AM - 5 PM with lunch break 1-2 PM. Avoid Monday mornings and Friday afternoons.",
  },
  {
    id: "default-name-mismatch",
    title: "Name/address mismatches across documents can cause rejection",
    severity: "medium",
    mitigation: "Ensure your name is spelled EXACTLY the same across PAN, Aadhaar, and all other documents before applying.",
  },
  {
    id: "default-digital-signature",
    title: "Some applications require Digital Signature Certificate (DSC)",
    severity: "low",
    mitigation: "Get a Class 3 DSC from authorized vendors like eMudhra, Sify, or nCode. Takes 3-5 days and costs Rs 1,500-2,500.",
  },
];

/**
 * Get risks with defaults if none provided
 */
export function getRisksWithDefaults(risks: ProcessRisk[]): ProcessRisk[] {
  if (risks && risks.length > 0) {
    return risks;
  }
  return DEFAULT_RISKS;
}

/**
 * Default license costs (official fees) for common licenses
 */
export const LICENSE_COSTS: Record<string, number> = {
  "fssai-basic": 100,
  "fssai-state": 5000,
  "fssai-central": 7500,
  gst: 0, // Free
  "fire-noc": 3000,
  "shop-establishment": 1500,
  "trade-license": 2500,
  "health-trade-license": 2500,
  signage: 5000,
  liquor: 50000, // Varies greatly by state
  iec: 500,
  msme: 0, // Free
};

/**
 * Calculate total official cost from licenses
 */
export function calculateOfficialCost(licenses?: Array<{ id?: string; name?: string }>): number {
  if (!licenses || licenses.length === 0) return 0;
  
  let total = 0;
  for (const license of licenses) {
    const key = license.id?.toLowerCase() || license.name?.toLowerCase().replace(/\s+/g, "-") || "";
    
    for (const [licenseKey, cost] of Object.entries(LICENSE_COSTS)) {
      if (key.includes(licenseKey) || licenseKey.includes(key)) {
        total += cost;
        break;
      }
    }
  }
  
  // If no matches found, estimate Rs 2000 per license
  if (total === 0 && licenses.length > 0) {
    total = licenses.length * 2000;
  }
  
  return total;
}

/**
 * Default state comparison data when agent doesn't return comparison
 * Shows common states for business setup comparison
 */
export interface StateComparisonItem {
  state: string;
  totalDays: { min: number; max: number };
  totalCost: number;
  complexity: number;
  advantages?: string[];
  disadvantages?: string[];
}

export const DEFAULT_STATE_COMPARISON: StateComparisonItem[] = [
  {
    state: "Telangana",
    totalDays: { min: 25, max: 40 },
    totalCost: 20000,
    complexity: 2,
    advantages: [
      "TS-iPASS: Auto-approval if no response in 15 days",
      "Most business-friendly state in India",
      "Single window clearance system",
      "Minimal inspections required"
    ],
    disadvantages: [
      "Limited to certain industrial zones for manufacturing",
      "Startup ecosystem concentrated in Hyderabad"
    ]
  },
  {
    state: "Gujarat",
    totalDays: { min: 30, max: 50 },
    totalCost: 22000,
    complexity: 3,
    advantages: [
      "Well-developed industrial infrastructure (GIDC)",
      "Business-friendly policies",
      "Good port connectivity for exports",
      "Efficient online systems"
    ],
    disadvantages: [
      "Higher land costs in major cities",
      "Competition for industrial plots"
    ]
  },
  {
    state: "Karnataka",
    totalDays: { min: 35, max: 55 },
    totalCost: 25000,
    complexity: 3,
    advantages: [
      "Karnataka Udyog Mitra single window",
      "Strong IT and startup ecosystem",
      "Good infrastructure in Bangalore",
      "Skilled workforce availability"
    ],
    disadvantages: [
      "Higher costs in Bangalore",
      "Traffic and infrastructure challenges",
      "Water scarcity issues in some areas"
    ]
  },
  {
    state: "Maharashtra",
    totalDays: { min: 40, max: 70 },
    totalCost: 30000,
    complexity: 4,
    advantages: [
      "Largest consumer market in India",
      "Excellent infrastructure (ports, airports)",
      "Well-established industrial zones (MIDC)",
      "Strong financial ecosystem"
    ],
    disadvantages: [
      "Higher compliance burden",
      "More complex procedures",
      "Higher costs overall",
      "Longer processing times"
    ]
  },
  {
    state: "Delhi",
    totalDays: { min: 45, max: 75 },
    totalCost: 35000,
    complexity: 5,
    advantages: [
      "Access to central government",
      "National capital region market",
      "Good connectivity"
    ],
    disadvantages: [
      "Multiple authorities (MCD, NDMC, DCB)",
      "High scrutiny and compliance",
      "Very high costs",
      "Pollution restrictions for manufacturing"
    ]
  }
];

export const DEFAULT_STATE_COMPARISON_RECOMMENDATION = 
  "Based on ease of doing business, Telangana offers the fastest setup with TS-iPASS auto-approval. Gujarat and Karnataka are good alternatives with balanced costs and timelines. Maharashtra has the largest market but higher complexity.";

/**
 * Get state comparison with defaults if none provided
 */
export function getStateComparisonWithDefaults(comparison?: { states?: StateComparisonItem[]; recommendation?: string }): { states: StateComparisonItem[]; recommendation: string } {
  if (comparison?.states && comparison.states.length > 0) {
    return {
      states: comparison.states,
      recommendation: comparison.recommendation || DEFAULT_STATE_COMPARISON_RECOMMENDATION
    };
  }
  return {
    states: DEFAULT_STATE_COMPARISON,
    recommendation: DEFAULT_STATE_COMPARISON_RECOMMENDATION
  };
}

/**
 * Default What-If scenarios when agent doesn't return scenarios
 * Common failure scenarios and their mitigations
 */
export interface WhatIfScenario {
  scenario: string;
  probability?: number;
  impact?: string;
  mitigation?: string;
  outcomes?: Array<{
    outcome: string;
    probability?: number;
    action?: string;
  }>;
}

export const DEFAULT_WHATIF_SCENARIOS: WhatIfScenario[] = [
  {
    scenario: "Application gets rejected due to document issues",
    probability: 0.25,
    impact: "Delays of 2-4 weeks while correcting and resubmitting",
    mitigation: "Double-check all documents before submission. Ensure name consistency across all papers. Get documents attested as required.",
    outcomes: [
      { outcome: "Minor correction needed (typo, missing signature)", probability: 0.6, action: "Correct and resubmit within 1-2 days" },
      { outcome: "Major document missing or invalid", probability: 0.3, action: "Obtain correct document (may take 1-2 weeks)" },
      { outcome: "Fundamental eligibility issue", probability: 0.1, action: "Seek professional help to resolve" }
    ]
  },
  {
    scenario: "Processing takes longer than expected timeline",
    probability: 0.40,
    impact: "Business opening delayed, ongoing costs without revenue",
    mitigation: "Apply early, follow up regularly, maintain good relationships with department staff, keep all acknowledgments safe.",
    outcomes: [
      { outcome: "Slight delay (1-2 weeks)", probability: 0.5, action: "Regular follow-ups via portal and phone" },
      { outcome: "Significant delay (1 month+)", probability: 0.35, action: "File RTI to understand status" },
      { outcome: "Application lost or stuck indefinitely", probability: 0.15, action: "Escalate to senior officers, file grievance on CPGRAMS" }
    ]
  },
  {
    scenario: "Inspection fails on first attempt",
    probability: 0.20,
    impact: "Re-inspection scheduling adds 1-3 weeks delay",
    mitigation: "Prepare thoroughly before inspection. Have all equipment installed and documents ready. Be present during inspection.",
    outcomes: [
      { outcome: "Minor observations to fix", probability: 0.7, action: "Fix issues immediately, request quick re-inspection" },
      { outcome: "Major compliance gaps found", probability: 0.25, action: "Invest in proper compliance, may need professional help" },
      { outcome: "Premises deemed unsuitable", probability: 0.05, action: "May need to find different location" }
    ]
  },
  {
    scenario: "Fees or requirements change mid-process",
    probability: 0.10,
    impact: "Additional costs and paperwork required",
    mitigation: "Check for latest requirements before applying. Budget 10-20% extra for contingencies.",
    outcomes: [
      { outcome: "Small fee increase", probability: 0.6, action: "Pay additional amount" },
      { outcome: "New document requirement added", probability: 0.3, action: "Obtain new document" },
      { outcome: "Major process change", probability: 0.1, action: "May need to start fresh under new process" }
    ]
  },
  {
    scenario: "Landlord becomes uncooperative",
    probability: 0.15,
    impact: "Cannot obtain landlord NOC or renew rent agreement",
    mitigation: "Get all landlord commitments in writing before signing lease. Include clauses for license-related cooperation.",
    outcomes: [
      { outcome: "Landlord eventually cooperates with persuasion", probability: 0.5, action: "Negotiate, involve mutual contacts" },
      { outcome: "Need legal notice to landlord", probability: 0.35, action: "Send legal notice through lawyer" },
      { outcome: "Must relocate business", probability: 0.15, action: "Start fresh at new location" }
    ]
  }
];

export const DEFAULT_WHATIF_RECOMMENDATION = 
  "Always maintain buffer time (2-4 weeks) and contingency budget (15-20%) for unexpected scenarios. Keep copies of all submissions and acknowledgments. Build relationships with department contacts for smoother processing.";

/**
 * Get what-if scenarios with defaults if none provided
 */
export function getWhatIfWithDefaults(whatIf?: { scenarios?: WhatIfScenario[]; recommendation?: string }): { scenarios: WhatIfScenario[]; recommendation: string } {
  if (whatIf?.scenarios && whatIf.scenarios.length > 0) {
    return {
      scenarios: whatIf.scenarios,
      recommendation: whatIf.recommendation || DEFAULT_WHATIF_RECOMMENDATION
    };
  }
  return {
    scenarios: DEFAULT_WHATIF_SCENARIOS,
    recommendation: DEFAULT_WHATIF_RECOMMENDATION
  };
}

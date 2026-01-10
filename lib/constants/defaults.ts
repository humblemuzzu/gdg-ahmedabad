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

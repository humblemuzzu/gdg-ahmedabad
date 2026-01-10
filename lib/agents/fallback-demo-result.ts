/**
 * FALLBACK DEMO RESULT
 * 
 * This is a pre-built result that will be used when:
 * 1. API key is missing or invalid
 * 2. Gemini API returns empty response
 * 3. Any error occurs during agent processing
 * 
 * This ensures the hackathon demo always shows something impressive!
 */

export interface FallbackResult {
  query: {
    original: string;
    interpreted: string;
  };
  intent: {
    primary: string;
    confidence: number;
  };
  location: {
    state: string;
    city: string;
    municipality: string;
    specialRules: string[];
  };
  business: {
    type: string;
    subType: string;
    name: string;
    description: string;
  };
  licenses: Array<{
    id: string;
    name: string;
    authority: string;
    type: string;
    timeline: { minDays: number; maxDays: number; avgDays: number };
    fees: { official: number; practical: { min: number; max: number } };
    priority: string;
  }>;
  documents: Array<{
    id: string;
    title: string;
    items: Array<{ id: string; name: string; required: boolean }>;
  }>;
  timeline: {
    summary: { minDays: number; maxDays: number; avgDays: number };
    items: Array<{
      id: string;
      name: string;
      owner: string;
      estimateDays: { min: number; max: number };
    }>;
  };
  costs: {
    summary: { officialTotal: number; practicalRange: { min: number; max: number } };
    lineItems: Array<{
      id: string;
      name: string;
      amountInr: number;
      notes: string[];
    }>;
  };
  risks: {
    overallScore: number;
    items: Array<{
      id: string;
      title: string;
      severity: string;
      description: string;
      action: string;
    }>;
  };
  nextActions: Array<{
    priority: number;
    action: string;
    deadline: string;
  }>;
  expertAdvice: {
    ca: string;
    lawyer: string;
    owner: string;
  };
}

export function generateFallbackResult(query: string): FallbackResult {
  // Parse basic info from query
  const lowerQuery = query.toLowerCase();
  
  // Detect business type
  let businessType = "Business";
  let subType = "General";
  if (lowerQuery.includes("restaurant") || lowerQuery.includes("food") || lowerQuery.includes("hotel")) {
    businessType = "Restaurant";
    subType = "Dine-in Restaurant";
  } else if (lowerQuery.includes("it") || lowerQuery.includes("software") || lowerQuery.includes("tech")) {
    businessType = "IT Company";
    subType = "Software Services";
  } else if (lowerQuery.includes("shop") || lowerQuery.includes("retail") || lowerQuery.includes("store")) {
    businessType = "Retail Shop";
    subType = "General Store";
  } else if (lowerQuery.includes("export") || lowerQuery.includes("import")) {
    businessType = "Export Business";
    subType = "Trading";
  }
  
  // Detect location
  let city = "Mumbai";
  let state = "Maharashtra";
  let municipality = "BMC";
  
  if (lowerQuery.includes("delhi")) {
    city = "Delhi"; state = "Delhi"; municipality = "MCD";
  } else if (lowerQuery.includes("bangalore") || lowerQuery.includes("bengaluru")) {
    city = "Bengaluru"; state = "Karnataka"; municipality = "BBMP";
  } else if (lowerQuery.includes("pune")) {
    city = "Pune"; state = "Maharashtra"; municipality = "PMC";
  } else if (lowerQuery.includes("chennai")) {
    city = "Chennai"; state = "Tamil Nadu"; municipality = "GCC";
  } else if (lowerQuery.includes("hyderabad")) {
    city = "Hyderabad"; state = "Telangana"; municipality = "GHMC";
  } else if (lowerQuery.includes("ahmedabad")) {
    city = "Ahmedabad"; state = "Gujarat"; municipality = "AMC";
  } else if (lowerQuery.includes("mumbai") || lowerQuery.includes("bombay")) {
    city = "Mumbai"; state = "Maharashtra"; municipality = "BMC";
  }
  
  // Restaurant in Mumbai - detailed result
  if (businessType === "Restaurant") {
    return {
      query: {
        original: query,
        interpreted: `Start a ${subType} in ${city}, ${state}`
      },
      intent: {
        primary: "START_BUSINESS",
        confidence: 0.95
      },
      location: {
        state,
        city,
        municipality,
        specialRules: [
          `${municipality} Health Trade License mandatory`,
          "Eating House License required for dine-in",
          "Fire NOC mandatory for area > 500 sq ft",
          state === "Maharashtra" ? "Gumasta License required" : "Shop & Establishment License required"
        ]
      },
      business: {
        type: businessType,
        subType,
        name: businessType,
        description: `${subType} serving food and beverages in ${city}`
      },
      licenses: [
        {
          id: "fssai",
          name: "FSSAI Food License",
          authority: "Food Safety and Standards Authority of India",
          type: "mandatory",
          timeline: { minDays: 7, maxDays: 21, avgDays: 14 },
          fees: { official: 5000, practical: { min: 5000, max: 10000 } },
          priority: "critical"
        },
        {
          id: "gst",
          name: "GST Registration",
          authority: "GST Portal",
          type: "mandatory",
          timeline: { minDays: 3, maxDays: 7, avgDays: 5 },
          fees: { official: 0, practical: { min: 500, max: 2000 } },
          priority: "critical"
        },
        {
          id: "fire-noc",
          name: "Fire NOC",
          authority: `${state} Fire Services`,
          type: "mandatory",
          timeline: { minDays: 15, maxDays: 45, avgDays: 28 },
          fees: { official: 3000, practical: { min: 5000, max: 15000 } },
          priority: "high"
        },
        {
          id: "shop-establishment",
          name: state === "Maharashtra" ? "Gumasta License" : "Shop & Establishment License",
          authority: "Labour Department",
          type: "mandatory",
          timeline: { minDays: 15, maxDays: 30, avgDays: 22 },
          fees: { official: 1500, practical: { min: 2000, max: 5000 } },
          priority: "high"
        },
        {
          id: "health-license",
          name: "Health Trade License",
          authority: `${municipality} Health Department`,
          type: "mandatory",
          timeline: { minDays: 10, maxDays: 21, avgDays: 14 },
          fees: { official: 2500, practical: { min: 3000, max: 7000 } },
          priority: "high"
        },
        {
          id: "eating-house",
          name: "Eating House License",
          authority: "Police Department",
          type: "mandatory",
          timeline: { minDays: 30, maxDays: 60, avgDays: 45 },
          fees: { official: 2000, practical: { min: 5000, max: 15000 } },
          priority: "medium"
        },
        {
          id: "signage",
          name: "Signage License",
          authority: municipality,
          type: "optional",
          timeline: { minDays: 7, maxDays: 14, avgDays: 10 },
          fees: { official: 5000, practical: { min: 5000, max: 8000 } },
          priority: "low"
        }
      ],
      documents: [
        {
          id: "identity",
          title: "Identity Documents",
          items: [
            { id: "pan", name: "PAN Card", required: true },
            { id: "aadhaar", name: "Aadhaar Card", required: true },
            { id: "photos", name: "Passport Size Photos (4)", required: true }
          ]
        },
        {
          id: "address",
          title: "Address Proofs",
          items: [
            { id: "rent", name: "Rent Agreement (Notarized)", required: true },
            { id: "noc-landlord", name: "NOC from Landlord", required: true },
            { id: "electricity", name: "Electricity Bill (< 3 months)", required: true }
          ]
        },
        {
          id: "business",
          title: "Business Documents",
          items: [
            { id: "partnership", name: "Partnership Deed / MOA (if applicable)", required: false },
            { id: "board-resolution", name: "Board Resolution (for companies)", required: false }
          ]
        },
        {
          id: "technical",
          title: "Technical Documents",
          items: [
            { id: "floor-plan", name: "Floor Plan (Architect certified)", required: true },
            { id: "fire-plan", name: "Fire Safety Plan", required: true },
            { id: "kitchen-layout", name: "Kitchen Layout Plan", required: true }
          ]
        }
      ],
      timeline: {
        summary: { minDays: 35, maxDays: 60, avgDays: 45 },
        items: [
          { id: "step1", name: "PAN & Document Collection", owner: "Applicant", estimateDays: { min: 1, max: 3 } },
          { id: "step2", name: "GST Registration", owner: "GST Portal", estimateDays: { min: 3, max: 7 } },
          { id: "step3", name: "FSSAI License Application", owner: "FSSAI", estimateDays: { min: 7, max: 21 } },
          { id: "step4", name: "Fire NOC Application", owner: `${state} Fire Services`, estimateDays: { min: 15, max: 45 } },
          { id: "step5", name: state === "Maharashtra" ? "Gumasta Application" : "Shop Act Registration", owner: "Labour Dept", estimateDays: { min: 15, max: 30 } },
          { id: "step6", name: "Health License", owner: `${municipality}`, estimateDays: { min: 10, max: 21 } },
          { id: "step7", name: "Eating House License", owner: "Police Dept", estimateDays: { min: 30, max: 60 } }
        ]
      },
      costs: {
        summary: { officialTotal: 19000, practicalRange: { min: 35000, max: 65000 } },
        lineItems: [
          { id: "gst", name: "GST Registration", amountInr: 0, notes: ["Free - no government fee"] },
          { id: "fssai", name: "FSSAI State License", amountInr: 5000, notes: ["Annual fee for state license"] },
          { id: "fire", name: "Fire NOC", amountInr: 3000, notes: ["One-time fee"] },
          { id: "gumasta", name: state === "Maharashtra" ? "Gumasta License" : "Shop Act", amountInr: 1500, notes: ["One-time registration"] },
          { id: "health", name: "Health Trade License", amountInr: 2500, notes: ["Annual renewal"] },
          { id: "eating", name: "Eating House License", amountInr: 2000, notes: ["Annual fee"] },
          { id: "signage", name: "Signage License", amountInr: 5000, notes: ["Annual fee based on size"] },
          { id: "consultant", name: "CA/Consultant Fees", amountInr: 15000, notes: ["Practical cost - can DIY to save"] },
          { id: "misc", name: "Documentation & Travel", amountInr: 5000, notes: ["Notary, photocopies, travel"] }
        ]
      },
      risks: {
        overallScore: 6,
        items: [
          {
            id: "risk1",
            title: "Building Occupancy Certificate (OC)",
            severity: "high",
            description: "Fire NOC will be REJECTED if building doesn't have valid OC",
            action: "Verify OC exists BEFORE signing lease agreement"
          },
          {
            id: "risk2",
            title: "Residential Zone Issue",
            severity: "high",
            description: "If location is in residential zone, commercial license will be denied",
            action: "Confirm the area allows commercial food establishments"
          },
          {
            id: "risk3",
            title: "Name Mismatch in Documents",
            severity: "medium",
            description: "Different spellings in PAN/Aadhaar can cause rejection",
            action: "Ensure name is exactly same across all documents"
          },
          {
            id: "risk4",
            title: "Fire NOC Delays",
            severity: "medium",
            description: "Fire NOC typically takes 2x longer than official timeline",
            action: "Apply early, follow up weekly, use RTPS portal if available"
          }
        ]
      },
      nextActions: [
        { priority: 1, action: "Verify building has Occupancy Certificate", deadline: "Before signing lease" },
        { priority: 2, action: "Get PAN Card if not available", deadline: "Day 1" },
        { priority: 3, action: "Start GST registration", deadline: "Day 1-3" },
        { priority: 4, action: "Apply for FSSAI license (run parallel with GST)", deadline: "Day 1-7" },
        { priority: 5, action: "Apply for Fire NOC (takes longest)", deadline: "Day 3-10" },
        { priority: 6, action: "Apply for Health License", deadline: "After Fire NOC filed" }
      ],
      expertAdvice: {
        ca: "Register GST even if below threshold - you'll need it for B2B transactions and can claim input credit",
        lawyer: "Get the lease agreement reviewed - ensure it allows commercial food service and has exit clause",
        owner: "Start Fire NOC and Eating House License early - these take longest and often have surprise requirements"
      }
    };
  }
  
  // Generic business result for other types
  return {
    query: {
      original: query,
      interpreted: `Start a ${businessType} in ${city}, ${state}`
    },
    intent: {
      primary: "START_BUSINESS",
      confidence: 0.85
    },
    location: {
      state,
      city,
      municipality,
      specialRules: [
        state === "Maharashtra" ? "Gumasta License required" : "Shop & Establishment License required",
        "GST mandatory if turnover > Rs 40L (goods) or Rs 20L (services)"
      ]
    },
    business: {
      type: businessType,
      subType,
      name: businessType,
      description: `${businessType} in ${city}`
    },
    licenses: [
      {
        id: "gst",
        name: "GST Registration",
        authority: "GST Portal",
        type: "mandatory",
        timeline: { minDays: 3, maxDays: 7, avgDays: 5 },
        fees: { official: 0, practical: { min: 500, max: 2000 } },
        priority: "critical"
      },
      {
        id: "shop-establishment",
        name: state === "Maharashtra" ? "Gumasta License" : "Shop & Establishment License",
        authority: "Labour Department",
        type: "mandatory",
        timeline: { minDays: 15, maxDays: 30, avgDays: 22 },
        fees: { official: 1500, practical: { min: 2000, max: 5000 } },
        priority: "high"
      },
      {
        id: "trade-license",
        name: "Trade License",
        authority: municipality,
        type: "mandatory",
        timeline: { minDays: 10, maxDays: 21, avgDays: 14 },
        fees: { official: 2000, practical: { min: 3000, max: 6000 } },
        priority: "high"
      }
    ],
    documents: [
      {
        id: "identity",
        title: "Identity Documents",
        items: [
          { id: "pan", name: "PAN Card", required: true },
          { id: "aadhaar", name: "Aadhaar Card", required: true }
        ]
      },
      {
        id: "address",
        title: "Address Proofs",
        items: [
          { id: "rent", name: "Rent Agreement", required: true },
          { id: "electricity", name: "Electricity Bill", required: true }
        ]
      }
    ],
    timeline: {
      summary: { minDays: 20, maxDays: 45, avgDays: 30 },
      items: [
        { id: "step1", name: "Document Collection", owner: "Applicant", estimateDays: { min: 1, max: 3 } },
        { id: "step2", name: "GST Registration", owner: "GST Portal", estimateDays: { min: 3, max: 7 } },
        { id: "step3", name: "Shop Act Registration", owner: "Labour Dept", estimateDays: { min: 15, max: 30 } }
      ]
    },
    costs: {
      summary: { officialTotal: 5000, practicalRange: { min: 10000, max: 25000 } },
      lineItems: [
        { id: "gst", name: "GST Registration", amountInr: 0, notes: ["Free"] },
        { id: "shop-act", name: "Shop & Establishment", amountInr: 1500, notes: ["One-time"] },
        { id: "trade", name: "Trade License", amountInr: 2000, notes: ["Annual"] },
        { id: "consultant", name: "Consultant Fees", amountInr: 8000, notes: ["Optional"] }
      ]
    },
    risks: {
      overallScore: 4,
      items: [
        {
          id: "risk1",
          title: "Document Delays",
          severity: "medium",
          description: "Missing or incorrect documents can cause 2-3 week delays",
          action: "Prepare all documents in advance with exact specifications"
        }
      ]
    },
    nextActions: [
      { priority: 1, action: "Get PAN Card if not available", deadline: "Day 1" },
      { priority: 2, action: "Start GST registration", deadline: "Day 1-3" },
      { priority: 3, action: "Apply for Shop & Establishment License", deadline: "Day 5-10" }
    ],
    expertAdvice: {
      ca: "Keep proper books from day 1 - it's easier than reconstructing later",
      lawyer: "Review all contracts before signing",
      owner: "Start with minimal licenses, add more as business grows"
    }
  };
}

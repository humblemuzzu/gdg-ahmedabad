/**
 * DEMO DATA - Pre-computed realistic results for hackathon demo
 * 
 * This provides a polished, instant demo experience with:
 * - Rich, detailed ProcessResult data
 * - Realistic agent debate messages
 * - SSE events with proper timing
 * 
 * Used when:
 * 1. User clicks "Try Demo" button
 * 2. First visit detection triggers demo
 * 3. API fails and we need a fallback
 */

import type { ProcessResult, VisitPlanData, GeneratedDraft } from "@/types/process";
import type { DebateMessage, Tier } from "@/types";

// ============================================================================
// DEMO QUERY
// ============================================================================
export const DEMO_QUERY = "I want to start a restaurant in Ahmedabad, Gujarat. It will be a dine-in restaurant serving Gujarati thali with about 50 seats.";

// ============================================================================
// PRE-COMPUTED DEMO RESULT - Restaurant in Ahmedabad
// ============================================================================
export const DEMO_RESULT: ProcessResult = {
  query: DEMO_QUERY,
  
  intent: {
    intent: "START_BUSINESS",
    businessTypeId: "restaurant",
    businessSubTypeId: "dine-in-restaurant",
    location: {
      city: "Ahmedabad",
      state: "Gujarat"
    },
    urgency: "normal",
    confidence: 0.96,
    clarifyingQuestions: [],
    rawEntities: {
      seatingCapacity: 50,
      cuisineType: "Gujarati Thali",
      serviceType: "Dine-in"
    }
  },

  location: {
    state: "Gujarat",
    stateId: "GJ",
    city: "Ahmedabad",
    municipality: "AMC (Ahmedabad Municipal Corporation)",
    zone: "commercial",
    specialRules: [
      "Gujarat is a dry state - no liquor license possible",
      "AMC Health License mandatory for food establishments",
      "Fire NOC required for seating capacity > 30",
      "Gujarat Shop & Establishment Act registration required",
      "FSSAI State License needed for turnover > Rs 12 Lakh"
    ],
    stateVariations: [
      "Gujarat has stricter food safety inspections than many states",
      "No Sunday closing requirement unlike some states",
      "AMC online portal available for faster processing"
    ]
  },

  business: {
    id: "restaurant",
    subTypeId: "dine-in-gujarati-thali",
    name: "Dine-in Gujarati Thali Restaurant"
  },

  licenses: [
    {
      id: "fssai-state",
      name: "FSSAI State Food License",
      authority: "Food Safety and Standards Authority of India",
      timelineDays: { min: 7, max: 30, avg: 15 },
      feesInr: { official: 5000, practical: { min: 5000, max: 12000 } }
    },
    {
      id: "gst",
      name: "GST Registration",
      authority: "GST Portal (Central Government)",
      timelineDays: { min: 3, max: 7, avg: 5 },
      feesInr: { official: 0, practical: { min: 500, max: 2000 } }
    },
    {
      id: "fire-noc",
      name: "Fire NOC",
      authority: "Gujarat Fire & Emergency Services",
      timelineDays: { min: 15, max: 45, avg: 25 },
      feesInr: { official: 3500, practical: { min: 5000, max: 18000 } }
    },
    {
      id: "shop-establishment",
      name: "Gujarat Shop & Establishment License",
      authority: "Labour & Employment Department, Gujarat",
      timelineDays: { min: 10, max: 21, avg: 14 },
      feesInr: { official: 1200, practical: { min: 1500, max: 4000 } }
    },
    {
      id: "amc-health",
      name: "AMC Health Trade License",
      authority: "Ahmedabad Municipal Corporation - Health Department",
      timelineDays: { min: 14, max: 30, avg: 21 },
      feesInr: { official: 3000, practical: { min: 4000, max: 10000 } }
    },
    {
      id: "eating-house",
      name: "Eating House License",
      authority: "Ahmedabad Police Commissioner Office",
      timelineDays: { min: 30, max: 60, avg: 42 },
      feesInr: { official: 2500, practical: { min: 5000, max: 15000 } }
    },
    {
      id: "signage",
      name: "Signage/Hoarding License",
      authority: "AMC - Town Planning Department",
      timelineDays: { min: 7, max: 14, avg: 10 },
      feesInr: { official: 5000, practical: { min: 5500, max: 8000 } }
    }
  ],

  documents: [
    {
      title: "Identity & Address Documents",
      items: [
        { id: "pan", name: "PAN Card of Proprietor/Partners/Directors", required: true, specification: "Must be valid and linked with Aadhaar" },
        { id: "aadhaar", name: "Aadhaar Card", required: true, specification: "With mobile number linked for OTP verification" },
        { id: "photos", name: "Passport Size Photographs", required: true, specification: "4 copies, white background, recent (within 3 months)" },
        { id: "address-proof", name: "Current Address Proof", required: true, tips: ["Electricity bill, bank statement, or gas bill within 3 months"] }
      ]
    },
    {
      title: "Business Premises Documents",
      items: [
        { id: "rent-agreement", name: "Registered Rent Agreement", required: true, specification: "Notarized and registered, minimum 11 months validity", tips: ["Ensure it mentions 'restaurant/food business' as permitted use"] },
        { id: "noc-landlord", name: "NOC from Landlord", required: true, specification: "On Rs 100 stamp paper with landlord's photo & Aadhaar", tips: ["Must explicitly permit food/restaurant business"] },
        { id: "electricity-bill", name: "Electricity Bill of Premises", required: true, specification: "Latest bill with commercial connection" },
        { id: "property-tax", name: "Property Tax Receipt", required: false, tips: ["May be requested for AMC Health License"] }
      ]
    },
    {
      title: "Technical & Safety Documents",
      items: [
        { id: "floor-plan", name: "Floor Plan (Architect Certified)", required: true, specification: "Showing kitchen, dining, storage areas with dimensions" },
        { id: "fire-plan", name: "Fire Safety Plan", required: true, specification: "Showing fire exits, extinguisher locations, emergency routes" },
        { id: "kitchen-layout", name: "Kitchen Layout Plan", required: true, specification: "Showing equipment placement, ventilation, drainage" },
        { id: "water-test", name: "Water Test Report", required: true, specification: "From AMC-approved lab, within 6 months" }
      ]
    },
    {
      title: "Business Registration Documents",
      items: [
        { id: "partnership-deed", name: "Partnership Deed (if applicable)", required: false, specification: "Notarized on stamp paper" },
        { id: "moa-aoa", name: "MOA & AOA (for company)", required: false, specification: "Certified copy from MCA" },
        { id: "board-resolution", name: "Board Resolution (for company)", required: false, specification: "Authorizing restaurant operations" },
        { id: "gst-certificate", name: "GST Registration Certificate", required: true, tips: ["Apply first as other licenses need this"] }
      ]
    },
    {
      title: "Staff & Compliance Documents",
      items: [
        { id: "food-handler", name: "Food Handler Training Certificate", required: true, specification: "FSSAI approved training for at least 1 staff member", tips: ["Can be done online at FOSTAC portal"] },
        { id: "medical-fitness", name: "Medical Fitness Certificates", required: true, specification: "For all food handlers, from registered medical practitioner" },
        { id: "pest-control", name: "Pest Control Contract", required: true, specification: "Annual contract with AMC-listed vendor" }
      ]
    }
  ],

  dependencyGraph: {
    nodes: [
      { id: "pan", type: "document", name: "PAN Card", meta: { category: "identity" } },
      { id: "gst", type: "license", name: "GST Registration", meta: { priority: 1 } },
      { id: "fssai", type: "license", name: "FSSAI License", meta: { priority: 2 } },
      { id: "fire-noc", type: "license", name: "Fire NOC", meta: { priority: 2 } },
      { id: "shop-est", type: "license", name: "Shop & Establishment", meta: { priority: 2 } },
      { id: "amc-health", type: "license", name: "AMC Health License", meta: { priority: 3 } },
      { id: "eating-house", type: "license", name: "Eating House License", meta: { priority: 4 } },
      { id: "start-ops", type: "step", name: "Start Operations", meta: { milestone: true } }
    ],
    edges: [
      { from: "pan", to: "gst", type: "requires" },
      { from: "gst", to: "fssai", type: "enables" },
      { from: "gst", to: "fire-noc", type: "enables" },
      { from: "gst", to: "shop-est", type: "enables" },
      { from: "fssai", to: "amc-health", type: "requires" },
      { from: "fire-noc", to: "amc-health", type: "requires" },
      { from: "amc-health", to: "eating-house", type: "enables" },
      { from: "eating-house", to: "start-ops", type: "enables" }
    ],
    criticalPath: ["pan", "gst", "fire-noc", "amc-health", "eating-house", "start-ops"],
    parallelGroups: [
      ["fssai", "fire-noc", "shop-est"],
      ["amc-health"]
    ]
  },

  timeline: [
    {
      id: "step-1",
      name: "Document Collection & Preparation",
      estimateDays: { min: 3, max: 7, avg: 5 },
      canRunInParallelWith: [],
      prerequisites: [],
      notes: [
        "Gather all identity documents, get notarized rent agreement",
        "Get architect to prepare floor plan and fire safety plan",
        "Schedule water testing at AMC-approved lab"
      ]
    },
    {
      id: "step-2",
      name: "GST Registration",
      estimateDays: { min: 3, max: 7, avg: 5 },
      canRunInParallelWith: [],
      prerequisites: ["step-1"],
      notes: [
        "Apply online at gst.gov.in",
        "ARN number generated within 48 hours",
        "Physical verification may be required"
      ]
    },
    {
      id: "step-3a",
      name: "FSSAI State License Application",
      estimateDays: { min: 7, max: 30, avg: 15 },
      canRunInParallelWith: ["step-3b", "step-3c"],
      prerequisites: ["step-2"],
      notes: [
        "Apply at foscos.fssai.gov.in",
        "State license required as expected turnover > Rs 12 Lakh",
        "Food Safety Officer will conduct inspection"
      ]
    },
    {
      id: "step-3b",
      name: "Fire NOC Application",
      estimateDays: { min: 15, max: 45, avg: 25 },
      canRunInParallelWith: ["step-3a", "step-3c"],
      prerequisites: ["step-2"],
      notes: [
        "Apply at Gujarat Fire portal or visit office",
        "Site inspection is mandatory",
        "Install required fire safety equipment before inspection"
      ]
    },
    {
      id: "step-3c",
      name: "Shop & Establishment Registration",
      estimateDays: { min: 10, max: 21, avg: 14 },
      canRunInParallelWith: ["step-3a", "step-3b"],
      prerequisites: ["step-2"],
      notes: [
        "Apply at labour.gujarat.gov.in",
        "Can be done fully online",
        "Compliance for working hours and employee welfare"
      ]
    },
    {
      id: "step-4",
      name: "AMC Health Trade License",
      estimateDays: { min: 14, max: 30, avg: 21 },
      canRunInParallelWith: [],
      prerequisites: ["step-3a", "step-3b"],
      notes: [
        "Apply at AMC citizen portal",
        "Requires FSSAI and Fire NOC",
        "Health inspector will visit premises"
      ]
    },
    {
      id: "step-5",
      name: "Eating House License",
      estimateDays: { min: 30, max: 60, avg: 42 },
      canRunInParallelWith: [],
      prerequisites: ["step-4"],
      notes: [
        "Apply at Police Commissioner Office",
        "Police verification of owner/partners",
        "Premises inspection by police"
      ]
    },
    {
      id: "step-6",
      name: "Final Preparations & Soft Launch",
      estimateDays: { min: 3, max: 7, avg: 5 },
      canRunInParallelWith: [],
      prerequisites: ["step-5"],
      notes: [
        "Display all licenses at premises",
        "Train staff on food safety protocols",
        "Soft launch for friends/family before grand opening"
      ]
    }
  ],

  costs: {
    officialFeesInr: 20200,
    practicalCostsInrRange: { min: 45000, max: 85000 },
    lineItems: [
      {
        id: "cost-gst",
        name: "GST Registration",
        kind: "official_fee",
        amountInr: 0,
        notes: ["Free - no government fee"]
      },
      {
        id: "cost-fssai",
        name: "FSSAI State License (5 years)",
        kind: "official_fee",
        amountInr: 5000,
        notes: ["Annual fee Rs 2000, recommend 5-year license"]
      },
      {
        id: "cost-fire",
        name: "Fire NOC",
        kind: "official_fee",
        amountInr: 3500,
        notes: ["Varies based on area, this is for ~1000 sq ft"]
      },
      {
        id: "cost-shop-est",
        name: "Shop & Establishment",
        kind: "official_fee",
        amountInr: 1200,
        notes: ["One-time registration"]
      },
      {
        id: "cost-amc-health",
        name: "AMC Health Trade License",
        kind: "official_fee",
        amountInr: 3000,
        notes: ["Annual renewal required"]
      },
      {
        id: "cost-eating",
        name: "Eating House License",
        kind: "official_fee",
        amountInr: 2500,
        notes: ["Annual fee"]
      },
      {
        id: "cost-signage",
        name: "Signage License",
        kind: "official_fee",
        amountInr: 5000,
        notes: ["Depends on signage size"]
      },
      {
        id: "cost-ca",
        name: "CA/Consultant Fees",
        kind: "practical_cost",
        rangeInr: { min: 15000, max: 25000 },
        notes: ["Recommended for GST, FSSAI filing - saves time"]
      },
      {
        id: "cost-architect",
        name: "Architect Fees (Plans)",
        kind: "practical_cost",
        rangeInr: { min: 8000, max: 15000 },
        notes: ["Floor plan, fire safety plan, kitchen layout"]
      },
      {
        id: "cost-fire-equip",
        name: "Fire Safety Equipment",
        kind: "practical_cost",
        rangeInr: { min: 15000, max: 30000 },
        notes: ["Extinguishers, smoke detectors, emergency lights"]
      },
      {
        id: "cost-water-test",
        name: "Water Testing & Reports",
        kind: "practical_cost",
        rangeInr: { min: 1500, max: 3000 },
        notes: ["From AMC-approved laboratory"]
      },
      {
        id: "cost-misc",
        name: "Miscellaneous (notary, copies, travel)",
        kind: "practical_cost",
        rangeInr: { min: 5000, max: 10000 },
        notes: ["Stamp papers, notarization, office visits"]
      }
    ]
  },

  risks: {
    riskScore0to10: 6.5,
    items: [
      {
        type: "ZONE_ISSUE",
        severity: "high",
        description: "Building Occupancy Certificate (OC) missing or invalid",
        action: "BEFORE signing lease: Ask landlord for OC copy. No OC = No Fire NOC = No Health License",
        urgency: "immediate"
      },
      {
        type: "ZONE_ISSUE",
        severity: "high",
        description: "Premises in residential zone or near school/hospital",
        action: "Verify with AMC Town Planning that commercial food establishment is permitted at this location",
        urgency: "immediate"
      },
      {
        type: "DELAY",
        severity: "high",
        description: "Fire NOC delays (most common bottleneck in Gujarat)",
        action: "Apply ASAP after GST, follow up weekly, ensure all equipment installed before inspection",
        urgency: "soon"
      },
      {
        type: "BRIBE_REQUEST",
        severity: "medium",
        description: "Possible unofficial payment requests during inspections",
        action: "Know your rights, apply through official portals, keep written records, escalate via RTI if needed",
        urgency: "later"
      },
      {
        type: "DOCUMENT_ISSUE",
        severity: "medium",
        description: "Name mismatch between PAN, Aadhaar, and rent agreement",
        action: "Ensure exact same spelling of name across all documents, get corrections done BEFORE applying",
        urgency: "immediate"
      },
      {
        type: "DELAY",
        severity: "medium",
        description: "Eating House License takes 30-60 days",
        action: "Can do soft launch with other licenses, apply for Eating House early",
        urgency: "soon"
      }
    ],
    preventiveMeasures: [
      "Visit premises with architect before signing lease to identify structural issues",
      "Get all document name mismatches corrected proactively",
      "Maintain a compliance calendar with renewal dates",
      "Keep digital copies of all documents in cloud storage",
      "Build relationship with local officials through proper channels"
    ]
  },

  outputs: {
    visitPlan: {
      summary: {
        totalVisitsRequired: 8,
        estimatedDays: 5,
        officesInvolved: [
          "GST Seva Kendra (if physical verification needed)",
          "FSSAI State Office, Gandhinagar",
          "Gujarat Fire Services, Ahmedabad",
          "Labour Commissioner Office",
          "AMC Health Department, Danapith",
          "Police Commissioner Office"
        ],
        onlineOnlyItems: ["GST Registration", "Shop & Establishment", "FSSAI Application"],
        optimizationSavings: "Running parallel applications saves 25-30 days"
      },
      visitPlan: [
        {
          day: 1,
          date: "Day 1-3",
          dayType: "Preparation",
          theme: "Document Collection Day",
          visits: [
            {
              visitId: "v1",
              office: "Architect Office",
              purpose: "Get floor plan, fire safety plan, kitchen layout",
              priority: "high",
              arrivalTime: "10:00 AM",
              expectedDuration: "2 hours",
              documentsToCarry: {
                originals: ["Rent Agreement"],
                copies: ["Premises photos with measurements"]
              },
              tips: ["Bring photos of premises from all angles", "Discuss fire exit requirements"]
            },
            {
              visitId: "v2",
              office: "Notary/Sub-Registrar",
              purpose: "Register rent agreement, get NOC notarized",
              priority: "high",
              arrivalTime: "3:00 PM",
              expectedDuration: "1-2 hours",
              documentsToCarry: {
                originals: ["Rent Agreement", "NOC from Landlord", "Landlord Aadhaar"],
                copies: ["2 sets of all documents"]
              },
              tips: ["Carry Rs 100 stamp paper for NOC", "Both landlord and tenant must be present"]
            }
          ],
          dayEndGoal: "All base documents ready for applications"
        },
        {
          day: 2,
          date: "Day 4-7",
          dayType: "Applications",
          theme: "Online Application Day",
          visits: [
            {
              visitId: "v3",
              office: "Online - GST Portal",
              purpose: "Submit GST registration application",
              priority: "critical",
              arrivalTime: "Work from home",
              expectedDuration: "1-2 hours",
              documentsToCarry: {
                copies: ["PAN, Aadhaar, Rent Agreement, Bank Statement - all digital"]
              },
              tips: ["Keep mobile handy for OTP", "Save ARN number immediately"]
            },
            {
              visitId: "v4",
              office: "Online - Gujarat Labour Portal",
              purpose: "Apply for Shop & Establishment",
              priority: "high",
              arrivalTime: "After GST",
              expectedDuration: "30 mins",
              tips: ["Fully online, no visit required"]
            }
          ],
          dayEndGoal: "GST and Shop & Establishment applications submitted"
        },
        {
          day: 3,
          date: "Day 8-10",
          dayType: "Critical Visits",
          theme: "Fire NOC Day",
          visits: [
            {
              visitId: "v5",
              office: "Gujarat Fire Services, Ahmedabad",
              purpose: "Submit Fire NOC application",
              priority: "critical",
              arrivalTime: "9:30 AM (before 10 AM)",
              expectedDuration: "2-3 hours",
              location: {
                address: "Fire & Emergency Services, Nr. Paldi Cross Roads, Ahmedabad",
                parking: "Street parking available",
                googleMapsUrl: "https://maps.google.com/?q=Gujarat+Fire+Services+Ahmedabad"
              },
              timing: {
                officeOpens: "10:30 AM",
                tokenWindow: "10:30 AM - 1:00 PM",
                lunchBreak: "1:00 PM - 2:00 PM",
                recommendation: "Arrive 30 mins early for token"
              },
              documentsToCarry: {
                originals: ["Floor Plan", "Fire Safety Plan", "OC Copy"],
                copies: ["3 sets of all documents", "GST Certificate"],
                photos: "5 passport size photos",
                fees: "DD/Cheque for Rs 3500"
              },
              tips: [
                "Install fire safety equipment BEFORE inspection date",
                "Ensure emergency exit signage is clearly visible",
                "Fire extinguisher expiry must be valid for 1 year"
              ],
              possibleOutcomes: [
                "Application accepted - inspection scheduled",
                "Documents incomplete - return with missing items",
                "Site inspection scheduled within 15 days"
              ],
              backupPlan: "If queue is long, come back at 2 PM after lunch"
            }
          ],
          dayEndGoal: "Fire NOC application submitted with inspection date"
        },
        {
          day: 4,
          date: "Day 8-15",
          dayType: "FSSAI",
          theme: "Food License Day",
          visits: [
            {
              visitId: "v6",
              office: "Online - FoSCoS Portal + FSSAI Office if needed",
              purpose: "Apply for FSSAI State License",
              priority: "high",
              arrivalTime: "Apply online, visit only if verification needed",
              documentsToCarry: {
                copies: ["All business documents, Food Handler Certificate, Water Test Report"]
              },
              tips: [
                "Online application at foscos.fssai.gov.in",
                "Food Safety Officer may call for inspection",
                "Keep kitchen ready for surprise inspection"
              ]
            }
          ],
          dayEndGoal: "FSSAI application submitted"
        },
        {
          day: 5,
          date: "Day 20-35",
          dayType: "Health License",
          theme: "AMC Health License Day",
          visits: [
            {
              visitId: "v7",
              office: "AMC Health Department, Danapith",
              purpose: "Apply for Health Trade License",
              priority: "high",
              arrivalTime: "10:00 AM",
              expectedDuration: "3-4 hours",
              location: {
                address: "AMC Health Dept, Danapith, Ahmedabad",
                landmark: "Near Danapith Crossing"
              },
              timing: {
                officeOpens: "10:30 AM",
                tokenWindow: "10:30 AM - 12:30 PM",
                recommendation: "Reach by 10 AM for early token"
              },
              documentsToCarry: {
                originals: ["FSSAI License", "Fire NOC", "Rent Agreement"],
                copies: ["All licenses received so far", "Water test report"],
                fees: "Rs 3000 by DD/Cheque"
              },
              tips: [
                "Health inspector will schedule surprise visit",
                "Keep kitchen impeccably clean",
                "Staff should have medical certificates ready"
              ]
            }
          ],
          dayEndGoal: "AMC Health License application submitted"
        }
      ],
      optimizationTips: [
        "Run FSSAI, Fire NOC, and Shop & Establishment in parallel after GST",
        "Use consultant for Fire NOC - saves multiple visits",
        "Apply through official portals to avoid middlemen",
        "Keep buffer of 1 week for unexpected delays"
      ]
    } as VisitPlanData,

    reminders: [
      "Day 7: Follow up on GST ARN status",
      "Day 14: Check Fire NOC inspection date",
      "Day 21: FSSAI inspection preparation",
      "Day 30: AMC Health License follow-up",
      "Day 45: Eating House License status check",
      "Annual: Renew FSSAI, Health License, Eating House License"
    ],

    // Expert Advice - structured for FinalReport ExpertPerspective[]
    expertAdvice: {
      perspectives: [
        {
          role: "Chartered Accountant",
          advice: "Register for GST Composition Scheme if turnover will be under Rs 1.5 Cr - simpler compliance and lower tax rate of 5%. Keep all purchase invoices for input credit on equipment. File GST returns quarterly instead of monthly to save time."
        },
        {
          role: "Business Lawyer", 
          advice: "Get rent agreement reviewed - ensure it permits 'restaurant/food business' use, has clear exit clause, and specifies who bears cost of structural modifications. Get landlord's OC verification in writing. Consider trademark registration for your restaurant name early."
        },
        {
          role: "Restaurant Owner (15 years experience)",
          advice: "Pro tip: Start Fire NOC process on Day 1 - it's always the bottleneck. Keep Rs 50,000 buffer for unexpected compliance costs. Build relationship with ward officer - they can expedite many things. Don't skimp on fire safety equipment - it pays off during inspections."
        },
        {
          role: "Food Safety Consultant",
          advice: "Get FOSTAC training done for at least 2 staff members, not just one. This provides backup. Keep your water testing reports updated every 6 months. Install a pest control log book at the entrance - inspectors love documentation."
        }
      ],
      recommendation: "Based on our analysis, we recommend starting with GST and Fire NOC applications simultaneously. Hire a local consultant familiar with AMC procedures - the Rs 15-20K investment typically saves 2-3 weeks and multiple failed visits."
    },

    // State Comparison - structured for FinalReport StateComparisonData
    stateComparison: {
      states: [
        {
          state: "Gujarat",
          totalDays: { min: 45, max: 65 },
          totalCost: 65000,
          complexity: 6,
          advantages: [
            "Online portals available for most licenses",
            "No liquor licensing complexity (dry state)",
            "RTPS Act ensures time-bound delivery",
            "AMC has dedicated help desk for restaurants"
          ],
          disadvantages: [
            "Fire NOC process is slow (25-45 days)",
            "Eating House License requires police verification",
            "No alcohol revenue means tighter margins"
          ]
        },
        {
          state: "Maharashtra",
          totalDays: { min: 60, max: 90 },
          totalCost: 85000,
          complexity: 8,
          advantages: [
            "Liquor license possible (additional revenue)",
            "Well-documented processes",
            "Multiple consultants available"
          ],
          disadvantages: [
            "Gumasta License adds extra step",
            "BMC procedures are complex",
            "Higher official fees",
            "More inspections required"
          ]
        },
        {
          state: "Karnataka",
          totalDays: { min: 30, max: 50 },
          totalCost: 70000,
          complexity: 7,
          advantages: [
            "Fastest digital processing in India",
            "Single-window clearance available",
            "BBMP has streamlined restaurant licensing"
          ],
          disadvantages: [
            "Stricter zoning requirements",
            "Higher property costs",
            "Language barrier in some offices"
          ]
        }
      ],
      recommendation: "Gujarat offers a balanced approach with moderate complexity. If speed is priority, consider Karnataka. If you want liquor service, Maharashtra is the only option among these three."
    },

    // What-If Scenarios - structured for FinalReport WhatIfData
    whatIf: {
      scenarios: [
        {
          scenario: "What if Fire NOC is rejected?",
          probability: 0.15,
          impact: "High - delays opening by 30-45 days",
          mitigation: "Ensure building has valid OC before signing lease. Pre-inspect with a fire safety consultant.",
          outcomes: [
            { outcome: "Fix issues and reapply", probability: 0.7, action: "Address specific rejection points, reapply within 15 days" },
            { outcome: "Appeal to Chief Fire Officer", probability: 0.2, action: "File formal appeal with rectification proof" },
            { outcome: "Change premises", probability: 0.1, action: "Find new location with valid OC - last resort" }
          ]
        },
        {
          scenario: "What if FSSAI inspection fails?",
          probability: 0.20,
          impact: "Medium - delays by 15-20 days",
          mitigation: "Keep kitchen spotless, ensure water testing is current, have all staff medical certificates ready.",
          outcomes: [
            { outcome: "Rectify and request re-inspection", probability: 0.8, action: "Fix hygiene issues, apply for re-inspection within 7 days" },
            { outcome: "Hire food safety consultant", probability: 0.15, action: "Get professional help to ensure compliance" },
            { outcome: "Escalate via FSSAI grievance", probability: 0.05, action: "If inspection was unfair, file formal complaint" }
          ]
        },
        {
          scenario: "What if landlord withdraws NOC?",
          probability: 0.05,
          impact: "Critical - all licenses at risk",
          mitigation: "Get NOC notarized on stamp paper with clear terms. Include penalty clause in rent agreement.",
          outcomes: [
            { outcome: "Negotiate with landlord", probability: 0.5, action: "Understand concerns, offer solutions" },
            { outcome: "Legal notice", probability: 0.3, action: "Send legal notice citing registered agreement" },
            { outcome: "Find new premises", probability: 0.2, action: "Start fresh - costly but sometimes necessary" }
          ]
        },
        {
          scenario: "What if bribe is demanded?",
          probability: 0.25,
          impact: "Medium - ethical and legal risk",
          mitigation: "Apply through official portals, maintain paper trail, know RTI process.",
          outcomes: [
            { outcome: "Refuse and escalate", probability: 0.6, action: "File complaint on state anti-corruption portal" },
            { outcome: "Request official receipt", probability: 0.25, action: "Ask for official challan - usually stops demand" },
            { outcome: "File RTI for status", probability: 0.15, action: "RTI creates paper trail and expedites legitimate processing" }
          ]
        },
        {
          scenario: "What if health inspector doesn't visit?",
          probability: 0.30,
          impact: "Low-Medium - delays by 10-15 days",
          mitigation: "Follow up weekly via official channels. Keep premises ready for surprise visit anytime.",
          outcomes: [
            { outcome: "Follow up at AMC office", probability: 0.5, action: "Visit health department, request inspection date" },
            { outcome: "File RTPS complaint", probability: 0.3, action: "Under Right to Service Act, demand time-bound action" },
            { outcome: "Escalate to Zonal Officer", probability: 0.2, action: "Request senior officer intervention" }
          ]
        }
      ],
      recommendation: "Most scenarios are manageable with proper preparation. The key is to verify building OC before signing lease - this prevents the most critical failure mode. Budget 20% extra time for unexpected delays."
    }
  },

  drafts: [
    {
      kind: "RTI",
      title: "RTI for Fire NOC Status",
      body: `To,
The Public Information Officer,
Gujarat Fire & Emergency Services,
Ahmedabad

Subject: Application under Right to Information Act, 2005

Respected Sir/Madam,

I, [Your Name], have submitted an application for Fire NOC for my restaurant premises at [Address] on [Date]. The application number is [Application Number].

Under the RTI Act, 2005, I request the following information:

1. Current status of my Fire NOC application
2. Scheduled inspection date, if any
3. If inspection is complete, the findings report
4. Expected date of NOC issuance
5. Name and contact of the officer handling my file

I am depositing the prescribed fee of Rs. 10/- via [Payment Mode].

Thanking you,
[Your Name]
[Contact Number]
[Email]
[Date]`
    },
    {
      kind: "GRIEVANCE",
      title: "Grievance for Delayed Health License",
      body: `To,
The Municipal Commissioner,
Ahmedabad Municipal Corporation

Subject: Grievance regarding delayed Health Trade License - Application No: [Number]

Respected Sir/Madam,

I submitted my Health Trade License application on [Date] at your Danapith office. Despite submitting all required documents and the prescribed fee, I have not received any update for [X] days.

I have made multiple visits to the office and called the helpline, but have not received satisfactory response.

As per the Gujarat Right to Public Services Act, the Health Trade License should be issued within 21 working days. This delay is causing significant business loss.

I request your urgent intervention to:
1. Expedite the processing of my application
2. Provide a definite timeline for license issuance
3. Take action against the delay as per RTPS Act

Details:
- Application Number: [Number]
- Submission Date: [Date]
- Premises Address: [Address]
- Contact: [Phone/Email]

Thanking you,
[Your Name]
[Date]`
    },
    {
      kind: "APPEAL",
      title: "Appeal Against Fire NOC Rejection",
      body: `To,
The Chief Fire Officer,
Gujarat Fire & Emergency Services,
Gandhinagar

Subject: Appeal against rejection of Fire NOC - Application No: [Number]

Respected Sir,

My Fire NOC application was rejected on [Date] citing [Reason given]. I respectfully submit this appeal with the following grounds:

1. [Address each rejection point with your response]
2. I have now rectified the issue by [Action taken]
3. Supporting documents attached: [List documents]

I request a re-inspection of my premises at your earliest convenience. I assure full compliance with all fire safety norms.

The rejection is causing delay in my restaurant opening, resulting in financial loss and employee hardship.

Request:
1. Schedule fresh inspection within 7 days
2. Provide specific checklist of any remaining requirements
3. Consider expedited processing given full compliance

Attachments:
1. Original rejection letter
2. [Compliance documents]
3. [Photos showing rectification]

Thanking you,
[Your Name]
[Date]`
    }
  ] as GeneratedDraft[],

  meta: {
    generatedAt: new Date().toISOString(),
    source: "demo",
    version: "1.0",
    confidence: 0.95
  }
};

// ============================================================================
// DEMO DEBATE MESSAGES - Pre-scripted agent "conversation"
// ============================================================================
export const DEMO_DEBATE_MESSAGES: DebateMessage[] = [
  {
    id: "debate-1",
    timestamp: Date.now(),
    fromAgent: "intent_decoder",
    fromDisplayName: "Intent Decoder",
    fromTier: "intake" as Tier,
    type: "observation",
    content: "Clear intent detected: User wants to START a dine-in restaurant business in Ahmedabad, Gujarat. 50 seats capacity indicates medium-scale operation requiring full licensing.",
    confidence: 0.96
  },
  {
    id: "debate-2",
    timestamp: Date.now() + 500,
    fromAgent: "location_intelligence",
    fromDisplayName: "Location Intel",
    fromTier: "intake" as Tier,
    type: "insight",
    content: "Gujarat location confirmed. Key insight: Gujarat is a DRY STATE - no liquor license possible. AMC (Ahmedabad Municipal Corporation) jurisdiction applies. Found 5 location-specific rules.",
    confidence: 0.94
  },
  {
    id: "debate-3",
    timestamp: Date.now() + 1200,
    fromAgent: "business_classifier",
    fromDisplayName: "Business Classifier",
    fromTier: "intake" as Tier,
    type: "observation",
    content: "Classified as: Dine-in Restaurant, Gujarati Thali specialty. Category requires 7 licenses including FSSAI State License (turnover > 12L expected), Fire NOC (50 seats > 30 threshold), and Eating House License.",
    confidence: 0.93
  },
  {
    id: "debate-4",
    timestamp: Date.now() + 2000,
    fromAgent: "regulation_librarian",
    fromDisplayName: "Regulation Librarian",
    fromTier: "research" as Tier,
    type: "insight",
    content: "Cross-referenced 4 acts: FSSAI Act 2006, Gujarat Shops & Establishment Act 1948, Gujarat Fire Prevention Act, and Police Act for Eating House. All requirements mapped to document checklist.",
    confidence: 0.91
  },
  {
    id: "debate-5",
    timestamp: Date.now() + 2800,
    fromAgent: "risk_assessor",
    fromDisplayName: "Risk Assessor",
    fromTier: "strategy" as Tier,
    type: "warning",
    content: "HIGH RISK ALERT: Fire NOC is the #1 bottleneck in Gujarat restaurant licensing. Average delay is 15 days beyond official timeline. Building OC (Occupancy Certificate) is critical - verify BEFORE signing lease!",
    confidence: 0.89
  },
  {
    id: "debate-6",
    timestamp: Date.now() + 3500,
    fromAgent: "timeline_architect",
    fromDisplayName: "Timeline Architect",
    fromTier: "strategy" as Tier,
    type: "agreement",
    referencesAgent: "risk_assessor",
    referencesAgentName: "Risk Assessor",
    content: "Agree with Risk Assessor. Adjusting timeline to prioritize Fire NOC. Recommending parallel execution: FSSAI + Fire NOC + Shop & Est can run simultaneously after GST. This saves 25-30 days.",
    confidence: 0.92
  },
  {
    id: "debate-7",
    timestamp: Date.now() + 4200,
    fromAgent: "cost_calculator",
    fromDisplayName: "Cost Calculator",
    fromTier: "strategy" as Tier,
    type: "insight",
    content: "Cost analysis complete. Official fees: Rs 20,200. BUT practical budget should be Rs 45,000-85,000 including consultant fees, architect, fire equipment, and buffer for unexpected expenses.",
    confidence: 0.90
  },
  {
    id: "debate-8",
    timestamp: Date.now() + 5000,
    fromAgent: "parallel_optimizer",
    fromDisplayName: "Parallel Optimizer",
    fromTier: "strategy" as Tier,
    type: "suggestion",
    content: "Optimization opportunity found! Running 3 applications in parallel (FSSAI, Fire NOC, Shop & Est) after GST reduces total timeline from 90 days to ~55-60 days. Created parallel execution plan.",
    confidence: 0.93
  },
  {
    id: "debate-9",
    timestamp: Date.now() + 5800,
    fromAgent: "visit_planner",
    fromDisplayName: "Visit Planner",
    fromTier: "execution" as Tier,
    type: "observation",
    content: "Optimized visit schedule created. 8 total visits over 5 strategic days. Key tip: Fire Services office opens at 10:30 AM - arrive by 10 AM for early token. GST and Shop & Est are fully online.",
    confidence: 0.91
  },
  {
    id: "debate-10",
    timestamp: Date.now() + 6500,
    fromAgent: "corruption_detector",
    fromDisplayName: "Corruption Detector",
    fromTier: "intelligence" as Tier,
    type: "warning",
    content: "Moderate corruption risk detected (6.5/10). Fire NOC and Health License inspections are common pressure points. Recommendation: Apply through official portals, maintain written records, know RTI escalation path.",
    confidence: 0.87
  },
  {
    id: "debate-11",
    timestamp: Date.now() + 7200,
    fromAgent: "rti_drafter",
    fromDisplayName: "RTI Drafter",
    fromTier: "document" as Tier,
    type: "observation",
    content: "Pre-drafted RTI templates for Fire NOC delay, Health License status, and general grievance. These are ready to use if any application gets stuck beyond official timelines.",
    confidence: 0.94
  },
  {
    id: "debate-12",
    timestamp: Date.now() + 8000,
    fromAgent: "expert_simulator",
    fromDisplayName: "Expert Simulator",
    fromTier: "intelligence" as Tier,
    type: "consensus",
    content: "All agents aligned. Final recommendation: Start Fire NOC on Day 1, use parallel execution, budget Rs 60K minimum, verify building OC before lease. Expected completion: 55-65 days with our optimized plan.",
    confidence: 0.95
  }
];

// ============================================================================
// DEMO SSE EVENTS - Simulate streaming with realistic timing
// ============================================================================
export interface DemoSSEEvent {
  type: "meta" | "event" | "debate" | "typing" | "complete" | "error";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // Flexible to support DebateMessage, event data, etc.
  delay: number; // ms from start
}

export const DEMO_SSE_EVENTS: DemoSSEEvent[] = [
  // Meta event - stream started
  { type: "meta", data: { sessionId: "demo-session", timestamp: Date.now() }, delay: 0 },
  
  // Intake Battalion
  { type: "typing", data: { agentId: "intent_decoder", agentName: "Intent Decoder", isTyping: true }, delay: 200 },
  { type: "event", data: { author: "intent-decoder", text: "Analyzing query intent: START_BUSINESS detected with high confidence", timestamp: Date.now() }, delay: 800 },
  { type: "debate", data: DEMO_DEBATE_MESSAGES[0], delay: 1200 },
  { type: "typing", data: { agentId: "intent_decoder", agentName: "Intent Decoder", isTyping: false }, delay: 1400 },
  
  { type: "typing", data: { agentId: "location_intelligence", agentName: "Location Intel", isTyping: true }, delay: 1500 },
  { type: "event", data: { author: "location-intelligence", text: "Gujarat location identified. Checking state-specific regulations...", timestamp: Date.now() }, delay: 2000 },
  { type: "debate", data: DEMO_DEBATE_MESSAGES[1], delay: 2500 },
  { type: "typing", data: { agentId: "location_intelligence", agentName: "Location Intel", isTyping: false }, delay: 2700 },
  
  { type: "typing", data: { agentId: "business_classifier", agentName: "Business Classifier", isTyping: true }, delay: 2800 },
  { type: "event", data: { author: "business-classifier", text: "Restaurant classified as Dine-in, Gujarati Thali. 7 licenses required.", timestamp: Date.now() }, delay: 3500 },
  { type: "debate", data: DEMO_DEBATE_MESSAGES[2], delay: 4000 },
  { type: "typing", data: { agentId: "business_classifier", agentName: "Business Classifier", isTyping: false }, delay: 4200 },

  { type: "typing", data: { agentId: "scale_analyzer", agentName: "Scale Analyzer", isTyping: true }, delay: 4300 },
  { type: "event", data: { author: "scale-analyzer", text: "50 seats = medium scale. FSSAI State License tier confirmed.", timestamp: Date.now() }, delay: 4800 },
  { type: "typing", data: { agentId: "scale_analyzer", agentName: "Scale Analyzer", isTyping: false }, delay: 5000 },

  // Research Battalion
  { type: "typing", data: { agentId: "regulation_librarian", agentName: "Regulation Librarian", isTyping: true }, delay: 5100 },
  { type: "event", data: { author: "regulation-librarian", text: "Cross-referencing FSSAI Act, Gujarat Shop & Establishment Act, Fire Prevention Act...", timestamp: Date.now() }, delay: 6000 },
  { type: "debate", data: DEMO_DEBATE_MESSAGES[3], delay: 6500 },
  { type: "typing", data: { agentId: "regulation_librarian", agentName: "Regulation Librarian", isTyping: false }, delay: 6700 },

  { type: "typing", data: { agentId: "policy_scout", agentName: "Policy Scout", isTyping: true }, delay: 6800 },
  { type: "event", data: { author: "policy-scout", text: "Recent policy update: AMC online portal now available for Health License", timestamp: Date.now() }, delay: 7500 },
  { type: "typing", data: { agentId: "policy_scout", agentName: "Policy Scout", isTyping: false }, delay: 7700 },

  { type: "typing", data: { agentId: "document_detective", agentName: "Document Detective", isTyping: true }, delay: 7800 },
  { type: "event", data: { author: "document-detective", text: "Building comprehensive document checklist: 5 categories, 20+ documents identified", timestamp: Date.now() }, delay: 8500 },
  { type: "typing", data: { agentId: "document_detective", agentName: "Document Detective", isTyping: false }, delay: 8700 },

  { type: "typing", data: { agentId: "department_mapper", agentName: "Department Mapper", isTyping: true }, delay: 8800 },
  { type: "event", data: { author: "department-mapper", text: "Mapped 6 departments: FSSAI, Fire Services, AMC Health, Labour Dept, Police, Town Planning", timestamp: Date.now() }, delay: 9500 },
  { type: "typing", data: { agentId: "department_mapper", agentName: "Department Mapper", isTyping: false }, delay: 9700 },

  // Strategy Battalion
  { type: "typing", data: { agentId: "risk_assessor", agentName: "Risk Assessor", isTyping: true }, delay: 9800 },
  { type: "event", data: { author: "risk-assessor", text: "HIGH RISK DETECTED: Fire NOC is primary bottleneck. Checking building OC status critical!", timestamp: Date.now() }, delay: 10500 },
  { type: "debate", data: DEMO_DEBATE_MESSAGES[4], delay: 11000 },
  { type: "typing", data: { agentId: "risk_assessor", agentName: "Risk Assessor", isTyping: false }, delay: 11200 },

  { type: "typing", data: { agentId: "timeline_architect", agentName: "Timeline Architect", isTyping: true }, delay: 11300 },
  { type: "event", data: { author: "timeline-architect", text: "Building optimized timeline with parallel execution paths...", timestamp: Date.now() }, delay: 12000 },
  { type: "debate", data: DEMO_DEBATE_MESSAGES[5], delay: 12500 },
  { type: "typing", data: { agentId: "timeline_architect", agentName: "Timeline Architect", isTyping: false }, delay: 12700 },

  { type: "typing", data: { agentId: "cost_calculator", agentName: "Cost Calculator", isTyping: true }, delay: 12800 },
  { type: "event", data: { author: "cost-calculator", text: "Calculating costs: Official Rs 20,200 + Practical Rs 25-65K = Total Rs 45-85K", timestamp: Date.now() }, delay: 13500 },
  { type: "debate", data: DEMO_DEBATE_MESSAGES[6], delay: 14000 },
  { type: "typing", data: { agentId: "cost_calculator", agentName: "Cost Calculator", isTyping: false }, delay: 14200 },

  { type: "typing", data: { agentId: "parallel_optimizer", agentName: "Parallel Optimizer", isTyping: true }, delay: 14300 },
  { type: "event", data: { author: "parallel-optimizer", text: "OPTIMIZATION: Parallel execution saves 25-30 days!", timestamp: Date.now() }, delay: 15000 },
  { type: "debate", data: DEMO_DEBATE_MESSAGES[7], delay: 15500 },
  { type: "typing", data: { agentId: "parallel_optimizer", agentName: "Parallel Optimizer", isTyping: false }, delay: 15700 },

  { type: "typing", data: { agentId: "dependency_builder", agentName: "Dependency Builder", isTyping: true }, delay: 15800 },
  { type: "event", data: { author: "dependency-builder", text: "Built dependency graph: 8 nodes, critical path identified", timestamp: Date.now() }, delay: 16300 },
  { type: "typing", data: { agentId: "dependency_builder", agentName: "Dependency Builder", isTyping: false }, delay: 16500 },

  // Document Battalion
  { type: "typing", data: { agentId: "form_wizard", agentName: "Form Wizard", isTyping: true }, delay: 16600 },
  { type: "event", data: { author: "form-wizard", text: "Preparing form guides for all 7 license applications...", timestamp: Date.now() }, delay: 17200 },
  { type: "typing", data: { agentId: "form_wizard", agentName: "Form Wizard", isTyping: false }, delay: 17400 },

  { type: "typing", data: { agentId: "document_validator", agentName: "Document Validator", isTyping: true }, delay: 17500 },
  { type: "event", data: { author: "document-validator", text: "Document validation checklist ready. 20+ items with specifications.", timestamp: Date.now() }, delay: 18100 },
  { type: "typing", data: { agentId: "document_validator", agentName: "Document Validator", isTyping: false }, delay: 18300 },

  { type: "typing", data: { agentId: "rti_drafter", agentName: "RTI Drafter", isTyping: true }, delay: 18400 },
  { type: "event", data: { author: "rti-drafter", text: "Pre-drafted RTI templates for Fire NOC, Health License delays", timestamp: Date.now() }, delay: 19000 },
  { type: "debate", data: DEMO_DEBATE_MESSAGES[10], delay: 19500 },
  { type: "typing", data: { agentId: "rti_drafter", agentName: "RTI Drafter", isTyping: false }, delay: 19700 },

  { type: "typing", data: { agentId: "grievance_writer", agentName: "Grievance Writer", isTyping: true }, delay: 19800 },
  { type: "event", data: { author: "grievance-writer", text: "Grievance letter template ready for escalation if needed", timestamp: Date.now() }, delay: 20300 },
  { type: "typing", data: { agentId: "grievance_writer", agentName: "Grievance Writer", isTyping: false }, delay: 20500 },

  { type: "typing", data: { agentId: "appeal_crafter", agentName: "Appeal Crafter", isTyping: true }, delay: 20600 },
  { type: "event", data: { author: "appeal-crafter", text: "Appeal templates drafted for potential rejection scenarios", timestamp: Date.now() }, delay: 21100 },
  { type: "typing", data: { agentId: "appeal_crafter", agentName: "Appeal Crafter", isTyping: false }, delay: 21300 },

  // Execution Battalion
  { type: "typing", data: { agentId: "visit_planner", agentName: "Visit Planner", isTyping: true }, delay: 21400 },
  { type: "event", data: { author: "visit-planner", text: "Optimized visit schedule: 8 visits over 5 strategic days", timestamp: Date.now() }, delay: 22100 },
  { type: "debate", data: DEMO_DEBATE_MESSAGES[8], delay: 22600 },
  { type: "typing", data: { agentId: "visit_planner", agentName: "Visit Planner", isTyping: false }, delay: 22800 },

  { type: "typing", data: { agentId: "reminder_engine", agentName: "Reminder Engine", isTyping: true }, delay: 22900 },
  { type: "event", data: { author: "reminder-engine", text: "Created 6 key reminders for follow-ups and renewals", timestamp: Date.now() }, delay: 23400 },
  { type: "typing", data: { agentId: "reminder_engine", agentName: "Reminder Engine", isTyping: false }, delay: 23600 },

  { type: "typing", data: { agentId: "status_tracker", agentName: "Status Tracker", isTyping: true }, delay: 23700 },
  { type: "event", data: { author: "status-tracker", text: "Status tracking framework established for all applications", timestamp: Date.now() }, delay: 24200 },
  { type: "typing", data: { agentId: "status_tracker", agentName: "Status Tracker", isTyping: false }, delay: 24400 },

  // Intelligence Battalion
  { type: "typing", data: { agentId: "corruption_detector", agentName: "Corruption Detector", isTyping: true }, delay: 24500 },
  { type: "event", data: { author: "corruption-detector", text: "Risk assessment: 6.5/10. Key pressure points identified with mitigation strategies", timestamp: Date.now() }, delay: 25200 },
  { type: "debate", data: DEMO_DEBATE_MESSAGES[9], delay: 25700 },
  { type: "typing", data: { agentId: "corruption_detector", agentName: "Corruption Detector", isTyping: false }, delay: 25900 },

  { type: "typing", data: { agentId: "comparison_agent", agentName: "Comparison Agent", isTyping: true }, delay: 26000 },
  { type: "event", data: { author: "comparison-agent", text: "Compared Gujarat with Maharashtra and Karnataka - Gujarat is moderately restaurant-friendly", timestamp: Date.now() }, delay: 26600 },
  { type: "typing", data: { agentId: "comparison_agent", agentName: "Comparison Agent", isTyping: false }, delay: 26800 },

  { type: "typing", data: { agentId: "whatif_simulator", agentName: "What-If Simulator", isTyping: true }, delay: 26900 },
  { type: "event", data: { author: "whatif-simulator", text: "Simulated delay scenarios: Added buffer recommendations to timeline", timestamp: Date.now() }, delay: 27500 },
  { type: "typing", data: { agentId: "whatif_simulator", agentName: "What-If Simulator", isTyping: false }, delay: 27700 },

  { type: "typing", data: { agentId: "expert_simulator", agentName: "Expert Simulator", isTyping: true }, delay: 27800 },
  { type: "event", data: { author: "expert-simulator", text: "Generated expert advice from CA, Lawyer, and Restaurant Owner perspectives", timestamp: Date.now() }, delay: 28500 },
  { type: "debate", data: DEMO_DEBATE_MESSAGES[11], delay: 29000 },
  { type: "typing", data: { agentId: "expert_simulator", agentName: "Expert Simulator", isTyping: false }, delay: 29200 },

  // Final Compiler
  { type: "typing", data: { agentId: "final_compiler", agentName: "Final Compiler", isTyping: true }, delay: 29300 },
  { type: "event", data: { author: "final-compiler", text: "Compiling final report with all agent outputs...", timestamp: Date.now() }, delay: 30000 },
  { type: "typing", data: { agentId: "final_compiler", agentName: "Final Compiler", isTyping: false }, delay: 30500 },

  // Complete
  { type: "complete", data: { result: DEMO_RESULT }, delay: 31000 }
];

// ============================================================================
// HELPER: Get delay for event type (for realistic timing)
// ============================================================================
export function getDemoEventDelay(eventType: string): number {
  switch (eventType) {
    case "meta": return 0;
    case "typing": return 200;
    case "event": return 600;
    case "debate": return 400;
    case "complete": return 500;
    default: return 300;
  }
}

// ============================================================================
// Check if this is user's first visit (for auto-demo)
// ============================================================================
export function isFirstVisit(): boolean {
  if (typeof window === "undefined") return false;
  const visited = localStorage.getItem("bb_visited");
  return !visited;
}

export function markAsVisited(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("bb_visited", "true");
}

export function resetFirstVisit(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("bb_visited");
}

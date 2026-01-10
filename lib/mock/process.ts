import type { ProcessPreview } from "@/types";

export const mockProcess: ProcessPreview = {
  id: "demo",
  title: "Open a café in Ahmedabad",
  location: "Ahmedabad, Gujarat",
  steps: [
    { id: "s1", title: "Confirm property zoning + occupancy certificate", owner: "Citizen", eta: "1–3 days", status: "in_progress" },
    { id: "s2", title: "Register business (PAN + GST)", owner: "CA / Citizen", eta: "3–7 days", status: "pending" },
    { id: "s3", title: "Apply: Shop & Establishment", owner: "Citizen", eta: "5–10 days", status: "pending" },
    { id: "s4", title: "Apply: FSSAI registration", owner: "Citizen", eta: "7–15 days", status: "pending" },
    { id: "s5", title: "Fire safety NOC (if applicable)", owner: "Citizen", eta: "10–30 days", status: "blocked", notes: "Needs OC + floor plan" },
  ],
  costs: [
    { id: "c1", label: "FSSAI fee", amountINR: 2000, note: "Varies by category" },
    { id: "c2", label: "Shop & Establishment", amountINR: 1500 },
    { id: "c3", label: "Professional services", amountINR: 12000, note: "Optional (CA/consultant)" },
    { id: "c4", label: "Local trade license", amountINR: 5000, note: "Municipality dependent" },
  ],
  risks: [
    { id: "r1", title: "Zoning mismatch", severity: "high", mitigation: "Verify land-use and allowed activity before lease." },
    { id: "r2", title: "Missing occupancy certificate", severity: "high", mitigation: "Ask owner for OC; plan alternate property if absent." },
    { id: "r3", title: "Inspection delays", severity: "medium", mitigation: "Book visits early; keep photocopies + originals ready." },
  ],
  documents: [
    { id: "d1", title: "Aadhaar + PAN (owner/partner)" },
    { id: "d2", title: "Rent agreement / ownership proof" },
    { id: "d3", title: "NOC from landlord", optional: true },
    { id: "d4", title: "Floor plan + site photos" },
    { id: "d5", title: "Water test / hygiene plan", optional: true },
  ],
};


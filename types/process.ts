export type ProcessStepStatus = "pending" | "in_progress" | "done" | "blocked";

export type ProcessStep = {
  id: string;
  title: string;
  owner: string;
  eta: string;
  status: ProcessStepStatus;
  notes?: string;
};

export type ProcessCostItem = {
  id: string;
  label: string;
  amountINR: number;
  note?: string;
};

export type ProcessRisk = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  mitigation: string;
};

export type ProcessPreview = {
  id: string;
  title: string;
  location: string;
  steps: ProcessStep[];
  costs: ProcessCostItem[];
  risks: ProcessRisk[];
  documents: Array<{ id: string; title: string; optional?: boolean }>;
};


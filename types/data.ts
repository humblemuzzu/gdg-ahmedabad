export type CurrencyINR = number;

export type Tier =
  | "intake"
  | "research"
  | "strategy"
  | "document"
  | "execution"
  | "intelligence";

export interface TimelineEstimateDays {
  min: number;
  max: number;
  avg: number;
}

export interface FeeEstimateINR {
  base?: CurrencyINR;
  annual?: CurrencyINR;
  renewal?: CurrencyINR;
  notes?: string;
}

export interface KnowledgeSourceRef {
  label: string;
  url?: string;
  note?: string;
}

export interface LicenseRequirement {
  id: string;
  name: string;
  authority?: string;
  onlinePortal?: string;
  timelineDays?: TimelineEstimateDays;
  feesInr?: FeeEstimateINR;
  documents?: string[];
  prerequisites?: string[];
  steps?: string[];
  tips?: string[];
  sources?: KnowledgeSourceRef[];
}

export interface BusinessSubType {
  id: string;
  name: string;
  notes?: string;
}

export interface BusinessType {
  id: string;
  name: string;
  subTypes: BusinessSubType[];
  defaultLicenses: string[];
  conditionalLicenses?: Record<string, string[]>;
  scaleThresholds?: {
    employees?: Record<string, number>;
    turnover?: Record<string, number>;
    areaSqFt?: Record<string, number>;
  };
  sources?: KnowledgeSourceRef[];
}

export interface StateLicenseOverride {
  localName?: string;
  authority?: string;
  onlinePortal?: string;
  timelineDays?: TimelineEstimateDays;
  feesInr?: FeeEstimateINR;
  documents?: string[];
  prerequisites?: string[];
  tips?: string[];
}

export interface StateRules {
  id: string;
  name: string;
  majorCities?: string[];
  cityToMunicipality?: Record<string, string>;
  licenses?: Record<string, StateLicenseOverride>;
  specialRules?: string[];
  sources?: KnowledgeSourceRef[];
}

export interface TemplateBlock {
  id: string;
  name: string;
  template: string;
  notes?: string[];
}

export interface TemplatesBundle {
  rti: TemplateBlock[];
  grievance: TemplateBlock[];
  appeal: TemplateBlock[];
}

export interface DepartmentPerformanceStat {
  id: string;
  name: string;
  avgDelayMultiplier?: number;
  complaintRate?: number;
  notes?: string[];
}

export interface StatisticsBundle {
  processingTimes?: Record<string, TimelineEstimateDays>;
  departmentPerformance?: DepartmentPerformanceStat[];
  corruptionPatterns?: string[];
}


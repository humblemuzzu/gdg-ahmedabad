/**
 * Chat Types for AI Assistant
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  references?: {
    licenseIds?: string[];
    documentNames?: string[];
    riskIds?: string[];
  };
}

export interface ChatContext {
  caseId: string;
  query: string;
  businessName?: string;
  location?: string;
  licenseSummary: {
    total: number;
    names: string[];
  };
  documentSummary: {
    required: number;
    optional: number;
    names: string[];
  };
  riskSummary: {
    score: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    topRisks: string[];
  };
  costSummary: {
    officialTotal: number;
    practicalMin: number;
    practicalMax: number;
  };
  timelineSummary: {
    totalDaysMin: number;
    totalDaysMax: number;
    stepsCount: number;
  };
  expertRecommendation?: string;
}

export interface ChatRequest {
  caseId: string;
  message: string;
  history: ChatMessage[];
  processResult?: unknown; // ProcessResult passed from client
}

export interface ChatResponse {
  message: ChatMessage;
  suggestedQuestions?: string[];
}

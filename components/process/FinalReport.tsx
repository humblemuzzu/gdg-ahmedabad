"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProcessResult, ProcessStep, ProcessCost, ProcessRisk, ProcessDocument, GeneratedDraft, TimelinePlanItem, DependencyGraph } from "@/types";
import { ProcessDependencyGraph } from "./ProcessDependencyGraph";

interface FinalReportProps {
  result: ProcessResult | null;
  isComplete: boolean;
  query?: string;
  steps: ProcessStep[];
  costs: ProcessCost[];
  risks: ProcessRisk[];
  documents: ProcessDocument[];
}

interface ExpertPerspective {
  role: string;
  advice: string;
}

interface StateComparisonData {
  states?: Array<{
    state: string;
    totalDays: { min: number; max: number };
    totalCost: number;
    complexity: number;
    advantages?: string[];
    disadvantages?: string[];
  }>;
  recommendation?: string;
}

interface WhatIfScenario {
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

interface WhatIfData {
  scenarios?: WhatIfScenario[];
  recommendation?: string;
}

interface VisitPlanData {
  visits?: Array<{
    time?: string;
    office: string;
    purpose: string;
    tips?: string[];
    documentsNeeded?: string[];
  }>;
  optimizationTips?: string[];
}

type TabId = "overview" | "timeline" | "costs" | "documents" | "risks" | "experts" | "drafts" | "comparison" | "whatif" | "visits" | "dependencies" | "reminders";

export function FinalReport({ 
  result, 
  isComplete, 
  query,
  steps,
  costs,
  risks,
  documents 
}: FinalReportProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [copiedDraft, setCopiedDraft] = useState<string | null>(null);

  if (!isComplete || !result) {
    return null;
  }

  // Cast to any for flexible property access (handles both demo and full pipeline formats)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = result as any;

  // Extract key info from result (handle both demo and full pipeline formats)
  const businessName = result.business?.name || 
                       r.business?.type ||
                       result.intent?.businessTypeId || 
                       "Your Business";
  const location = result.location?.city 
    ? `${result.location.city}, ${result.location.state || "India"}`
    : result.location?.state || "India";
  
  // Get licenses count
  const licensesCount = result.licenses?.length || 0;
  
  // FIX: Normalize timeline access - handle both array and {items: [...]} formats
  const rawTimeline = r.timeline;
  const timelineItems: TimelinePlanItem[] = Array.isArray(rawTimeline) 
    ? rawTimeline 
    : (rawTimeline?.items || []);
  
  // Calculate total days from normalized timeline, fallback to steps prop
  const totalDaysMin = timelineItems.length > 0 
    ? timelineItems.reduce((sum: number, item: TimelinePlanItem) => sum + (item.estimateDays?.min || 0), 0)
    : costs.reduce((sum, cost) => sum + (cost.amountINR > 0 ? 1 : 0), 0) * 7; // Rough estimate
  const totalDaysMax = timelineItems.length > 0
    ? timelineItems.reduce((sum: number, item: TimelinePlanItem) => sum + (item.estimateDays?.max || 0), 0)
    : costs.reduce((sum, cost) => sum + (cost.amountINR > 0 ? 1 : 0), 0) * 14; // Rough estimate
  
  // FIX: Normalize cost access - handle demo format (summary.officialTotal) and full format (officialFeesInr)
  const rawCosts = r.costs || {};
  const totalCost = Number(
    rawCosts?.officialFeesInr || 
    rawCosts?.summary?.officialTotal || 
    rawCosts?.totalOfficialFees || 
    0
  );
  const practicalCostsRange = rawCosts?.practicalCostsInrRange || rawCosts?.summary?.practicalRange;
  const practicalMin = Number(practicalCostsRange?.min || rawCosts?.practicalMin || 0);
  const practicalMax = Number(practicalCostsRange?.max || rawCosts?.practicalMax || 0);
  
  // Get risk score - handle both overallScore (demo) and riskScore0to10 (full)
  const riskScore = result.risks?.riskScore0to10 || r.risks?.overallScore || r.risks?.riskScore || 0;
  const highRisks = risks.filter(risk => risk.severity === "high").length;
  const mediumRisks = risks.filter(risk => risk.severity === "medium").length;

  // Get expert advice if available
  const expertAdvice = result.outputs?.expertAdvice as { 
    perspectives?: ExpertPerspective[];
    recommendation?: string;
  } | undefined;
  const perspectives = expertAdvice?.perspectives || [];
  const recommendation = expertAdvice?.recommendation;

  // Get generated drafts (RTI, Grievance, Appeal)
  const drafts: GeneratedDraft[] = result.drafts || [];
  
  // Get state comparison data
  const stateComparison = result.outputs?.stateComparison as StateComparisonData | undefined;
  
  // Get what-if scenarios
  const whatIfData = result.outputs?.whatIf as WhatIfData | undefined;
  
  // Get visit plan
  const visitPlanRaw = result.outputs?.visitPlan;
  const visitPlan: VisitPlanData | undefined = typeof visitPlanRaw === 'string' 
    ? { visits: [{ office: "See details", purpose: visitPlanRaw }] }
    : visitPlanRaw as VisitPlanData | undefined;

  // Get dependency graph
  const dependencyGraph: DependencyGraph | undefined = result.dependencyGraph;

  // Get reminders
  const reminders: string[] = result.outputs?.reminders || [];

  // Copy draft to clipboard
  const copyDraft = async (draft: GeneratedDraft) => {
    try {
      await navigator.clipboard.writeText(draft.body);
      setCopiedDraft(draft.kind);
      setTimeout(() => setCopiedDraft(null), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  // Download draft as text file
  const downloadDraft = (draft: GeneratedDraft) => {
    const blob = new Blob([draft.body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draft.kind.toLowerCase()}-draft.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Tabs configuration - include new tabs for hidden agent outputs
  const tabs: Array<{ id: TabId; label: string; icon: string; count?: number; highlight?: boolean }> = [
    { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "timeline", label: "Timeline", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", count: steps.length },
    { id: "costs", label: "Costs", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", count: costs.length },
    { id: "documents", label: "Documents", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", count: documents.length },
    { id: "risks", label: "Risks", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", count: risks.length },
    { id: "experts", label: "Experts", icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z", count: perspectives.length },
    // NEW TABS for previously hidden agent outputs
    { id: "drafts", label: "Drafts", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", count: drafts.length, highlight: drafts.length > 0 },
    { id: "comparison", label: "Compare States", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", count: stateComparison?.states?.length },
    { id: "whatif", label: "What-If", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", count: whatIfData?.scenarios?.length },
    { id: "visits", label: "Visit Plan", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", count: visitPlan?.visits?.length },
    { id: "dependencies", label: "Dependencies", icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5", count: dependencyGraph?.nodes?.length },
    { id: "reminders", label: "Reminders", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", count: reminders.length },
  ];

  return (
    <Card className="border-2 border-primary/50 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden">
      {/* Header */}
      <CardHeader className="border-b border-border bg-card/80 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success text-success-foreground">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-2xl">Analysis Complete</CardTitle>
                <CardDescription className="text-base">
                  Your comprehensive business setup report is ready
                </CardDescription>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              {query || `${businessName} in ${location}`}
            </p>
          </div>
          <Badge variant="success" className="text-sm px-4 py-1">
            Report Ready
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-6 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-background/50 p-3 text-center">
            <p className="text-3xl font-bold text-primary">{licensesCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Licenses Required</p>
          </div>
          <div className="rounded-lg border border-border bg-background/50 p-3 text-center">
            <p className="text-3xl font-bold text-info">
              {totalDaysMin === totalDaysMax ? totalDaysMin : `${totalDaysMin}-${totalDaysMax}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Days Estimated</p>
          </div>
          <div className="rounded-lg border border-border bg-background/50 p-3 text-center">
            <p className="text-3xl font-bold text-success">
              {totalCost > 0 ? `₹${(totalCost / 1000).toFixed(0)}K` : "TBD"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Official Fees</p>
          </div>
          <div className="rounded-lg border border-border bg-background/50 p-3 text-center">
            <p className={`text-3xl font-bold ${riskScore > 6 ? "text-destructive" : riskScore > 3 ? "text-warning" : "text-success"}`}>
              {riskScore}/10
            </p>
            <p className="text-xs text-muted-foreground mt-1">Risk Score</p>
          </div>
        </div>
      </CardHeader>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-border bg-muted/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <CardContent className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Business Summary */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h3 className="font-semibold text-lg mb-3">Business Summary</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Business Type</p>
                  <p className="font-medium">{businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zone</p>
                  <p className="font-medium capitalize">{result.location?.zone || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="font-medium">{Math.round((result.intent?.confidence || 0) * 100)}%</p>
                </div>
              </div>
            </div>

            {/* Required Licenses */}
            {result.licenses && result.licenses.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Required Licenses ({result.licenses.length})</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {result.licenses.map((license, idx) => (
                    <div key={license.id || idx} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{license.name}</p>
                        {license.authority && (
                          <p className="text-xs text-muted-foreground truncate">{license.authority}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            {recommendation && (
              <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">Expert Recommendation</p>
                    <p className="mt-1 text-sm text-foreground leading-relaxed">{recommendation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Warning */}
            {highRisks > 0 && (
              <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{highRisks} High Risk{highRisks > 1 ? "s" : ""} Identified</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Review the Risks tab for detailed information and mitigation strategies.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Clarifying Questions */}
            {result.intent?.clarifyingQuestions && result.intent.clarifyingQuestions.length > 0 && (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                <p className="text-sm font-semibold text-warning mb-2">Additional Information Needed</p>
                <ul className="space-y-2">
                  {result.intent.clarifyingQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-warning">?</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            {steps.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Process Timeline</h3>
                    <p className="text-sm text-muted-foreground">
                      Estimated total: {totalDaysMin === totalDaysMax ? `${totalDaysMin} days` : `${totalDaysMin}-${totalDaysMax} days`}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <div key={step.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                          step.status === "done" ? "border-success bg-success/10 text-success" :
                          step.status === "in_progress" ? "border-primary bg-primary/10 text-primary" :
                          "border-border bg-muted text-muted-foreground"
                        }`}>
                          {step.status === "done" ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-sm font-medium">{idx + 1}</span>
                          )}
                        </div>
                        {idx < steps.length - 1 && (
                          <div className={`w-0.5 h-full min-h-[40px] ${
                            step.status === "done" ? "bg-success" : "bg-border"
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="rounded-lg border border-border bg-card p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">{step.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {step.owner} - {step.eta}
                              </p>
                            </div>
                            <Badge variant={
                              step.status === "done" ? "success" :
                              step.status === "in_progress" ? "info" :
                              step.status === "blocked" ? "destructive" :
                              "outline"
                            } className="flex-shrink-0">
                              {step.status === "in_progress" ? "In Progress" : step.status}
                            </Badge>
                          </div>
                          {step.notes && (
                            <p className="text-sm text-muted-foreground mt-2 border-t border-border pt-2">
                              {step.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <svg className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No timeline data available</p>
              </div>
            )}
          </div>
        )}

        {/* Costs Tab */}
        {activeTab === "costs" && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border-2 border-success/30 bg-success/5 p-4">
                <p className="text-sm text-muted-foreground">Official Government Fees</p>
                <p className="text-3xl font-bold text-success mt-1">
                  {totalCost > 0 ? `₹${totalCost.toLocaleString("en-IN")}` : "To be determined"}
                </p>
              </div>
              <div className="rounded-lg border-2 border-warning/30 bg-warning/5 p-4">
                <p className="text-sm text-muted-foreground">Practical Costs (Including consultants, travel)</p>
                <p className="text-3xl font-bold text-warning mt-1">
                  {practicalMin > 0 || practicalMax > 0 
                    ? `₹${practicalMin.toLocaleString("en-IN")} - ₹${practicalMax.toLocaleString("en-IN")}`
                    : "To be determined"
                  }
                </p>
              </div>
            </div>

            {/* Cost Breakdown */}
            {costs.length > 0 ? (
              <div>
                <h3 className="font-semibold text-lg mb-3">Cost Breakdown</h3>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Item</th>
                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costs.map((cost, idx) => (
                        <tr key={cost.id} className={idx % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                          <td className="p-3">
                            <p className="font-medium">{cost.label}</p>
                            {cost.note && <p className="text-xs text-muted-foreground mt-0.5">{cost.note}</p>}
                          </td>
                          <td className="p-3 text-right font-medium">
                            ₹{cost.amountINR.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <svg className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Detailed cost breakdown not available</p>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            {documents.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Required Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      {documents.filter(d => !d.optional).length} required, {documents.filter(d => d.optional).length} optional
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className={`flex items-center gap-3 rounded-lg border p-3 ${
                      doc.optional ? "border-border bg-card" : "border-primary/30 bg-primary/5"
                    }`}>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        doc.optional ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                      }`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.title}</p>
                        {doc.optional && (
                          <p className="text-xs text-muted-foreground">Optional</p>
                        )}
                      </div>
                      {!doc.optional && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <svg className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No document checklist available</p>
              </div>
            )}
          </div>
        )}

        {/* Risks Tab */}
        {activeTab === "risks" && (
          <div className="space-y-4">
            {/* Risk Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className={`rounded-lg border-2 p-4 ${highRisks > 0 ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className={`text-3xl font-bold ${highRisks > 0 ? "text-destructive" : "text-muted-foreground"}`}>{highRisks}</p>
              </div>
              <div className={`rounded-lg border-2 p-4 ${mediumRisks > 0 ? "border-warning/30 bg-warning/5" : "border-border bg-card"}`}>
                <p className="text-sm text-muted-foreground">Medium Risk</p>
                <p className={`text-3xl font-bold ${mediumRisks > 0 ? "text-warning" : "text-muted-foreground"}`}>{mediumRisks}</p>
              </div>
              <div className="rounded-lg border-2 border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Low Risk</p>
                <p className="text-3xl font-bold text-muted-foreground">{risks.filter(r => r.severity === "low").length}</p>
              </div>
            </div>

            {/* Risk List */}
            {risks.length > 0 ? (
              <div className="space-y-3">
                {risks.map((risk) => (
                  <div key={risk.id} className={`rounded-lg border-2 p-4 ${
                    risk.severity === "high" ? "border-destructive/30 bg-destructive/5" :
                    risk.severity === "medium" ? "border-warning/30 bg-warning/5" :
                    "border-border bg-card"
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                          risk.severity === "high" ? "bg-destructive text-destructive-foreground" :
                          risk.severity === "medium" ? "bg-warning text-warning-foreground" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">{risk.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">Mitigation:</span> {risk.mitigation}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        risk.severity === "high" ? "destructive" :
                        risk.severity === "medium" ? "warning" :
                        "outline"
                      } className="flex-shrink-0 capitalize">
                        {risk.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="flex h-12 w-12 mx-auto mb-3 items-center justify-center rounded-full bg-success/10">
                  <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p>No significant risks identified</p>
              </div>
            )}

            {/* Preventive Measures */}
            {result.risks?.preventiveMeasures && result.risks.preventiveMeasures.length > 0 && (
              <div className="rounded-lg border border-info/30 bg-info/5 p-4">
                <p className="text-sm font-semibold text-info mb-2">Preventive Measures</p>
                <ul className="space-y-2">
                  {result.risks.preventiveMeasures.map((measure, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                      <svg className="h-4 w-4 text-info flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {measure}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Experts Tab */}
        {activeTab === "experts" && (
          <div className="space-y-4">
            {perspectives.length > 0 ? (
              <>
                <h3 className="font-semibold text-lg mb-3">Expert Perspectives</h3>
                <div className="space-y-4">
                  {perspectives.map((expert, idx) => (
                    <div key={idx} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {expert.role.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{expert.role}</p>
                          <p className="text-xs text-muted-foreground">Expert Opinion</p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{expert.advice}</p>
                    </div>
                  ))}
                </div>

                {/* Final Recommendation */}
                {recommendation && (
                  <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 mt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-primary">Final Recommendation</p>
                        <p className="text-xs text-muted-foreground">Based on all expert perspectives</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{recommendation}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <svg className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <p>No expert perspectives available</p>
              </div>
            )}
          </div>
        )}

        {/* Drafts Tab - RTI, Grievance, Appeal */}
        {activeTab === "drafts" && (
          <div className="space-y-4">
            {drafts.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Generated Drafts</h3>
                    <p className="text-sm text-muted-foreground">
                      Ready-to-use RTI, Grievance, and Appeal documents
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {drafts.map((draft, idx) => (
                    <div key={idx} className={`rounded-lg border-2 p-4 ${
                      draft.kind === "RTI" ? "border-info/30 bg-info/5" :
                      draft.kind === "GRIEVANCE" ? "border-warning/30 bg-warning/5" :
                      "border-primary/30 bg-primary/5"
                    }`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            draft.kind === "RTI" ? "bg-info text-info-foreground" :
                            draft.kind === "GRIEVANCE" ? "bg-warning text-warning-foreground" :
                            "bg-primary text-primary-foreground"
                          }`}>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold">{draft.title || `${draft.kind} Draft`}</p>
                            <p className="text-xs text-muted-foreground">
                              {draft.kind === "RTI" ? "Right to Information Application" :
                               draft.kind === "GRIEVANCE" ? "Formal Complaint Letter" :
                               "Appeal Document"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyDraft(draft)}
                          >
                            {copiedDraft === draft.kind ? (
                              <>
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                              </>
                            )}
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => downloadDraft(draft)}
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-lg border border-border bg-card p-4 font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {draft.body}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <svg className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p>No drafts generated for this query</p>
                <p className="text-xs mt-2">RTI and Grievance drafts are generated for stuck applications</p>
              </div>
            )}
          </div>
        )}

        {/* State Comparison Tab */}
        {activeTab === "comparison" && (
          <div className="space-y-4">
            {stateComparison?.states && stateComparison.states.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">State-by-State Comparison</h3>
                    <p className="text-sm text-muted-foreground">
                      Compare requirements across different states
                    </p>
                  </div>
                </div>
                
                {/* Comparison Table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">State</th>
                        <th className="text-center p-3 text-sm font-medium text-muted-foreground">Timeline</th>
                        <th className="text-center p-3 text-sm font-medium text-muted-foreground">Cost</th>
                        <th className="text-center p-3 text-sm font-medium text-muted-foreground">Complexity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stateComparison.states.map((state, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                          <td className="p-3">
                            <p className="font-medium">{state.state}</p>
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-info font-medium">
                              {state.totalDays.min}-{state.totalDays.max} days
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-success font-medium">
                              ₹{state.totalCost.toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg 
                                  key={i} 
                                  className={`h-4 w-4 ${i < state.complexity ? "text-warning" : "text-muted"}`} 
                                  fill={i < state.complexity ? "currentColor" : "none"} 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor" 
                                  strokeWidth={2}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* State Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  {stateComparison.states.map((state, idx) => (
                    <div key={idx} className="rounded-lg border border-border bg-card p-4">
                      <h4 className="font-semibold mb-2">{state.state}</h4>
                      {state.advantages && state.advantages.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-success font-medium mb-1">Advantages:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {state.advantages.map((adv, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-success">+</span> {adv}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {state.disadvantages && state.disadvantages.length > 0 && (
                        <div>
                          <p className="text-xs text-destructive font-medium mb-1">Challenges:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {state.disadvantages.map((dis, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-destructive">-</span> {dis}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Recommendation */}
                {stateComparison.recommendation && (
                  <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-primary">Recommendation</p>
                        <p className="mt-1 text-sm text-foreground leading-relaxed">{stateComparison.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <svg className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No state comparison data available</p>
                <p className="text-xs mt-2">State comparison is generated for queries across multiple states</p>
              </div>
            )}
          </div>
        )}

        {/* What-If Tab */}
        {activeTab === "whatif" && (
          <div className="space-y-4">
            {whatIfData?.scenarios && whatIfData.scenarios.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">What-If Scenarios</h3>
                    <p className="text-sm text-muted-foreground">
                      Potential scenarios and how to handle them
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {whatIfData.scenarios.map((scenario, idx) => (
                    <div key={idx} className="rounded-lg border-2 border-warning/30 bg-warning/5 p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning text-warning-foreground">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{scenario.scenario}</p>
                            {scenario.probability && (
                              <Badge variant="outline" className="text-xs">
                                {Math.round(scenario.probability * 100)}% chance
                              </Badge>
                            )}
                          </div>
                          {scenario.impact && (
                            <p className="text-sm text-muted-foreground mb-2">
                              <span className="font-medium">Impact:</span> {scenario.impact}
                            </p>
                          )}
                          {scenario.mitigation && (
                            <p className="text-sm text-foreground">
                              <span className="font-medium text-success">Mitigation:</span> {scenario.mitigation}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Possible Outcomes */}
                      {scenario.outcomes && scenario.outcomes.length > 0 && (
                        <div className="ml-13 mt-3 pl-4 border-l-2 border-warning/30 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Possible Outcomes:</p>
                          {scenario.outcomes.map((outcome, oidx) => (
                            <div key={oidx} className="flex items-start gap-2 text-sm">
                              <span className="text-warning">→</span>
                              <div>
                                <span className="font-medium">{outcome.outcome}</span>
                                {outcome.probability && (
                                  <span className="text-muted-foreground ml-1">({Math.round(outcome.probability * 100)}%)</span>
                                )}
                                {outcome.action && (
                                  <p className="text-xs text-muted-foreground">Action: {outcome.action}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* What-If Recommendation */}
                {whatIfData.recommendation && (
                  <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-primary">Best Strategy</p>
                        <p className="mt-1 text-sm text-foreground leading-relaxed">{whatIfData.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <svg className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No what-if scenarios generated</p>
                <p className="text-xs mt-2">Scenarios help you prepare for potential obstacles</p>
              </div>
            )}
          </div>
        )}

        {/* Visit Plan Tab */}
        {activeTab === "visits" && (
          <div className="space-y-4">
            {visitPlan?.visits && visitPlan.visits.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Optimized Visit Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      Your planned office visits in optimal order
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {visitPlan.visits.map((visit, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary font-semibold">
                          {idx + 1}
                        </div>
                        {idx < visitPlan.visits!.length - 1 && (
                          <div className="w-0.5 h-full min-h-[40px] bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="rounded-lg border border-border bg-card p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-medium">{visit.office}</p>
                              {visit.time && (
                                <p className="text-sm text-primary">{visit.time}</p>
                              )}
                            </div>
                            <Badge variant="outline">{visit.purpose}</Badge>
                          </div>
                          {visit.documentsNeeded && visit.documentsNeeded.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-muted-foreground mb-1">Documents to carry:</p>
                              <div className="flex flex-wrap gap-1">
                                {visit.documentsNeeded.map((doc, didx) => (
                                  <Badge key={didx} variant="secondary" className="text-xs">
                                    {doc}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {visit.tips && visit.tips.length > 0 && (
                            <div className="border-t border-border pt-2 mt-2">
                              <p className="text-xs text-muted-foreground mb-1">Tips:</p>
                              <ul className="text-sm text-foreground space-y-1">
                                {visit.tips.map((tip, tidx) => (
                                  <li key={tidx} className="flex items-start gap-1">
                                    <span className="text-info">•</span> {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optimization Tips */}
                {visitPlan.optimizationTips && visitPlan.optimizationTips.length > 0 && (
                  <div className="rounded-lg border border-info/30 bg-info/5 p-4">
                    <p className="text-sm font-semibold text-info mb-2">Time-Saving Tips</p>
                    <ul className="space-y-2">
                      {visitPlan.optimizationTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                          <svg className="h-4 w-4 text-info flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <svg className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p>No visit plan generated</p>
                <p className="text-xs mt-2">Visit plans help you optimize your government office trips</p>
              </div>
            )}
          </div>
        )}

        {/* Dependencies Tab */}
        {activeTab === "dependencies" && (
          <div className="space-y-4">
            <ProcessDependencyGraph dependencyGraph={dependencyGraph} />
          </div>
        )}

        {/* Reminders Tab */}
        {activeTab === "reminders" && (
          <div className="space-y-4">
            {reminders.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Follow-up Reminders</h3>
                    <p className="text-sm text-muted-foreground">
                      Important deadlines and follow-ups to track
                    </p>
                  </div>
                  <Badge variant="info">{reminders.length} reminders</Badge>
                </div>
                <div className="space-y-3">
                  {reminders.map((reminder, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-info/30 bg-info/5 p-4 flex items-start gap-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info text-info-foreground flex-shrink-0">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{reminder}</p>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        #{idx + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                {/* Export Reminders */}
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm font-semibold mb-2">Pro Tip</p>
                  <p className="text-sm text-muted-foreground">
                    Set calendar reminders for each deadline. Government offices often have strict timelines 
                    and missing a follow-up window can reset your entire process.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="font-medium mb-1">No Reminders Set</p>
                <p className="text-sm max-w-xs mx-auto">
                  Reminders will be generated based on your timeline and required follow-ups
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

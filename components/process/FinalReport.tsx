"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProcessResult, ProcessStep, ProcessCost, ProcessRisk, ProcessDocument, GeneratedDraft, TimelinePlanItem, DependencyGraph, ProcessStepStatus, VisitPlanData } from "@/types";
import { ProcessDependencyGraph } from "./ProcessDependencyGraph";
import { RemindersPanel } from "./RemindersPanel";
import { VisitPlanTab } from "./VisitPlanTab";
import { getEstimatedCosts, getRisksWithDefaults, calculateOfficialCost, DEFAULT_RISKS } from "@/lib/constants/defaults";

interface FinalReportProps {
  result: ProcessResult | null;
  isComplete: boolean;
  query?: string;
  steps: ProcessStep[];
  costs: ProcessCost[];
  risks: ProcessRisk[];
  documents: ProcessDocument[];
  caseId?: string;
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

// Main tab structure - 4 groups instead of 12
type MainTabId = "overview" | "planning" | "analysis" | "tools";
type SubTabId = 
  | "summary" | "licenses" | "documents"  // Overview sub-tabs
  | "timeline" | "costs" | "visits"       // Planning sub-tabs
  | "risks" | "experts" | "comparison" | "whatif"  // Analysis sub-tabs
  | "drafts" | "reminders" | "dependencies";  // Tools sub-tabs

const statusOrder: ProcessStepStatus[] = ["pending", "in_progress", "done", "blocked"];
const statusStyles: Record<ProcessStepStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-muted/50", text: "text-muted-foreground", label: "Pending" },
  in_progress: { bg: "bg-info/10", text: "text-info", label: "In Progress" },
  done: { bg: "bg-success/10", text: "text-success", label: "Done" },
  blocked: { bg: "bg-destructive/10", text: "text-destructive", label: "Blocked" },
};

export function FinalReport({ 
  result, 
  isComplete, 
  query,
  steps,
  costs,
  risks,
  documents,
  caseId: propCaseId
}: FinalReportProps) {
  const [activeMainTab, setActiveMainTab] = useState<MainTabId>("overview");
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("summary");
  const [copiedDraft, setCopiedDraft] = useState<string | null>(null);
  const [stepStatuses, setStepStatuses] = useState<Map<string, ProcessStepStatus>>(new Map());
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set(["0"]));

  const getStepStatus = (step: ProcessStep): ProcessStepStatus => {
    return stepStatuses.get(step.id) || step.status;
  };

  const cycleStepStatus = (step: ProcessStep) => {
    const currentStatus = getStepStatus(step);
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[nextIndex];
    setStepStatuses(prev => new Map(prev).set(step.id, newStatus));
  };

  const markAllStepsDone = () => {
    const newMap = new Map<string, ProcessStepStatus>();
    steps.forEach(step => newMap.set(step.id, "done"));
    setStepStatuses(newMap);
  };

  const resetAllSteps = () => {
    setStepStatuses(new Map());
  };

  const toggleStateExpanded = (index: string) => {
    setExpandedStates(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Handle main tab change - set appropriate default sub-tab
  const handleMainTabChange = (tab: MainTabId) => {
    setActiveMainTab(tab);
    switch (tab) {
      case "overview":
        setActiveSubTab("summary");
        break;
      case "planning":
        setActiveSubTab("timeline");
        break;
      case "analysis":
        setActiveSubTab("risks");
        break;
      case "tools":
        setActiveSubTab("drafts");
        break;
    }
  };

  if (!isComplete || !result) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = result as any;

  // Extract key info
  const businessName = result.business?.name || r.business?.type || result.intent?.businessTypeId || "Your Business";
  const location = result.location?.city 
    ? `${result.location.city}, ${result.location.state || "India"}`
    : result.location?.state || "India";
  
  const licensesCount = result.licenses?.length || 0;
  
  const rawTimeline = r.timeline;
  const timelineItems: TimelinePlanItem[] = Array.isArray(rawTimeline) 
    ? rawTimeline 
    : (rawTimeline?.items || []);
  
  const totalDaysMin = timelineItems.length > 0 
    ? timelineItems.reduce((sum: number, item: TimelinePlanItem) => sum + (item.estimateDays?.min || 0), 0)
    : costs.reduce((sum, cost) => sum + (cost.amountINR > 0 ? 1 : 0), 0) * 7;
  const totalDaysMax = timelineItems.length > 0
    ? timelineItems.reduce((sum: number, item: TimelinePlanItem) => sum + (item.estimateDays?.max || 0), 0)
    : costs.reduce((sum, cost) => sum + (cost.amountINR > 0 ? 1 : 0), 0) * 14;
  
  const rawCosts = r.costs || {};
  let totalCost = Number(rawCosts?.officialFeesInr || rawCosts?.summary?.officialTotal || rawCosts?.totalOfficialFees || 0);
  const practicalCostsRange = rawCosts?.practicalCostsInrRange || rawCosts?.summary?.practicalRange;
  let practicalMin = Number(practicalCostsRange?.min || rawCosts?.practicalMin || 0);
  let practicalMax = Number(practicalCostsRange?.max || rawCosts?.practicalMax || 0);
  
  if (totalCost === 0 || (practicalMin === 0 && practicalMax === 0)) {
    const calculatedFromLicenses = calculateOfficialCost(result.licenses);
    if (calculatedFromLicenses > 0) {
      if (totalCost === 0) totalCost = calculatedFromLicenses;
    }
    
    if (totalCost === 0 || (practicalMin === 0 && practicalMax === 0)) {
      const businessTypeId = result.intent?.businessTypeId || result.business?.name || "";
      const estimated = getEstimatedCosts(businessTypeId);
      if (totalCost === 0) totalCost = estimated.official;
      if (practicalMin === 0) practicalMin = estimated.practicalMin;
      if (practicalMax === 0) practicalMax = estimated.practicalMax;
    }
  }
  
  const riskScore = result.risks?.riskScore0to10 || r.risks?.overallScore || r.risks?.riskScore || 0;
  
  const effectiveRisks = getRisksWithDefaults(risks);
  const highRisks = effectiveRisks.filter(risk => risk.severity === "high").length;
  const mediumRisks = effectiveRisks.filter(risk => risk.severity === "medium").length;
  const lowRisks = effectiveRisks.filter(risk => risk.severity === "low").length;

  const expertAdvice = result.outputs?.expertAdvice as { 
    perspectives?: ExpertPerspective[];
    recommendation?: string;
  } | undefined;
  const perspectives = expertAdvice?.perspectives || [];
  const recommendation = expertAdvice?.recommendation;

  const drafts: GeneratedDraft[] = result.drafts || [];
  const stateComparison = result.outputs?.stateComparison as StateComparisonData | undefined;
  const whatIfData = result.outputs?.whatIf as WhatIfData | undefined;
  
  const visitPlanRaw = result.outputs?.visitPlan;
  const visitPlan: VisitPlanData | undefined = typeof visitPlanRaw === 'string' 
    ? { visits: [{ office: "See details", purpose: visitPlanRaw }] }
    : (visitPlanRaw as VisitPlanData | undefined);

  const dependencyGraph: DependencyGraph | undefined = result.dependencyGraph;
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

  // Calculate progress
  const completedSteps = steps.filter(s => getStepStatus(s) === "done").length;
  const progressPercent = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

  // Required vs optional documents
  const requiredDocs = documents.filter(d => !d.optional);
  const optionalDocs = documents.filter(d => d.optional);

  // Main tabs configuration
  const mainTabs: Array<{ id: MainTabId; label: string; icon: string; badge?: number }> = [
    { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "planning", label: "Planning", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id: "analysis", label: "Analysis", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { id: "tools", label: "Tools", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", badge: drafts.length > 0 ? drafts.length : undefined },
  ];

  // Sub-tabs for each main tab
  const subTabsConfig: Record<MainTabId, Array<{ id: SubTabId; label: string }>> = {
    overview: [
      { id: "summary", label: "Summary" },
      { id: "licenses", label: `Licenses (${licensesCount})` },
      { id: "documents", label: `Documents (${documents.length})` },
    ],
    planning: [
      { id: "timeline", label: `Timeline (${steps.length})` },
      { id: "costs", label: `Costs (${costs.length})` },
      { id: "visits", label: "Visit Plan" },
    ],
    analysis: [
      { id: "risks", label: `Risks (${effectiveRisks.length})` },
      { id: "experts", label: `Experts (${perspectives.length})` },
      { id: "comparison", label: "Compare States" },
      { id: "whatif", label: "What-If" },
    ],
    tools: [
      { id: "drafts", label: `Drafts (${drafts.length})` },
      { id: "reminders", label: `Reminders` },
      { id: "dependencies", label: "Dependencies" },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-card rounded-2xl p-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success flex-shrink-0">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analysis Complete</h1>
              <p className="text-muted-foreground mt-1 max-w-2xl">
                {query || `${businessName} in ${location}`}
              </p>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{businessName}</span>
                <span>•</span>
                <span>{location}</span>
                {result.location?.zone && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{result.location.zone} Zone</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Badge className="bg-success/10 text-success border-0 px-3 py-1.5">
            Report Ready
          </Badge>
        </div>

        {/* Quick Stats - No borders, subtle backgrounds */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/30 rounded-xl p-5 text-center transition-all hover:bg-muted/50">
            <p className="text-3xl font-bold text-primary">{licensesCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Licenses Required</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-5 text-center transition-all hover:bg-muted/50">
            <p className="text-3xl font-bold text-info">
              {totalDaysMin === totalDaysMax ? totalDaysMin : `${totalDaysMin}-${totalDaysMax}`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Days Estimated</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-5 text-center transition-all hover:bg-muted/50">
            <p className="text-3xl font-bold text-success">
              {totalCost > 0 ? `₹${(totalCost / 1000).toFixed(0)}K` : "₹15K"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Est. Fees {totalCost > 0 && rawCosts?.officialFeesInr === undefined && "(Est.)"}
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-5 text-center transition-all hover:bg-muted/50">
            <p className={`text-3xl font-bold ${riskScore > 6 ? "text-destructive" : riskScore > 3 ? "text-warning" : "text-success"}`}>
              {riskScore}/10
            </p>
            <p className="text-sm text-muted-foreground mt-1">Risk Score</p>
          </div>
        </div>
      </section>

      {/* Main Tab Navigation - Pills style */}
      <nav className="flex gap-2 p-1 bg-muted/30 rounded-xl w-fit">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleMainTabChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeMainTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Sub Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        {subTabsConfig[activeMainTab].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSubTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <main className="space-y-10">
        {/* ============================================ */}
        {/* OVERVIEW TAB */}
        {/* ============================================ */}
        
        {/* Summary Sub-tab */}
        {activeMainTab === "overview" && activeSubTab === "summary" && (
          <div className="space-y-10">
            {/* Expert Recommendation */}
            {recommendation && (
              <div className="bg-primary/5 rounded-2xl p-6 border-l-4 border-primary">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-primary text-lg">Expert Recommendation</p>
                    <p className="mt-2 text-foreground leading-relaxed">{recommendation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Alert */}
            {highRisks > 0 && (
              <div className="bg-destructive/5 rounded-2xl p-6 border-l-4 border-destructive">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive flex-shrink-0">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{highRisks} High Risk{highRisks > 1 ? "s" : ""} Identified</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Review the Analysis &gt; Risks section for detailed information and mitigation strategies.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => { setActiveMainTab("analysis"); setActiveSubTab("risks"); }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    View Details
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Links Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Licenses Quick View */}
              <button 
                onClick={() => setActiveSubTab("licenses")}
                className="bg-card rounded-2xl p-6 text-left transition-all hover:shadow-md hover:bg-muted/30 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <svg className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">{licensesCount} Licenses</h3>
                <p className="text-sm text-muted-foreground mt-1">Required to operate legally</p>
              </button>

              {/* Documents Quick View */}
              <button 
                onClick={() => setActiveSubTab("documents")}
                className="bg-card rounded-2xl p-6 text-left transition-all hover:shadow-md hover:bg-muted/30 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <svg className="h-5 w-5 text-muted-foreground group-hover:text-info transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">{documents.length} Documents</h3>
                <p className="text-sm text-muted-foreground mt-1">{requiredDocs.length} required, {optionalDocs.length} optional</p>
              </button>

              {/* Timeline Quick View */}
              <button 
                onClick={() => { setActiveMainTab("planning"); setActiveSubTab("timeline"); }}
                className="bg-card rounded-2xl p-6 text-left transition-all hover:shadow-md hover:bg-muted/30 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <svg className="h-5 w-5 text-muted-foreground group-hover:text-success transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">{steps.length} Steps</h3>
                <p className="text-sm text-muted-foreground mt-1">{totalDaysMin}-{totalDaysMax} days estimated</p>
              </button>
            </div>

            {/* Clarifying Questions */}
            {result.intent?.clarifyingQuestions && result.intent.clarifyingQuestions.length > 0 && (
              <div className="bg-warning/5 rounded-2xl p-6 border-l-4 border-warning">
                <p className="font-semibold text-foreground mb-3">Additional Information May Help</p>
                <ul className="space-y-2">
                  {result.intent.clarifyingQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="text-warning font-bold">?</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Licenses Sub-tab */}
        {activeMainTab === "overview" && activeSubTab === "licenses" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Required Licenses</h2>
                <p className="text-sm text-muted-foreground mt-1">{licensesCount} licenses needed to operate legally</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => { setActiveMainTab("planning"); setActiveSubTab("timeline"); }}
              >
                View Timeline
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>

            {result.licenses && result.licenses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {result.licenses.map((license, idx) => (
                  <div 
                    key={license.id || idx} 
                    className="bg-card rounded-xl p-5 transition-all hover:shadow-sm hover:bg-muted/20"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{license.name}</p>
                        {license.authority && (
                          <p className="text-sm text-muted-foreground mt-0.5">{license.authority}</p>
                        )}
                        {(license.feesInr || license.timelineDays) && (
                          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                            {license.feesInr != null && (
                              <span className="bg-success/10 text-success px-2 py-1 rounded-md">
                                ₹{Number(license.feesInr as number).toLocaleString("en-IN")}
                              </span>
                            )}
                            {license.timelineDays && (
                              <span className="bg-info/10 text-info px-2 py-1 rounded-md">
                                {license.timelineDays.min}-{license.timelineDays.max} days
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted/50">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="font-medium">No license data available</p>
              </div>
            )}
          </div>
        )}

        {/* Documents Sub-tab */}
        {activeMainTab === "overview" && activeSubTab === "documents" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold">Documents Checklist</h2>
              <p className="text-sm text-muted-foreground mt-1">Prepare these before starting your applications</p>
            </div>

            {documents.length > 0 ? (
              <div className="space-y-8">
                {/* Required Documents */}
                {requiredDocs.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                      Required ({requiredDocs.length})
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {requiredDocs.map((doc) => (
                        <div 
                          key={doc.id} 
                          className="bg-primary/5 rounded-xl px-4 py-3 flex items-center gap-3 transition-all hover:bg-primary/10"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="font-medium text-sm">{doc.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional Documents */}
                {optionalDocs.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                      Optional ({optionalDocs.length})
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {optionalDocs.map((doc) => (
                        <div 
                          key={doc.id} 
                          className="bg-muted/30 rounded-xl px-4 py-3 flex items-center gap-3 transition-all hover:bg-muted/50"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground flex-shrink-0">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="text-sm text-muted-foreground">{doc.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted/50">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-medium">No document checklist available</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* PLANNING TAB */}
        {/* ============================================ */}
        
        {/* Timeline Sub-tab */}
        {activeMainTab === "planning" && activeSubTab === "timeline" && (
          <div className="space-y-8">
            {/* Header with progress */}
            <div className="bg-card rounded-2xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Process Timeline</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {totalDaysMin === totalDaysMax ? `${totalDaysMin} days` : `${totalDaysMin}-${totalDaysMax} days`} estimated
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetAllSteps}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={markAllStepsDone}>
                    Mark All Done
                  </Button>
                </div>
              </div>

              {/* Progress bar */}
              {steps.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{completedSteps}/{steps.length} steps ({progressPercent}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Timeline Steps */}
            {steps.length > 0 ? (
              <div className="space-y-4">
                {steps.map((step, idx) => {
                  const currentStatus = getStepStatus(step);
                  const style = statusStyles[currentStatus];
                  const isActive = currentStatus === "in_progress";
                  
                  return (
                    <div key={step.id} className="flex gap-4">
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                          currentStatus === "done" ? "bg-success text-success-foreground" :
                          currentStatus === "in_progress" ? "bg-primary text-primary-foreground" :
                          currentStatus === "blocked" ? "bg-destructive text-destructive-foreground" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {currentStatus === "done" ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : currentStatus === "blocked" ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : (
                            <span className="text-sm font-semibold">{idx + 1}</span>
                          )}
                        </div>
                        {idx < steps.length - 1 && (
                          <div className={`w-0.5 flex-1 min-h-[24px] transition-colors ${
                            currentStatus === "done" ? "bg-success" : "bg-muted"
                          }`} />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pb-6">
                        <div className={`bg-card rounded-xl p-5 transition-all hover:shadow-sm ${
                          isActive ? "ring-2 ring-primary/20" : ""
                        }`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{step.title}</h4>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <span>{step.owner}</span>
                                <span>•</span>
                                <span>{step.eta}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => cycleStepStatus(step)}
                              className="flex-shrink-0 transition-transform hover:scale-105"
                              title="Click to change status"
                            >
                              <Badge className={`${style.bg} ${style.text} border-0 cursor-pointer`}>
                                {style.label}
                              </Badge>
                            </button>
                          </div>
                          {step.notes && (
                            <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border/50">
                              {step.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted/50">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-medium">No timeline data available</p>
              </div>
            )}
          </div>
        )}

        {/* Costs Sub-tab */}
        {activeMainTab === "planning" && activeSubTab === "costs" && (
          <div className="space-y-8">
            {/* Cost Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-success/5 rounded-2xl p-8 text-center">
                <p className="text-4xl font-bold text-success">
                  ₹{totalCost.toLocaleString("en-IN")}
                </p>
                <p className="text-muted-foreground mt-2">Official Government Fees</p>
                {totalCost > 0 && rawCosts?.officialFeesInr === undefined && (
                  <Badge variant="outline" className="mt-2">Estimated</Badge>
                )}
              </div>
              <div className="bg-warning/5 rounded-2xl p-8 text-center">
                <p className="text-4xl font-bold text-warning">
                  ₹{practicalMin.toLocaleString("en-IN")} - ₹{practicalMax.toLocaleString("en-IN")}
                </p>
                <p className="text-muted-foreground mt-2">Practical Total (incl. consultants, travel)</p>
                {(practicalMin > 0 || practicalMax > 0) && !rawCosts?.practicalCostsInrRange && (
                  <Badge variant="outline" className="mt-2">Estimated</Badge>
                )}
              </div>
            </div>

            {/* Cost Breakdown */}
            {costs.length > 0 ? (
              <div className="bg-card rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-border/50">
                  <h3 className="font-semibold text-lg">Detailed Breakdown</h3>
                </div>
                <div className="divide-y divide-border/50">
                  {costs.map((cost, idx) => (
                    <div key={cost.id || idx} className="flex items-center justify-between p-5 hover:bg-muted/20 transition-colors">
                      <div>
                        <p className="font-medium">{cost.label}</p>
                        {cost.note && <p className="text-sm text-muted-foreground mt-0.5">{cost.note}</p>}
                      </div>
                      <p className="font-semibold text-foreground">
                        ₹{cost.amountINR.toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-5 bg-muted/30">
                  <p className="font-semibold">Total Official Fees</p>
                  <p className="font-bold text-lg">₹{totalCost.toLocaleString("en-IN")}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted/50">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-medium">Detailed cost breakdown not available</p>
              </div>
            )}

            {/* Cost Saving Tips */}
            <div className="bg-info/5 rounded-2xl p-6 border-l-4 border-info">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info flex-shrink-0">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-info">Tips to Reduce Costs</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Apply online yourself to save consultant fees</li>
                    <li>• Group multiple applications for the same office visit</li>
                    <li>• Check if any licenses can be combined or waived</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visit Plan Sub-tab */}
        {activeMainTab === "planning" && activeSubTab === "visits" && (
          <VisitPlanTab visitPlan={visitPlan} />
        )}

        {/* ============================================ */}
        {/* ANALYSIS TAB */}
        {/* ============================================ */}
        
        {/* Risks Sub-tab */}
        {activeMainTab === "analysis" && activeSubTab === "risks" && (
          <div className="space-y-8">
            {/* Risk Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className={`rounded-xl p-6 text-center ${highRisks > 0 ? "bg-destructive/5" : "bg-muted/30"}`}>
                <p className={`text-4xl font-bold ${highRisks > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {highRisks}
                </p>
                <p className="text-sm text-muted-foreground mt-1">High Risk</p>
              </div>
              <div className={`rounded-xl p-6 text-center ${mediumRisks > 0 ? "bg-warning/5" : "bg-muted/30"}`}>
                <p className={`text-4xl font-bold ${mediumRisks > 0 ? "text-warning" : "text-muted-foreground"}`}>
                  {mediumRisks}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Medium Risk</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-muted-foreground">{lowRisks}</p>
                <p className="text-sm text-muted-foreground mt-1">Low Risk</p>
              </div>
            </div>

            {/* Default risks notice */}
            {risks.length === 0 && (
              <div className="bg-info/5 rounded-xl p-4 flex items-center gap-3">
                <svg className="h-5 w-5 text-info flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-muted-foreground">
                  Showing common risks for government processes. Specific risks will appear based on your application details.
                </p>
              </div>
            )}

            {/* Risk Cards */}
            <div className="space-y-4">
              {effectiveRisks.map((risk) => (
                <div 
                  key={risk.id} 
                  className={`rounded-2xl p-6 border-l-4 ${
                    risk.severity === "high" ? "bg-destructive/5 border-destructive" :
                    risk.severity === "medium" ? "bg-warning/5 border-warning" :
                    "bg-muted/30 border-muted"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          risk.severity === "high" ? "text-destructive" :
                          risk.severity === "medium" ? "text-warning" :
                          "text-muted-foreground"
                        }`}>
                          {risk.severity}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground">{risk.title}</h4>
                      
                      {/* Mitigation */}
                      <div className="mt-4 bg-card rounded-xl p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Mitigation</p>
                        <p className="text-sm text-foreground">{risk.mitigation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Preventive Measures */}
            {result.risks?.preventiveMeasures && result.risks.preventiveMeasures.length > 0 && (
              <div className="bg-info/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg">Preventive Measures</h3>
                </div>
                <ul className="space-y-2">
                  {result.risks.preventiveMeasures.map((measure, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <svg className="h-5 w-5 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{measure}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Experts Sub-tab */}
        {activeMainTab === "analysis" && activeSubTab === "experts" && (
          <div className="space-y-8">
            {perspectives.length > 0 ? (
              <>
                <div>
                  <h2 className="text-xl font-semibold">Expert Perspectives</h2>
                  <p className="text-sm text-muted-foreground mt-1">Insights from domain specialists</p>
                </div>

                <div className="space-y-6">
                  {perspectives.map((expert, idx) => (
                    <div key={idx} className="bg-card rounded-2xl p-6 hover:shadow-sm transition-all">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                          {expert.role?.slice(0, 2).toUpperCase() || 'EX'}
                        </div>
                        <div className="flex-1">
                          <div>
                            <p className="font-semibold text-foreground">{expert.role || 'Expert'}</p>
                            <p className="text-xs text-muted-foreground">Expert Opinion</p>
                          </div>
                          <div className="mt-4 text-sm text-foreground leading-relaxed">
                            {typeof expert.advice === 'string' ? (
                              <p>{expert.advice}</p>
                            ) : typeof expert.advice === 'object' && expert.advice !== null ? (
                              <div className="space-y-3">
                                {Object.entries(expert.advice).map(([key, value]) => (
                                  <div key={key} className="border-l-2 border-primary/20 pl-4">
                                    <p className="font-medium text-foreground mb-1">
                                      {key.replace(/^on/, '').replace(/([A-Z])/g, ' $1').trim()}
                                    </p>
                                    {typeof value === 'string' ? (
                                      <p className="text-muted-foreground">{value}</p>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Combined Recommendation */}
                {recommendation && (
                  <div className="bg-primary/5 rounded-2xl p-6 border-l-4 border-primary">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground flex-shrink-0">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-primary text-lg">Combined Expert Recommendation</p>
                        <p className="mt-2 text-foreground leading-relaxed">{recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted/50">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <p className="font-medium">No expert perspectives available</p>
              </div>
            )}
          </div>
        )}

        {/* State Comparison Sub-tab */}
        {activeMainTab === "analysis" && activeSubTab === "comparison" && (
          <div className="space-y-8">
            {stateComparison?.states && stateComparison.states.length > 0 ? (
              <>
                <div>
                  <h2 className="text-xl font-semibold">State-by-State Comparison</h2>
                  <p className="text-sm text-muted-foreground mt-1">Compare requirements across different states</p>
                </div>

                {/* Comparison Table */}
                <div className="bg-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/30">
                          <th className="text-left p-4 font-semibold text-muted-foreground">State</th>
                          <th className="text-center p-4 font-semibold text-muted-foreground">Timeline</th>
                          <th className="text-center p-4 font-semibold text-muted-foreground">Cost</th>
                          <th className="text-center p-4 font-semibold text-muted-foreground">Complexity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {stateComparison.states.map((state, idx) => (
                          <tr key={idx} className={idx === 0 ? "bg-primary/5" : "hover:bg-muted/20"}>
                            <td className="p-4">
                              <p className="font-medium">{state.state}</p>
                              {idx === 0 && <span className="text-xs text-primary">(Your choice)</span>}
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-info font-medium">
                                {state.totalDays.min}-{state.totalDays.max} days
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-success font-medium">
                                ₹{state.totalCost.toLocaleString("en-IN")}
                              </span>
                            </td>
                            <td className="p-4 text-center">
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
                </div>

                {/* State Details - Expandable */}
                <div className="space-y-4">
                  {stateComparison.states.map((state, idx) => (
                    <div key={idx} className="bg-card rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleStateExpanded(String(idx))}
                        className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors"
                      >
                        <span className="font-semibold">{state.state}</span>
                        <svg 
                          className={`h-5 w-5 text-muted-foreground transition-transform ${expandedStates.has(String(idx)) ? "rotate-180" : ""}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedStates.has(String(idx)) && (
                        <div className="p-5 pt-0 grid gap-4 md:grid-cols-2">
                          {state.advantages && state.advantages.length > 0 && (
                            <div className="bg-success/5 rounded-xl p-4">
                              <p className="text-xs font-semibold text-success uppercase tracking-wider mb-3">Advantages</p>
                              <ul className="space-y-2">
                                {state.advantages.map((adv, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="text-success font-bold">+</span>
                                    <span>{adv}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {state.disadvantages && state.disadvantages.length > 0 && (
                            <div className="bg-destructive/5 rounded-xl p-4">
                              <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-3">Challenges</p>
                              <ul className="space-y-2">
                                {state.disadvantages.map((dis, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="text-destructive font-bold">-</span>
                                    <span>{dis}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Recommendation */}
                {stateComparison.recommendation && (
                  <div className="bg-primary/5 rounded-2xl p-6 border-l-4 border-primary">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground flex-shrink-0">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-primary">Recommendation</p>
                        <p className="mt-2 text-foreground leading-relaxed">{stateComparison.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted/50">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="font-medium">No state comparison data available</p>
                <p className="text-sm mt-1">State comparison is generated for queries across multiple states</p>
              </div>
            )}
          </div>
        )}

        {/* What-If Sub-tab */}
        {activeMainTab === "analysis" && activeSubTab === "whatif" && (
          <div className="space-y-8">
            {whatIfData?.scenarios && whatIfData.scenarios.length > 0 ? (
              <>
                <div>
                  <h2 className="text-xl font-semibold">What-If Scenarios</h2>
                  <p className="text-sm text-muted-foreground mt-1">Potential scenarios and how to handle them</p>
                </div>

                <div className="space-y-6">
                  {whatIfData.scenarios.map((scenario, idx) => (
                    <div key={idx} className="bg-card rounded-2xl p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning flex-shrink-0">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{scenario.scenario}</h4>
                          </div>
                        </div>
                        {scenario.probability && (
                          <Badge className="bg-warning/10 text-warning border-0">
                            {Math.round(scenario.probability * 100)}% likely
                          </Badge>
                        )}
                      </div>

                      {scenario.impact && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Impact</p>
                          <p className="text-sm text-muted-foreground">{scenario.impact}</p>
                        </div>
                      )}

                      {scenario.mitigation && (
                        <div className="bg-muted/30 rounded-xl p-4 mb-4">
                          <p className="text-xs font-semibold text-success uppercase tracking-wider mb-2">Mitigation</p>
                          <p className="text-sm">{scenario.mitigation}</p>
                        </div>
                      )}

                      {scenario.outcomes && scenario.outcomes.length > 0 && (
                        <div className="border-t border-border/50 pt-4">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Possible Outcomes</p>
                          <div className="space-y-2">
                            {scenario.outcomes.map((outcome, oidx) => (
                              <div key={oidx} className="flex items-start gap-3 text-sm">
                                <span className="text-warning">→</span>
                                <div>
                                  <span className="font-medium">{outcome.outcome}</span>
                                  {outcome.probability && (
                                    <span className="text-muted-foreground ml-2">({Math.round(outcome.probability * 100)}%)</span>
                                  )}
                                  {outcome.action && (
                                    <p className="text-xs text-muted-foreground mt-0.5">Action: {outcome.action}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Best Strategy */}
                {whatIfData.recommendation && (
                  <div className="bg-primary/5 rounded-2xl p-6 border-l-4 border-primary">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground flex-shrink-0">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-primary">Best Strategy</p>
                        <p className="mt-2 text-foreground leading-relaxed">{whatIfData.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted/50">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-medium">No what-if scenarios generated</p>
                <p className="text-sm mt-1">Scenarios help you prepare for potential obstacles</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* TOOLS TAB */}
        {/* ============================================ */}
        
        {/* Drafts Sub-tab */}
        {activeMainTab === "tools" && activeSubTab === "drafts" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold">Ready-to-Use Legal Drafts</h2>
              <p className="text-sm text-muted-foreground mt-1">Pre-filled RTI, Grievance, and Appeal templates</p>
            </div>

            {drafts.length > 0 ? (
              <div className="space-y-6">
                {drafts.map((draft, idx) => (
                  <div 
                    key={idx} 
                    className={`rounded-2xl p-6 ${
                      draft.kind === "RTI" ? "bg-info/5" :
                      draft.kind === "GRIEVANCE" ? "bg-warning/5" :
                      "bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-sm ${
                          draft.kind === "RTI" ? "bg-info/10 text-info" :
                          draft.kind === "GRIEVANCE" ? "bg-warning/10 text-warning" :
                          "bg-primary/10 text-primary"
                        }`}>
                          {draft.kind}
                        </div>
                        <div>
                          <p className="font-semibold">{draft.title || `${draft.kind} Draft`}</p>
                          <p className="text-sm text-muted-foreground">
                            {draft.kind === "RTI" ? "Right to Information Application" :
                             draft.kind === "GRIEVANCE" ? "Formal Complaint Letter" :
                             "Appeal Document"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyDraft(draft)}>
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
                        <Button size="sm" onClick={() => downloadDraft(draft)}>
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="bg-card rounded-xl p-4 font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {draft.body}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted/50">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="font-medium">No drafts generated for this query</p>
                <p className="text-sm mt-1">RTI and Grievance drafts are generated for stuck applications</p>
              </div>
            )}
          </div>
        )}

        {/* Reminders Sub-tab */}
        {activeMainTab === "tools" && activeSubTab === "reminders" && (
          <RemindersPanel 
            caseId={propCaseId || result.meta?.caseId as string || "default_case"}
            steps={steps}
            agentReminders={reminders}
          />
        )}

        {/* Dependencies Sub-tab */}
        {activeMainTab === "tools" && activeSubTab === "dependencies" && (
          <ProcessDependencyGraph dependencyGraph={dependencyGraph} />
        )}
      </main>
    </div>
  );
}

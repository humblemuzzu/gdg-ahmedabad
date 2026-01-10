"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProcessResult, ProcessStep, ProcessCost, ProcessRisk, ProcessDocument } from "@/types";

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

export function FinalReport({ 
  result, 
  isComplete, 
  query,
  steps,
  costs,
  risks,
  documents 
}: FinalReportProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "costs" | "documents" | "risks" | "experts">("overview");

  if (!isComplete || !result) {
    return null;
  }

  // Extract key info from result
  const businessName = result.business?.name || result.intent?.businessTypeId || "Your Business";
  const location = result.location?.city 
    ? `${result.location.city}, ${result.location.state || "India"}`
    : result.location?.state || "India";
  
  // Get licenses count
  const licensesCount = result.licenses?.length || 0;
  
  // Get timeline estimate
  const timelineItems = result.timeline || [];
  const totalDaysMin = timelineItems.reduce((sum, item) => sum + (item.estimateDays?.min || 0), 0);
  const totalDaysMax = timelineItems.reduce((sum, item) => sum + (item.estimateDays?.max || 0), 0);
  
  // Get cost estimate
  const totalCost = result.costs?.officialFeesInr || 0;
  const practicalMin = result.costs?.practicalCostsInrRange?.min || 0;
  const practicalMax = result.costs?.practicalCostsInrRange?.max || 0;
  
  // Get risk score
  const riskScore = result.risks?.riskScore0to10 || 0;
  const highRisks = risks.filter(r => r.severity === "high").length;
  const mediumRisks = risks.filter(r => r.severity === "medium").length;

  // Get expert advice if available
  const expertAdvice = result.outputs?.expertAdvice as { 
    perspectives?: ExpertPerspective[];
    recommendation?: string;
  } | undefined;
  const perspectives = expertAdvice?.perspectives || [];
  const recommendation = expertAdvice?.recommendation;

  // Tabs configuration
  const tabs = [
    { id: "overview" as const, label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "timeline" as const, label: "Timeline", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", count: steps.length },
    { id: "costs" as const, label: "Costs", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", count: costs.length },
    { id: "documents" as const, label: "Documents", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", count: documents.length },
    { id: "risks" as const, label: "Risks", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", count: risks.length },
    { id: "experts" as const, label: "Expert Advice", icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z", count: perspectives.length },
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
      </CardContent>
    </Card>
  );
}

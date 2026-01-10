"use client";

import Link from "next/link";
import { AgentActivityStream } from "@/components/agents/AgentActivityStream";
import { AgentDebateViewer } from "@/components/agents/AgentDebateViewer";
import { AgentGrid } from "@/components/agents/AgentGrid";
import { DocumentChecklist } from "@/components/process/DocumentChecklist";
import { ProcessInput } from "@/components/process/ProcessInput";
import { ProcessRiskAnalysis } from "@/components/process/ProcessRiskAnalysis";
import { ProcessResultSummary } from "@/components/process/ProcessResultSummary";
import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import { ProcessCostBreakdown } from "@/components/process/ProcessCostBreakdown";
import { FinalReport } from "@/components/process/FinalReport";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalysisContext } from "@/lib/context/analysis-context";

export default function DashboardPage() {
  const { agents, activities, risks, documents, steps, costs, result, isRunning, isComplete, status, query, debateMessages, typingAgent, caseId } = useAnalysisContext();

  const activeAgentCount = agents.filter((a) => a.status === "working").length;
  const completedAgentCount = agents.filter((a) => a.status === "done").length;
  const highRiskCount = risks.filter((r) => r.severity === "high").length;

  const stats = [
    {
      label: "Active Agents",
      value: isRunning ? String(activeAgentCount) : "0",
      hint: isRunning ? "Working right now" : "Idle",
      accent: "primary",
    },
    {
      label: "Completed",
      value: String(completedAgentCount),
      hint: isComplete ? "All done" : "Agents finished",
      accent: "success",
    },
    {
      label: "High Risks",
      value: String(highRiskCount),
      hint: highRiskCount > 0 ? "Needs attention" : "Looking good",
      accent: "destructive",
    },
    {
      label: "Documents",
      value: String(documents.length),
      hint: "Checklist items",
      accent: "info",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid - Desktop */}
      <div className="hidden gap-4 md:grid md:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`fade-in stagger-${i + 1} group relative overflow-hidden rounded-xl border-2 border-border bg-card p-5 transition-all hover:shadow-lg`}
          >
            {/* Accent bar */}
            <div className={`absolute left-0 top-0 h-full w-1 bg-${s.accent}`} />

            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-2 font-display text-4xl font-bold tracking-tight">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* Final Report - Shows prominently when analysis is complete */}
      {isComplete && result && (
        <div className="space-y-4">
          {/* View Full Report Button */}
          {caseId && (
            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Analysis Complete!</p>
                  <p className="text-sm text-muted-foreground">Your comprehensive report is ready to view</p>
                </div>
              </div>
              <Link
                href={`/report/${caseId}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                View Full Report
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
          
          <FinalReport 
            result={result} 
            isComplete={isComplete} 
            query={query || undefined}
            steps={steps}
            costs={costs}
            risks={risks}
            documents={documents}
            caseId={caseId || undefined}
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {/* Input Section */}
          <div id="new">
            <ProcessInput />
          </div>

          {/* Result Summary - Shows after completion (smaller version below the main report) */}
          {!isComplete && <ProcessResultSummary result={result} isComplete={isComplete} />}

          {/* Timeline - Show during processing or if no complete result */}
          {steps.length > 0 && !isComplete && <ProcessTimeline steps={steps} />}

          {/* Costs - Show during processing or if no complete result */}
          {costs.length > 0 && !isComplete && <ProcessCostBreakdown costs={costs} />}

          {/* Risk Analysis - Show during processing or if no complete result */}
          {!isComplete && <ProcessRiskAnalysis risks={risks} />}
        </div>

        {/* Right Column - Sidebar Content */}
        <div className="space-y-6">
          {/* Agent Collaboration/Debate */}
          {(isRunning || debateMessages.length > 0) && (
            <AgentDebateViewer 
              messages={debateMessages} 
              isLive={isRunning} 
              typingAgent={typingAgent}
            />
          )}

          {/* Agent Activity */}
          <AgentActivityStream events={activities} />

          {/* Agents Grid */}
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <CardTitle>Agent Roster</CardTitle>
                  <CardDescription>Your AI team at work</CardDescription>
                </div>
                <Link
                  href="/process/demo"
                  className="flex-shrink-0 text-sm font-semibold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-hidden">
              <div className="max-w-full">
                <AgentGrid agents={agents} compact />
              </div>
              <div className="mt-4 flex items-center gap-2 border-t-2 border-border pt-4">
                <div className="relative flex-shrink-0">
                  <div className={`h-2 w-2 rounded-full ${isRunning ? "bg-primary" : "bg-success"}`} />
                  {isRunning && (
                    <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-primary opacity-75" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {isRunning
                    ? `${activeAgentCount} agent${activeAgentCount !== 1 ? "s" : ""} working`
                    : "Orchestration stream ready"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Document Checklist - Show during processing or if not complete */}
          {!isComplete && <DocumentChecklist documents={documents} />}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { AgentActivityStream } from "@/components/agents/AgentActivityStream";
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
  const { agents, activities, risks, documents, steps, costs, result, isRunning, isComplete, status, query } = useAnalysisContext();

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
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl border-2 border-border bg-card p-6 md:p-8">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-mesh opacity-50" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {status === "idle" && <Badge variant="outline">Ready</Badge>}
              {isRunning && <Badge variant="info" className="animate-pulse">Processing</Badge>}
              {isComplete && <Badge variant="success">Complete</Badge>}
              {status === "error" && <Badge variant="destructive">Error</Badge>}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Your Process<br />
              <span className="text-primary">Command Center</span>
            </h1>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              Track every step, monitor agent activity, and stay ahead of blockers.
              Everything you need to cut through red tape.
            </p>
          </div>

          {/* Quick stats row - mobile */}
          <div className="flex items-center gap-4 md:hidden">
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-primary">
                {isRunning ? activeAgentCount : completedAgentCount}
              </p>
              <p className="text-xs text-muted-foreground">Agents</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-destructive">{highRiskCount}</p>
              <p className="text-xs text-muted-foreground">Risks</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-success">{documents.length}</p>
              <p className="text-xs text-muted-foreground">Docs</p>
            </div>
          </div>
        </div>
      </div>

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
        <FinalReport 
          result={result} 
          isComplete={isComplete} 
          query={query || undefined}
          steps={steps}
          costs={costs}
          risks={risks}
          documents={documents}
        />
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
          {/* Agent Activity */}
          <AgentActivityStream events={activities} />

          {/* Agents Grid */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Agent Roster</CardTitle>
                  <CardDescription>Your AI team at work</CardDescription>
                </div>
                <Link
                  href="/process/demo"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <AgentGrid agents={agents} compact />
              <div className="mt-4 flex items-center gap-2 border-t-2 border-border pt-4">
                <div className="relative">
                  <div className={`h-2 w-2 rounded-full ${isRunning ? "bg-primary" : "bg-success"}`} />
                  {isRunning && (
                    <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-primary opacity-75" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
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

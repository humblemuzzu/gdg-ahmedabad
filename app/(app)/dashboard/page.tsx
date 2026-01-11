"use client";

import Link from "next/link";
import { AgentActivityStream } from "@/components/agents/AgentActivityStream";
import { AgentDebateViewer } from "@/components/agents/AgentDebateViewer";
import { AgentPipelineProgress } from "@/components/agents/AgentPipelineProgress";
import { DocumentChecklist } from "@/components/process/DocumentChecklist";
import { ProcessInput } from "@/components/process/ProcessInput";
import { ProcessRiskAnalysis } from "@/components/process/ProcessRiskAnalysis";
import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import { ProcessCostBreakdown } from "@/components/process/ProcessCostBreakdown";
import { FinalReport } from "@/components/process/FinalReport";
import { PerplexityStatus } from "@/components/ui/PerplexityStatus";
import { useAnalysisContext } from "@/lib/context/analysis-context";

export default function DashboardPage() {
  const { agents, activities, risks, documents, steps, costs, result, isRunning, isComplete, query, debateMessages, typingAgent, caseId } = useAnalysisContext();

  const isIdle = !isRunning && !isComplete;

  return (
    <div className="min-h-[calc(100vh-12rem)]">
      {/* Perplexity Status Indicator - Top Right */}
      <div className="flex justify-end mb-4">
        <PerplexityStatus />
      </div>

      {/* IDLE STATE - Clean, centered input */}
      {isIdle && (
        <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
          <ProcessInput />
        </div>
      )}

      {/* RUNNING STATE - Show progress and activity */}
      {isRunning && (
        <div className="space-y-10">
          {/* Agent Pipeline Progress */}
          <AgentPipelineProgress
            agents={agents}
            isRunning={isRunning}
            isComplete={isComplete}
          />

          {/* Two column layout for details */}
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Left Column - Data */}
            <div className="space-y-6">
              {steps.length > 0 && <ProcessTimeline steps={steps} />}
              {costs.length > 0 && <ProcessCostBreakdown costs={costs} />}
              {risks.length > 0 && <ProcessRiskAnalysis risks={risks} />}
            </div>

            {/* Right Column - Activity */}
            <div className="space-y-6">
              {debateMessages.length > 0 && (
                <AgentDebateViewer 
                  messages={debateMessages} 
                  isLive={isRunning} 
                  typingAgent={typingAgent}
                />
              )}
              {activities.length > 0 && (
                <AgentActivityStream events={activities} />
              )}
              {documents.length > 0 && <DocumentChecklist documents={documents} />}
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE STATE - Results */}
      {isComplete && result && (
        <div className="space-y-10">
          {/* Success Header */}
          {caseId && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Your Plan is Ready</h2>
                  <p className="text-muted-foreground">Complete roadmap for your business</p>
                </div>
              </div>
              <Link
                href={`/report/${caseId}`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                View Full Report
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}

          {/* Completed Pipeline */}
          <AgentPipelineProgress
            agents={agents}
            isRunning={isRunning}
            isComplete={isComplete}
          />

          {/* Report */}
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

          {/* Start New - minimal */}
          <div className="pt-8 border-t border-border">
            <div className="text-center mb-6">
              <p className="text-muted-foreground">Need help with something else?</p>
            </div>
            <ProcessInput />
          </div>
        </div>
      )}
    </div>
  );
}

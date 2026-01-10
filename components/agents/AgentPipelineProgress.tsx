"use client";

import { cn } from "@/lib/utils";
import type { Agent, Tier } from "@/types";

// Simplified agent pipeline for visual display - grouped by tier
const AGENT_PIPELINE: Array<{
  id: string;
  label: string;
  description: string;
  tier: Tier;
}> = [
  { id: "intent_decoder", label: "Intent", description: "Understanding your query", tier: "intake" },
  { id: "location_intelligence", label: "Location", description: "Analyzing location rules", tier: "intake" },
  { id: "business_classifier", label: "Business", description: "Classifying business type", tier: "intake" },
  { id: "regulation_librarian", label: "Research", description: "Finding regulations", tier: "research" },
  { id: "document_detective", label: "Documents", description: "Identifying requirements", tier: "research" },
  { id: "timeline_architect", label: "Timeline", description: "Planning your journey", tier: "strategy" },
  { id: "cost_calculator", label: "Costs", description: "Calculating expenses", tier: "strategy" },
  { id: "risk_assessor", label: "Risks", description: "Identifying blockers", tier: "strategy" },
  { id: "final_compiler", label: "Report", description: "Compiling final report", tier: "intelligence" },
];

interface AgentPipelineProgressProps {
  agents: Agent[];
  isRunning: boolean;
  isComplete: boolean;
  className?: string;
}

export function AgentPipelineProgress({
  agents,
  isRunning,
  isComplete,
  className,
}: AgentPipelineProgressProps) {
  // Find the highest index agent that is done or working
  const getAgentPipelineIndex = (agentId: string) => 
    AGENT_PIPELINE.findIndex((p) => p.id === agentId);
  
  // Find current active agent and completed agents
  const workingAgent = agents.find((a) => a.status === "working");
  const completedAgents = agents.filter((a) => a.status === "done");
  
  // Get indices of completed agents in our pipeline
  const completedIndices = completedAgents
    .map((a) => getAgentPipelineIndex(a.id))
    .filter((idx) => idx >= 0);
  
  // Current working agent index
  const workingIndex = workingAgent ? getAgentPipelineIndex(workingAgent.id) : -1;
  
  // The furthest point we've reached (either completed or currently working)
  const furthestIndex = isComplete 
    ? AGENT_PIPELINE.length - 1 
    : Math.max(...completedIndices, workingIndex, -1);
  
  // Count of completed pipeline agents
  const completedCount = isComplete 
    ? AGENT_PIPELINE.length 
    : completedIndices.length;
  
  // Progress percentage for the bar
  const progressPercent = isComplete 
    ? 100 
    : Math.round((completedCount / AGENT_PIPELINE.length) * 100);
  
  // Line progress: how far the connecting line should extend (0 to 100)
  // Line goes from first dot to the furthest reached dot
  const lineProgress = isComplete 
    ? 100 
    : furthestIndex <= 0 
      ? 0 
      : (furthestIndex / (AGENT_PIPELINE.length - 1)) * 100;

  // Get current agent info for display
  const currentPipelineAgent = workingIndex >= 0 && workingIndex < AGENT_PIPELINE.length
    ? AGENT_PIPELINE[workingIndex]
    : null;
  
  // Determine status for each dot
  const getDotStatus = (index: number): "completed" | "active" | "pending" => {
    if (isComplete) return "completed";
    if (completedIndices.includes(index)) return "completed";
    if (index === workingIndex) return "active";
    return "pending";
  };

  // Don't show if not running and not complete
  if (!isRunning && !isComplete) return null;

  return (
    <div className={cn("bg-card border-2 border-border rounded-xl p-6 md:p-8", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          {isComplete ? (
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-1">
          {isComplete ? "Analysis Complete" : "Analyzing Your Query"}
        </h3>
        {currentPipelineAgent && !isComplete && (
          <p className="text-sm text-muted-foreground">{currentPipelineAgent.description}</p>
        )}
        {isComplete && (
          <p className="text-sm text-muted-foreground">Your comprehensive plan is ready</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">
            {completedCount} of {AGENT_PIPELINE.length} agents complete
          </span>
          <span className="text-xs font-semibold text-foreground">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Agent Pipeline Dots */}
      <div className="relative px-4">
        {/* Connection line background */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
        {/* Connection line progress - properly calculated */}
        <div
          className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-700 ease-out origin-left"
          style={{
            width: `${lineProgress}%`,
            maxWidth: "calc(100% - 32px)",
          }}
        />

        {/* Agent dots */}
        <div className="relative flex justify-between">
          {AGENT_PIPELINE.map((agent, index) => {
            const status = getDotStatus(index);

            return (
              <div key={agent.id} className="flex flex-col items-center group">
                {/* Dot */}
                <div
                  className={cn(
                    "relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                    status === "completed" && "bg-primary shadow-lg shadow-primary/25",
                    status === "active" && "bg-primary/20 ring-4 ring-primary/20",
                    status === "pending" && "bg-muted border-2 border-border"
                  )}
                >
                  {status === "completed" ? (
                    <svg
                      className="w-4 h-4 text-primary-foreground"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : status === "active" ? (
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 bg-border rounded-full" />
                  )}
                </div>

                {/* Label - show on hover or when active */}
                <span
                  className={cn(
                    "mt-3 text-[10px] font-medium whitespace-nowrap transition-opacity duration-200",
                    status === "active"
                      ? "text-primary opacity-100"
                      : status === "completed"
                        ? "text-muted-foreground opacity-100"
                        : "text-muted-foreground opacity-0 group-hover:opacity-100"
                  )}
                >
                  {agent.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Agent Badge */}
      {currentPipelineAgent && !isComplete && (
        <div className="mt-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-sm font-medium text-primary">{currentPipelineAgent.label}</span>
            <span className="text-xs text-muted-foreground">working...</span>
          </span>
        </div>
      )}

      {/* Completed Stats */}
      {isComplete && (
        <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{AGENT_PIPELINE.length}</p>
            <p className="text-xs text-muted-foreground">Agents Used</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{completedAgents.length}</p>
            <p className="text-xs text-muted-foreground">Tasks Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">100%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
      )}
    </div>
  );
}

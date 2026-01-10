"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProcessStep, ProcessResult } from "@/types";

interface JourneyMapProps {
  steps?: ProcessStep[];
  result?: ProcessResult | null;
}

// Status colors
const STATUS_COLORS: Record<string, { bg: string; border: string; dot: string }> = {
  done: { bg: "bg-success/10", border: "border-success/30", dot: "bg-success" },
  in_progress: { bg: "bg-primary/10", border: "border-primary/30", dot: "bg-primary" },
  pending: { bg: "bg-muted", border: "border-border", dot: "bg-muted-foreground" },
  blocked: { bg: "bg-destructive/10", border: "border-destructive/30", dot: "bg-destructive" },
};

export function JourneyMap({ steps = [], result }: JourneyMapProps) {
  const hasSteps = steps.length > 0;
  
  // Group steps by phase (every 3 steps = 1 phase for visualization)
  const phases: { name: string; steps: ProcessStep[] }[] = [];
  if (hasSteps) {
    const phaseNames = ["Preparation", "Application", "Processing", "Verification", "Completion"];
    const stepsPerPhase = Math.max(1, Math.ceil(steps.length / 5));
    
    for (let i = 0; i < steps.length; i += stepsPerPhase) {
      const phaseIndex = Math.min(phases.length, phaseNames.length - 1);
      phases.push({
        name: phaseNames[phaseIndex],
        steps: steps.slice(i, i + stepsPerPhase),
      });
    }
  }

  // Calculate progress
  const completedSteps = steps.filter(s => s.status === "done").length;
  const progressPercent = hasSteps ? Math.round((completedSteps / steps.length) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Journey Map</CardTitle>
            <CardDescription>
              {hasSteps 
                ? `${steps.length} steps across ${phases.length} phases`
                : "Your process journey visualization"
              }
            </CardDescription>
          </div>
          {hasSteps && (
            <Badge variant={progressPercent === 100 ? "success" : "info"}>
              {progressPercent}% Complete
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasSteps ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="relative">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Start</span>
                <span>{completedSteps} of {steps.length} steps done</span>
                <span>Complete</span>
              </div>
            </div>

            {/* Journey Phases */}
            <div className="space-y-4">
              {phases.map((phase, phaseIdx) => (
                <div key={phaseIdx} className="relative">
                  {/* Phase Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      phase.steps.every(s => s.status === "done") 
                        ? "bg-success text-success-foreground" 
                        : phase.steps.some(s => s.status === "in_progress")
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {phase.steps.every(s => s.status === "done") ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm font-bold">{phaseIdx + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{phase.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {phase.steps.filter(s => s.status === "done").length} of {phase.steps.length} complete
                      </p>
                    </div>
                  </div>

                  {/* Phase Steps */}
                  <div className="ml-4 pl-4 border-l-2 border-border space-y-2">
                    {phase.steps.map((step, stepIdx) => {
                      const colors = STATUS_COLORS[step.status] || STATUS_COLORS.pending;
                      
                      return (
                        <div 
                          key={step.id}
                          className={`relative rounded-lg border p-3 ${colors.bg} ${colors.border}`}
                        >
                          {/* Connection dot */}
                          <div className={`absolute -left-[21px] top-4 h-3 w-3 rounded-full ${colors.dot}`} />
                          
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{step.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {step.owner} • {step.eta}
                              </p>
                            </div>
                            <Badge 
                              variant={
                                step.status === "done" ? "success" :
                                step.status === "in_progress" ? "info" :
                                step.status === "blocked" ? "destructive" :
                                "outline"
                              }
                              className="text-xs flex-shrink-0"
                            >
                              {step.status === "in_progress" ? "In Progress" : step.status}
                            </Badge>
                          </div>
                          {step.notes && (
                            <p className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">
                              {step.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Phase connector */}
                  {phaseIdx < phases.length - 1 && (
                    <div className="flex items-center justify-center my-4">
                      <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-border text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-success" />
                <span className="text-muted-foreground">Complete</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-muted-foreground">In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                <span className="text-muted-foreground">Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Blocked</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-10 text-center">
            <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted">
              <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Journey Visualization</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Run an analysis to see your complete process journey mapped out
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

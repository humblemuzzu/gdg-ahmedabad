"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProcessStep, ProcessStepStatus } from "@/types";

interface ProcessTimelineProps {
  steps?: ProcessStep[];
  onStepStatusChange?: (stepId: string, newStatus: ProcessStepStatus) => void;
  editable?: boolean;
}

const statusOrder: ProcessStepStatus[] = ["pending", "in_progress", "done", "blocked"];

const statusStyles: Record<ProcessStepStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-muted", text: "text-muted-foreground", label: "Pending" },
  in_progress: { bg: "bg-info/10", text: "text-info", label: "In Progress" },
  done: { bg: "bg-success/10", text: "text-success", label: "Done" },
  blocked: { bg: "bg-destructive/10", text: "text-destructive", label: "Blocked" },
};

export function ProcessTimeline({ steps = [], onStepStatusChange, editable = true }: ProcessTimelineProps) {
  // Local state to track status changes when no callback provided
  const [localSteps, setLocalSteps] = useState<Map<string, ProcessStepStatus>>(new Map());

  const getStepStatus = (step: ProcessStep): ProcessStepStatus => {
    return localSteps.get(step.id) || step.status;
  };

  const cycleStatus = (step: ProcessStep) => {
    if (!editable) return;
    
    const currentStatus = getStepStatus(step);
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[nextIndex];

    // Update local state
    setLocalSteps(prev => new Map(prev).set(step.id, newStatus));

    // Call callback if provided
    if (onStepStatusChange) {
      onStepStatusChange(step.id, newStatus);
    }
  };

  const markAllDone = () => {
    const newMap = new Map<string, ProcessStepStatus>();
    steps.forEach(step => {
      newMap.set(step.id, "done");
      if (onStepStatusChange) {
        onStepStatusChange(step.id, "done");
      }
    });
    setLocalSteps(newMap);
  };

  const resetAll = () => {
    setLocalSteps(new Map());
    steps.forEach(step => {
      if (onStepStatusChange) {
        onStepStatusChange(step.id, step.status);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Click status badges to update progress</CardDescription>
          </div>
          {editable && steps.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetAll}>
                Reset
              </Button>
              <Button variant="default" size="sm" onClick={markAllDone}>
                Mark All Done
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">No timeline available</p>
            <p className="mt-1 text-xs text-muted-foreground">Submit a query to generate steps</p>
          </div>
        ) : (
          steps.map((step, idx) => {
            const status = getStepStatus(step);
            const style = statusStyles[status];
            
            return (
              <div
                key={step.id}
                className="rounded-2xl border border-border bg-background/40 px-4 py-3 transition-all hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Step number circle */}
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      status === "done" ? "border-success bg-success/10 text-success" :
                      status === "in_progress" ? "border-info bg-info/10 text-info" :
                      status === "blocked" ? "border-destructive bg-destructive/10 text-destructive" :
                      "border-border bg-muted text-muted-foreground"
                    }`}>
                      {status === "done" ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : status === "blocked" ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{idx + 1}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{step.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Owner: {step.owner} · ETA: {step.eta}
                      </p>
                      {step.notes ? (
                        <p className="mt-2 text-xs text-muted-foreground">{step.notes}</p>
                      ) : null}
                    </div>
                  </div>
                  {/* Clickable Status Badge */}
                  <button
                    onClick={() => cycleStatus(step)}
                    disabled={!editable}
                    className={`flex-shrink-0 ${editable ? "cursor-pointer hover:opacity-80" : "cursor-default"} transition-opacity`}
                    title={editable ? "Click to change status" : undefined}
                  >
                    <Badge 
                      variant="outline" 
                      className={`${style.bg} ${style.text} border-transparent px-3 py-1 ${
                        editable ? "hover:ring-2 hover:ring-primary/30" : ""
                      }`}
                    >
                      {style.label}
                    </Badge>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAnalysisContext } from "@/lib/context/analysis-context";

const examples = [
  "Ahmedabad me cafe kholna hai - licenses, timeline, aur total kharcha?",
  "Gujarat me GST registration karna hai - step-by-step checklist",
  "Society NOC ke bina shop license possible hai?",
  "Fire NOC me kya documents lagte hai?",
];

export function ProcessInput() {
  const [value, setValue] = React.useState(examples[0]);
  const { analyze, isRunning, isComplete, hasError, error, query } = useAnalysisContext();

  const handleSubmit = async () => {
    if (!value.trim() || isRunning) return;
    await analyze(value.trim());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Describe Your Goal</CardTitle>
            <CardDescription>Hinglish works great. Keep it simple and specific.</CardDescription>
          </div>
          {isRunning && (
            <Badge variant="info" className="animate-pulse">
              Processing...
            </Badge>
          )}
          {isComplete && <Badge variant="success">Complete</Badge>}
          {hasError && <Badge variant="destructive">Error</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Ahmedabad me cafe kholna hai..."
            className="min-h-36 text-base"
            disabled={isRunning}
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {value.length}/500
          </div>
        </div>

        {/* Example prompts */}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Try these examples
          </p>
          <div className="flex flex-wrap gap-2">
            {examples.map((e, i) => (
              <button
                key={e}
                type="button"
                onClick={() => setValue(e)}
                disabled={isRunning}
                className={`fade-in stagger-${i + 1} rounded-lg border-2 border-border bg-muted/30 px-3 py-2 text-left text-xs text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-foreground disabled:opacity-50`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between gap-4 border-t-2 border-border pt-4">
          <p className="text-xs text-muted-foreground">
            {isRunning
              ? "Agents are analyzing your query..."
              : "Connected to AI agents"}
          </p>
          <Button
            type="button"
            onClick={handleSubmit}
            size="lg"
            disabled={isRunning || !value.trim()}
          >
            {isRunning ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                  />
                </svg>
                Generate Plan
              </>
            )}
          </Button>
        </div>

        {/* Error state */}
        {hasError && error && (
          <div className="fade-in rounded-xl border-2 border-destructive/30 bg-destructive/5 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-foreground">Analysis Failed</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Running state */}
        {isRunning && (
          <div className="fade-in rounded-xl border-2 border-info/30 bg-info/5 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-info text-info-foreground">
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-foreground">AI Agents Working</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  25 specialized agents are analyzing your query. Watch the activity stream for live updates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Complete state */}
        {isComplete && query && (
          <div className="fade-in rounded-xl border-2 border-success/30 bg-success/5 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-success text-success-foreground">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-foreground">Analysis Complete</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Results for: <span className="font-medium text-foreground">{query}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

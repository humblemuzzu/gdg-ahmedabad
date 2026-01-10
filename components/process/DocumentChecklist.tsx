"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProcessDocument } from "@/types";

interface DocumentChecklistProps {
  documents?: ProcessDocument[];
}

export function DocumentChecklist({ documents = [] }: DocumentChecklistProps) {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const done = documents.filter((d) => checked[d.id]).length;
  const total = documents.length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Document Checklist</CardTitle>
            <CardDescription>Gather these before you begin</CardDescription>
          </div>
          {total > 0 && (
            <Badge variant={done === total ? "success" : "outline"}>
              {done}/{total}
            </Badge>
          )}
        </div>
        {/* Progress bar */}
        {total > 0 && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {documents.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">No documents required yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Submit a query to get your checklist</p>
          </div>
        ) : (
          <>
            {documents.map((doc, i) => (
              <label
                key={doc.id}
                className={cn(
                  `fade-in stagger-${(i % 5) + 1} group flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 transition-all`,
                  checked[doc.id]
                    ? "border-success/30 bg-success/5"
                    : "border-border bg-card hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                {/* Custom checkbox */}
                <div
                  className={cn(
                    "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all",
                    checked[doc.id]
                      ? "border-success bg-success text-success-foreground"
                      : "border-border bg-card group-hover:border-primary/50"
                  )}
                >
                  {checked[doc.id] && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(checked[doc.id])}
                  onChange={(e) => setChecked((prev) => ({ ...prev, [doc.id]: e.target.checked }))}
                  className="sr-only"
                />
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-sm font-medium transition-all",
                    checked[doc.id] ? "text-muted-foreground line-through" : "text-foreground"
                  )}>
                    {doc.title}
                  </p>
                </div>
                {doc.optional && (
                  <span className="flex-shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Optional
                  </span>
                )}
              </label>
            ))}

            {/* Completion message */}
            {done === total && total > 0 && (
              <div className="fade-in mt-4 rounded-xl border-2 border-success/30 bg-success/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success text-success-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">All documents ready!</p>
                    <p className="text-xs text-muted-foreground">You&apos;re prepared to start the process</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

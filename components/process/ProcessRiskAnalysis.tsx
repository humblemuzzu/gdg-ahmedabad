import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProcessRisk } from "@/types";

function riskVariant(severity: "low" | "medium" | "high") {
  if (severity === "high") return "destructive" as const;
  if (severity === "medium") return "warning" as const;
  return "success" as const;
}

function riskIcon(severity: "low" | "medium" | "high") {
  if (severity === "high") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
    );
  }
  if (severity === "medium") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15 text-warning">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15 text-success">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    </div>
  );
}

interface ProcessRiskAnalysisProps {
  risks?: ProcessRisk[];
}

export function ProcessRiskAnalysis({ risks = [] }: ProcessRiskAnalysisProps) {
  const highCount = risks.filter(r => r.severity === "high").length;
  const mediumCount = risks.filter(r => r.severity === "medium").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Risk Analysis</CardTitle>
            <CardDescription>Top blockers and mitigations</CardDescription>
          </div>
          {risks.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-destructive">{highCount} High</span>
              <span className="text-xs text-muted-foreground">|</span>
              <span className="text-xs font-medium text-warning">{mediumCount} Medium</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">No risks identified</p>
            <p className="mt-1 text-xs text-muted-foreground">Submit a query to analyze risks</p>
          </div>
        ) : (
          risks.map((risk, i) => (
            <div
              key={risk.id}
              className={cn(
                `fade-in stagger-${(i % 5) + 1} group rounded-xl border-2 p-4 transition-all hover:shadow-md`,
                risk.severity === "high"
                  ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50"
                  : risk.severity === "medium"
                    ? "border-warning/30 bg-warning/5 hover:border-warning/50"
                    : "border-border bg-muted/30 hover:border-success/50"
              )}
            >
              <div className="flex items-start gap-4">
                {riskIcon(risk.severity)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-base font-semibold text-foreground">{risk.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{risk.mitigation}</p>
                    </div>
                    <Badge variant={riskVariant(risk.severity)} className="flex-shrink-0">
                      {risk.severity}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

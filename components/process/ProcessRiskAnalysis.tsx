import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProcess } from "@/lib/mock/process";

function riskVariant(severity: "low" | "medium" | "high") {
  if (severity === "high") return "destructive" as const;
  if (severity === "medium") return "warning" as const;
  return "outline" as const;
}

export function ProcessRiskAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk analysis</CardTitle>
        <CardDescription>Top blockers + mitigations (preview)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockProcess.risks.map((risk) => (
          <div
            key={risk.id}
            className="rounded-2xl border border-border bg-background/40 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{risk.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{risk.mitigation}</p>
              </div>
              <div className="flex-shrink-0">
                <Badge variant={riskVariant(risk.severity)}>{risk.severity.toUpperCase()}</Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


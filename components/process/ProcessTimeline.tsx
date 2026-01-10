import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { mockProcess } from "@/lib/mock/process";

export function ProcessTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>Dependency-aware steps (preview)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockProcess.steps.map((step) => (
          <div
            key={step.id}
            className="rounded-2xl border border-border bg-background/40 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Owner: {step.owner} · ETA: {step.eta}
                </p>
                {step.notes ? (
                  <p className="mt-2 text-xs text-muted-foreground">{step.notes}</p>
                ) : null}
              </div>
              <div className="flex-shrink-0">
                <StatusBadge status={step.status} />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


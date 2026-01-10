import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockActivity } from "@/lib/mock/agents";
import { cn } from "@/lib/utils";
import type { AgentActivityEvent } from "@/types";

function severityPill(severity: AgentActivityEvent["severity"]) {
  if (severity === "risk") return <Badge variant="destructive">Risk</Badge>;
  if (severity === "warning") return <Badge variant="warning">Heads up</Badge>;
  return <Badge variant="outline">Info</Badge>;
}

export function AgentActivityStream({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Agent activity</CardTitle>
            <CardDescription>Live feed placeholder (UI only)</CardDescription>
          </div>
          <Badge variant="secondary">Preview</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockActivity.map((event) => (
          <div
            key={event.id}
            className={cn(
              "rounded-2xl border border-border bg-background/40 px-4 py-3",
              event.severity === "risk" ? "border-destructive/20 bg-destructive/10" : ""
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5">
                  {event.title}{" "}
                  <span className="text-xs font-medium text-muted-foreground">· {event.agentName}</span>
                </p>
                {event.detail ? (
                  <p className="mt-1 text-xs text-muted-foreground">{event.detail}</p>
                ) : null}
              </div>
              <div className="flex flex-shrink-0 flex-col items-end gap-2">
                {severityPill(event.severity)}
                <span className="text-[11px] text-muted-foreground">{event.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

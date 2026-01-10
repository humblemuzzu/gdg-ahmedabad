import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AgentActivityStreamEvent } from "@/types";

function severityIcon(severity: AgentActivityStreamEvent["severity"]) {
  if (severity === "risk") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
    );
  }
  if (severity === "warning") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 text-warning">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/15 text-info">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      </svg>
    </div>
  );
}

function severityBadge(severity: AgentActivityStreamEvent["severity"]) {
  if (severity === "risk") return <Badge variant="destructive">Risk</Badge>;
  if (severity === "warning") return <Badge variant="warning">Alert</Badge>;
  return <Badge variant="info">Info</Badge>;
}

interface AgentActivityStreamProps {
  events?: AgentActivityStreamEvent[];
  className?: string;
}

export function AgentActivityStream({ events = [], className }: AgentActivityStreamProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Live Activity</CardTitle>
            <CardDescription>Real-time agent updates</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Agent updates will appear here</p>
          </div>
        ) : (
          events.map((event, i) => (
            <div
              key={event.id}
              className={cn(
                `fade-in stagger-${(i % 5) + 1} rounded-xl border-2 px-4 py-3 transition-all hover:shadow-sm`,
                event.severity === "risk"
                  ? "border-destructive/30 bg-destructive/5"
                  : event.severity === "warning"
                    ? "border-warning/30 bg-warning/5"
                    : "border-border bg-muted/30"
              )}
            >
              <div className="flex items-start gap-3">
                {severityIcon(event.severity)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold leading-5 text-foreground">
                        {event.title}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">{event.agentName}</p>
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      {severityBadge(event.severity)}
                      <span className="text-[10px] font-medium text-muted-foreground">{event.timestamp}</span>
                    </div>
                  </div>
                  {event.detail && (
                    <p className="mt-2 text-xs text-muted-foreground">{event.detail}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

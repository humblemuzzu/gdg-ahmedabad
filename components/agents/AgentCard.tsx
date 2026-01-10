import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types";

function statusBadge(status: Agent["status"]) {
  if (status === "done") return <Badge variant="success">Done</Badge>;
  if (status === "blocked") return <Badge variant="destructive">Blocked</Badge>;
  if (status === "working") return <Badge variant="default">Working</Badge>;
  if (status === "thinking") return <Badge variant="info">Thinking</Badge>;
  return <Badge variant="outline">Idle</Badge>;
}

function statusIndicator(status: Agent["status"]) {
  const baseClasses = "h-2 w-2 rounded-full";
  if (status === "done") return <div className={cn(baseClasses, "bg-success")} />;
  if (status === "blocked") return <div className={cn(baseClasses, "bg-destructive")} />;
  if (status === "working") return (
    <div className="relative">
      <div className={cn(baseClasses, "bg-primary")} />
      <div className={cn(baseClasses, "absolute inset-0 animate-ping bg-primary opacity-75")} />
    </div>
  );
  if (status === "thinking") return (
    <div className="relative">
      <div className={cn(baseClasses, "bg-info")} />
      <div className={cn(baseClasses, "absolute inset-0 animate-pulse bg-info")} />
    </div>
  );
  return <div className={cn(baseClasses, "bg-muted-foreground/30")} />;
}

export function AgentCard({ agent, className }: { agent: Agent; className?: string }) {
  return (
    <div
      className={cn(
        "group rounded-xl border-2 border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AgentAvatar name={agent.name} tier={agent.tier} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {statusIndicator(agent.status)}
              <p className="truncate text-sm font-semibold text-foreground">{agent.name}</p>
            </div>
            <div className="flex-shrink-0">{statusBadge(agent.status)}</div>
          </div>
          {agent.summary ? (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{agent.summary}</p>
          ) : (
            <p className="mt-1.5 text-xs italic text-muted-foreground/60">Standing by...</p>
          )}
        </div>
      </div>
    </div>
  );
}

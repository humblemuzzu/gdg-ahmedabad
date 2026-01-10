import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types";

function statusBadge(status: Agent["status"]) {
  if (status === "done") return <Badge variant="success">Done</Badge>;
  if (status === "blocked") return <Badge variant="destructive">Blocked</Badge>;
  if (status === "working") return <Badge>Working</Badge>;
  if (status === "thinking") return <Badge variant="secondary">Thinking</Badge>;
  return <Badge variant="outline">Idle</Badge>;
}

export function AgentCard({ agent, className }: { agent: Agent; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/70 px-4 py-3 shadow-sm transition-colors hover:bg-card",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AgentAvatar name={agent.name} tier={agent.tier} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold">{agent.name}</p>
            <div className="flex-shrink-0">{statusBadge(agent.status)}</div>
          </div>
          {agent.summary ? (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{agent.summary}</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Standing by…</p>
          )}
        </div>
      </div>
    </div>
  );
}


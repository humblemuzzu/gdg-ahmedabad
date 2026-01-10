import { AgentCard } from "@/components/agents/AgentCard";
import type { Agent } from "@/types";

interface AgentGridProps {
  agents?: Agent[];
  compact?: boolean;
}

export function AgentGrid({ agents = [], compact }: AgentGridProps) {
  const displayAgents = compact ? agents.slice(0, 8) : agents;
  
  if (displayAgents.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">No agents running</p>
        <p className="mt-1 text-xs text-muted-foreground">Submit a query to see agents in action</p>
      </div>
    );
  }
  
  return (
    <div className={compact ? "grid grid-cols-1 gap-4 overflow-hidden" : "grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 overflow-hidden"}>
      {displayAgents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}


import { AgentCard } from "@/components/agents/AgentCard";
import { mockAgents } from "@/lib/mock/agents";

export function AgentGrid({ compact }: { compact?: boolean }) {
  const agents = compact ? mockAgents.slice(0, 8) : mockAgents;
  return (
    <div className={compact ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 gap-3 md:grid-cols-2"}>
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}


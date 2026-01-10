import { cn } from "@/lib/utils";
import type { AgentTier } from "@/types";

const tierClasses: Record<AgentTier, string> = {
  intake: "bg-info/10 text-info ring-info/15",
  research: "bg-accent/60 text-foreground ring-accent/30",
  strategy: "bg-warning/10 text-warning ring-warning/15",
  document: "bg-success/10 text-success ring-success/15",
  execution: "bg-primary/10 text-primary ring-primary/15",
  intelligence: "bg-destructive/10 text-destructive ring-destructive/15",
};

export function AgentAvatar({
  name,
  tier,
  className,
}: {
  name: string;
  tier: AgentTier;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "grid h-10 w-10 place-items-center rounded-2xl ring-1",
        tierClasses[tier],
        className
      )}
      aria-hidden="true"
    >
      <span className="text-xs font-semibold">{initials}</span>
    </div>
  );
}

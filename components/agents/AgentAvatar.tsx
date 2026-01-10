import { cn } from "@/lib/utils";
import type { Tier } from "@/types";

const tierClasses: Record<Tier, string> = {
  intake: "bg-info text-info-foreground",
  research: "bg-accent text-accent-foreground",
  strategy: "bg-warning text-warning-foreground",
  document: "bg-success text-success-foreground",
  execution: "bg-primary text-primary-foreground",
  intelligence: "bg-secondary text-secondary-foreground",
};

// Generate consistent colors for each tier
const tierColors: Record<Tier, string> = {
  intake: "from-info/20 to-info/5",
  research: "from-accent/20 to-accent/5",
  strategy: "from-warning/20 to-warning/5",
  document: "from-success/20 to-success/5",
  execution: "from-primary/20 to-primary/5",
  intelligence: "from-secondary/20 to-secondary/5",
};

export function AgentAvatar({
  name,
  tier,
  className,
  size = "md",
}: {
  name: string;
  tier: Tier;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const sizeClasses = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-12 w-12 text-sm",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-lg font-bold",
        tierClasses[tier],
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0 rounded-lg bg-gradient-to-br opacity-50", tierColors[tier])} />
      {/* Initials */}
      <span className="relative z-10">{initials}</span>
    </div>
  );
}

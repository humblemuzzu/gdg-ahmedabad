import { cn } from "@/lib/utils";
import type { Tier } from "@/types";

// Simplified, minimal color system - subtle variations of primary
const tierClasses: Record<Tier, string> = {
  intake: "bg-primary/90 text-primary-foreground",
  research: "bg-primary/75 text-primary-foreground",
  strategy: "bg-primary/60 text-primary-foreground",
  document: "bg-primary/45 text-foreground",
  execution: "bg-primary/30 text-foreground",
  intelligence: "bg-primary/15 text-foreground",
};

// Subtle gradient overlays
const tierColors: Record<Tier, string> = {
  intake: "from-primary/10 to-transparent",
  research: "from-primary/8 to-transparent",
  strategy: "from-primary/6 to-transparent",
  document: "from-primary/4 to-transparent",
  execution: "from-primary/3 to-transparent",
  intelligence: "from-primary/2 to-transparent",
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

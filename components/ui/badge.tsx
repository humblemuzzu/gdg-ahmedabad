import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "info";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground border-2 border-primary",
  secondary: "bg-secondary text-secondary-foreground border-2 border-secondary",
  outline: "bg-transparent text-foreground border-2 border-border",
  success: "bg-success/15 text-success border-2 border-success/30",
  warning: "bg-warning/15 text-warning border-2 border-warning/30",
  destructive: "bg-destructive/15 text-destructive border-2 border-destructive/30",
  info: "bg-info/15 text-info border-2 border-info/30",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

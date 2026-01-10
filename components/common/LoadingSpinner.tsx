import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/70",
        className
      )}
      aria-label="Loading"
      role="status"
    />
  );
}


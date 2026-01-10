"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-32 w-full resize-none rounded-lg border-2 border-input bg-card px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground transition-all focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

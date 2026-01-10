"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] border-2 border-primary",
  secondary:
    "bg-secondary text-secondary-foreground border-2 border-secondary hover:bg-secondary/80 active:scale-[0.98]",
  outline:
    "border-2 border-border bg-transparent text-foreground hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-[0.98]",
  ghost:
    "bg-transparent text-foreground hover:bg-muted active:scale-[0.98]",
  destructive:
    "bg-destructive text-primary-foreground border-2 border-destructive shadow-md shadow-destructive/25 hover:bg-destructive/90 active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-md gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-12 px-6 text-base rounded-lg gap-2",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

export function Button({
  className,
  variant = "default",
  size = "md",
  asChild,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (asChild) {
    const child = props.children;
    if (React.isValidElement(child)) {
      const element = child as React.ReactElement<{ className?: string }>;
      return React.cloneElement<{ className?: string }>(element, {
        className: cn(element.props.className, classes),
      });
    }
  }

  return <button className={classes} {...props} />;
}

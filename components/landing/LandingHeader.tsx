"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/lib/context/theme-context";
import { ThemeButton } from "@/components/theme/ThemeButton";

export function LandingHeader() {
  return (
    <ThemeProvider>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-transform group-hover:scale-105">
              BB
            </div>
            <span className="font-semibold text-foreground hidden sm:block">Bureaucracy Breaker</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="#problem" className="text-muted-foreground transition-colors hover:text-foreground">
              The Problem
            </a>
            <a href="#solution" className="text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </a>
            <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeButton />
            <Button asChild size="sm">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
    </ThemeProvider>
  );
}

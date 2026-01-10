"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeButton } from "@/components/theme/ThemeButton";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Your command center for tracking progress and managing processes.",
  },
  "/process": {
    title: "Process",
    description: "Step-by-step breakdown with dependencies and documents.",
  },
  "/history": {
    title: "History",
    description: "Past plans and their outcomes.",
  },
  "/settings": {
    title: "Settings",
    description: "Configure your preferences and integrations.",
  },
};

function getPageMeta(pathname: string) {
  if (pathname === "/dashboard") return pageMeta["/dashboard"];
  if (pathname.startsWith("/process")) return pageMeta["/process"];
  if (pathname.startsWith("/history")) return pageMeta["/history"];
  if (pathname.startsWith("/settings")) return pageMeta["/settings"];
  return { title: "Workspace", description: "Navigate your bureaucratic journey." };
}

export function Header({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const { title, description } = getPageMeta(pathname);

  return (
    <header className="sticky top-0 z-30 border-b-2 border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-4 md:px-8">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-border bg-card text-foreground transition-colors hover:border-primary hover:bg-primary/5 md:hidden"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Page info */}
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {title}
            </h1>
            <p className="hidden text-sm text-muted-foreground md:block">
              {description}
            </p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Breadcrumb-style current location */}
          <div className="hidden items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground lg:flex">
            <span>Home</span>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-foreground">{title}</span>
          </div>

          {/* Theme Button */}
          <ThemeButton />

          {/* New plan CTA */}
          <Link
            href="/dashboard#new"
            className={cn(
              "hidden items-center gap-2 rounded-lg border-2 border-primary/30 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground md:inline-flex"
            )}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Plan
          </Link>

          {/* Home button */}
          <Button variant="secondary" size="sm" asChild>
            <Link href="/">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

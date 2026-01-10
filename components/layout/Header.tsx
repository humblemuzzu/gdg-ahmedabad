"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function titleFromPath(pathname: string) {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.startsWith("/process/")) return "Process";
  if (pathname.startsWith("/history")) return "History";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Workspace";
}

export function Header({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const title = titleFromPath(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden rounded-xl border border-border bg-background/60 px-3 py-2 text-sm hover:bg-muted/50"
            aria-label="Open menu"
          >
            Menu
          </button>
          <div>
            <p className="text-sm font-semibold tracking-tight">{title}</p>
            <p className="text-xs text-muted-foreground">
              Minimal, fast, and readable — built for real-world steps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard#new"
            className={cn(
              "hidden rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground md:inline-flex"
            )}
          >
            New plan
          </Link>
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}


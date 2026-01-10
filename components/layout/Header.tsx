"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme, themes, ThemeKey } from "@/lib/context/theme-context";
import { useState } from "react";

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

function ThemeDropdown() {
  const { activeTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
        title={`Theme: ${themes[activeTheme].name}`}
      >
        <svg
          className="w-4 h-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
            <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
              Light
            </div>
            {(["defaultLight", "cyanLight"] as ThemeKey[]).map((key) => (
              <button
                key={key}
                className={cn(
                  "w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-muted transition-colors text-left",
                  activeTheme === key && "bg-muted/50"
                )}
                onClick={() => {
                  setTheme(key);
                  setIsOpen(false);
                }}
              >
                <div className="flex gap-1">
                  {themes[key].preview.map((color, i) => (
                    <div
                      key={i}
                      className="h-4 w-4 rounded border border-border/50"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-sm flex-1">{themes[key].name}</span>
                {activeTheme === key && (
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}

            <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground border-t border-b border-border">
              Dark
            </div>
            {(["default", "slate"] as ThemeKey[]).map((key) => (
              <button
                key={key}
                className={cn(
                  "w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-muted transition-colors text-left",
                  activeTheme === key && "bg-muted/50"
                )}
                onClick={() => {
                  setTheme(key);
                  setIsOpen(false);
                }}
              >
                <div className="flex gap-1">
                  {themes[key].preview.map((color, i) => (
                    <div
                      key={i}
                      className="h-4 w-4 rounded border border-border/50"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-sm flex-1">{themes[key].name}</span>
                {activeTheme === key && (
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Header({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const { title, description } = getPageMeta(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted md:hidden"
            aria-label="Open menu"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Page info */}
          <div>
            <h1 className="text-lg font-medium text-foreground">
              {title}
            </h1>
            <p className="hidden text-sm text-muted-foreground md:block">
              {description}
            </p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Dropdown */}
          <ThemeDropdown />

          {/* New plan CTA */}
          <Link
            href="/dashboard#new"
            className="hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Plan
          </Link>
        </div>
      </div>
    </header>
  );
}

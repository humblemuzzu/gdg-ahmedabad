"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useCaseStore } from "@/lib/hooks/use-case-store";
import { useTheme, themes, ThemeKey } from "@/lib/context/theme-context";

const nav = [
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  { 
    href: "/history", 
    label: "History", 
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    href: "/settings", 
    label: "Settings", 
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
];

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function Sidebar({
  open,
  onClose,
  isCollapsed: externalIsCollapsed,
  onCollapsedChange,
}: {
  open: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const [internalIsCollapsed, setInternalIsCollapsed] = React.useState(false);
  const { cases } = useCaseStore();
  const { activeTheme, setTheme } = useTheme();
  const themeKeys: ThemeKey[] = ["defaultLight", "cyanLight", "default", "slate"];
  
  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  const setIsCollapsed = onCollapsedChange || setInternalIsCollapsed;

  // Get recent cases (last 5)
  const recentCases = cases.slice(0, 5);

  const cycleTheme = () => {
    const currentIndex = themeKeys.indexOf(activeTheme);
    const nextTheme = themeKeys[(currentIndex + 1) % themeKeys.length];
    setTheme(nextTheme);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-border bg-sidebar transition-all duration-200 ease-out",
          isCollapsed ? "w-14" : "w-60",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn(
            "flex items-center h-14",
            isCollapsed ? "justify-center px-2" : "justify-between px-3"
          )}>
            <Link
              href="/"
              className="flex items-center gap-2.5 overflow-hidden"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-semibold text-primary-foreground">
                  BB
                </span>
              </div>
              {!isCollapsed && (
                <span className="text-sm font-medium text-sidebar-foreground truncate">
                  Bureaucracy Breaker
                </span>
              )}
            </Link>

            {/* Collapse Button - Desktop only */}
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
                title="Collapse sidebar"
              >
                <svg className="w-4 h-4 text-sidebar-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              type="button"
              className="absolute right-3 top-3.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-sidebar-accent transition-colors lg:hidden"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              ESC
            </button>
          </div>

          {/* Expand button when collapsed */}
          {isCollapsed && (
            <div className="px-2 py-2">
              <button
                onClick={() => setIsCollapsed(false)}
                className="hidden lg:flex w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors justify-center"
                title="Expand sidebar"
              >
                <svg className="w-4 h-4 text-sidebar-muted rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>
          )}

          {/* New Analysis Button */}
          <div className={cn("px-2 py-2", isCollapsed ? "pt-0" : "")}>
            <Link
              href="/dashboard"
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90",
                isCollapsed ? "justify-center p-2" : "px-3 py-2"
              )}
              title={isCollapsed ? "New Analysis" : undefined}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {!isCollapsed && <span className="text-sm font-medium">New Analysis</span>}
            </Link>
          </div>

          {/* Navigation */}
          <nav className={cn("px-2 py-2", isCollapsed ? "space-y-1" : "space-y-0.5")}>
            {nav.map((item) => {
              const active = pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                      : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Recent Reports - Only when expanded */}
          {!isCollapsed && recentCases.length > 0 && (
            <div className="flex-1 overflow-y-auto px-2 py-3 border-t border-border">
              <p className="px-2.5 pb-2 text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
                Recent
              </p>
              <div className="space-y-0.5">
                {recentCases.map((record) => (
                  <Link
                    key={record.id}
                    href={`/report/${record.id}`}
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors group"
                  >
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full flex-shrink-0",
                      record.status === "completed" ? "bg-emerald-500" :
                      record.status === "processing" ? "bg-blue-500" :
                      record.status === "failed" ? "bg-red-500" : "bg-muted-foreground"
                    )} />
                    <span className="truncate flex-1 text-[13px]">
                      {record.businessName || record.query.slice(0, 30)}
                    </span>
                    <span className="text-[11px] text-sidebar-muted/70 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatTimeAgo(record.createdAt)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Spacer when collapsed or no recent cases */}
          {(isCollapsed || recentCases.length === 0) && <div className="flex-1" />}

          {/* Bottom Section */}
          <div className={cn(
            "border-t border-border",
            isCollapsed ? "px-2 py-2 space-y-1" : "px-2 py-2 space-y-0.5"
          )}>
            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors w-full",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? `Theme: ${themes[activeTheme].name}` : undefined}
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              {!isCollapsed && <span>Theme</span>}
            </button>

            {/* User/Status indicator */}
            <div className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2",
              isCollapsed && "justify-center px-2"
            )}>
              <div className="relative flex-shrink-0">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-emerald-500 opacity-50" />
              </div>
              {!isCollapsed && (
                <span className="text-[11px] text-sidebar-muted">System ready</span>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

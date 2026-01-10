"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/utils";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

const nav = [
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  { 
    href: "/history", 
    label: "History", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    href: "/settings", 
    label: "Settings", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
];

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
  
  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  const setIsCollapsed = onCollapsedChange || setInternalIsCollapsed;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-border bg-sidebar transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-72",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Header with Logo and Collapse Button */}
          <div className={cn(
            "flex-shrink-0 border-b border-border",
            isCollapsed ? "px-4 py-6" : "px-6 py-6"
          )}>
            <div className={cn(
              "flex items-center gap-4",
              isCollapsed ? "flex-col" : "justify-between"
            )}>
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-3 overflow-hidden transition-all",
                  isCollapsed && "flex-col gap-2"
                )}
              >
                <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary shadow-lg">
                  <span className="font-display text-lg font-bold text-primary-foreground">
                    BB
                  </span>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-tl-lg bg-accent" />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 leading-tight">
                    <p className="font-display text-base font-semibold tracking-tight text-sidebar-foreground">
                      Bureaucracy
                    </p>
                    <p className="font-display text-base font-semibold tracking-tight text-primary">
                      Breaker
                    </p>
                  </div>
                )}
              </Link>

              {/* Collapse Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "hidden lg:flex p-2 rounded-lg hover:bg-sidebar-accent transition-all flex-shrink-0 group",
                  isCollapsed && "mt-2"
                )}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <svg
                  className={cn(
                    "w-4 h-4 text-sidebar-muted transition-all duration-300 group-hover:text-sidebar-foreground",
                    isCollapsed && "rotate-180"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>

              {/* Mobile Close Button */}
              <button
                type="button"
                className="absolute right-4 top-6 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground lg:hidden"
                onClick={onClose}
                aria-label="Close sidebar"
              >
                ESC
              </button>
            </div>
          </div>

          {/* Quick Action Button */}
          {!isCollapsed && (
            <div className="flex-shrink-0 border-b border-border px-5 py-5">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="group flex items-center gap-3 rounded-xl border-2 border-dashed border-sidebar-border bg-sidebar-accent/50 px-4 py-4 transition-all hover:border-primary hover:bg-primary/5 hover-lift"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground">Start New Analysis</p>
                  <p className="text-xs text-sidebar-muted">Get your battle plan</p>
                </div>
              </Link>
            </div>
          )}

          {isCollapsed && (
            <div className="flex-shrink-0 border-b border-border px-3 py-4">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center justify-center rounded-xl bg-primary p-3 shadow-lg transition-all hover:shadow-xl hover:scale-105"
                title="Start New Analysis"
              >
                <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </Link>
            </div>
          )}

          {/* Navigation - Scrollable */}
          <nav className={cn(
            "flex-1 overflow-y-auto pt-6",
            isCollapsed ? "px-3" : "px-4"
          )}>
            {!isCollapsed && (
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-sidebar-muted">
                Navigation
              </p>
            )}
            <div className="space-y-2">
              {nav.map((item) => {
                const active = pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:shadow-sm",
                      isCollapsed && "justify-center px-3"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className={cn(
                      "transition-transform duration-200 flex-shrink-0",
                      !isCollapsed && active && "scale-110"
                    )}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Agent Status */}
          <div className="flex-shrink-0 border-t border-border px-5 py-5">
            {!isCollapsed ? (
              <div className="flex items-center gap-3 rounded-lg bg-success/10 px-4 py-3">
                <div className="relative flex-shrink-0">
                  <div className="h-2.5 w-2.5 rounded-full bg-success" />
                  <div className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full bg-success opacity-75" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-sidebar-foreground">All Systems Active</p>
                  <p className="text-[11px] text-sidebar-muted truncate">25 agents ready</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-2.5 w-2.5 rounded-full bg-success" />
                  <div className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full bg-success opacity-75" />
                </div>
              </div>
            )}
          </div>

          {/* Theme Selector */}
          <div className="flex-shrink-0 border-t border-border py-2">
            <ThemeSelector isCollapsed={isCollapsed} />
          </div>

          {/* Help Section */}
          {!isCollapsed ? (
            <div className="flex-shrink-0 border-t border-border px-5 py-4">
              <div className="rounded-xl bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors">
                <p className="text-xs font-semibold text-foreground">Need Help?</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Check our documentation
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0 border-t border-border px-3 py-4">
              <button
                className="w-full p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all group"
                title="Need Help?"
              >
                <svg className="w-5 h-5 mx-auto text-muted-foreground group-hover:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          )}

          {/* Version Footer */}
          <div className="flex-shrink-0 border-t border-border px-5 py-3">
            {!isCollapsed ? (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-sidebar-muted">Version 0.1</span>
                <span className="rounded-md bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">BETA</span>
              </div>
            ) : (
              <div className="flex justify-center">
                <span className="rounded-md bg-accent/20 px-1.5 py-0.5 text-[9px] font-bold text-accent">β</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

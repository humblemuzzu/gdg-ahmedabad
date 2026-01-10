"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", shortcut: "D" },
  { href: "/process/demo", label: "Process", shortcut: "P" },
  { href: "/history", label: "History", shortcut: "H" },
  { href: "/settings", label: "Settings", shortcut: "S" },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[260px] border-r-2 border-sidebar-border bg-sidebar transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b-2 border-sidebar-border px-5 py-5">
            <Link href="/" className="group flex items-center gap-3">
              {/* Bold monogram logo */}
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-primary">
                <span className="font-display text-lg font-bold text-primary-foreground">
                  BB
                </span>
                {/* Decorative corner accent */}
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-tl bg-accent" />
              </div>
              <div className="leading-tight">
                <p className="font-display text-base font-semibold tracking-tight text-sidebar-foreground">
                  Bureaucracy
                </p>
                <p className="font-display text-base font-semibold tracking-tight text-primary">
                  Breaker
                </p>
              </div>
            </Link>

            {/* Mobile close */}
            <button
              type="button"
              className="absolute right-4 top-5 rounded-md border-2 border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground md:hidden"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              ESC
            </button>
          </div>

          {/* Quick action banner */}
          <div className="border-b border-sidebar-border px-4 py-4">
            <Link
              href="/dashboard#new"
              className="group flex items-center gap-3 rounded-lg border-2 border-dashed border-sidebar-border bg-sidebar-accent/50 px-4 py-3 transition-all hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-sidebar-foreground">New Plan</p>
                <p className="text-xs text-sidebar-muted">Start fresh</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-sidebar-muted">
              Workspace
            </p>
            <div className="space-y-1">
              {nav.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : item.href.startsWith("/process")
                      ? pathname?.startsWith("/process")
                      : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <span>{item.label}</span>
                    <kbd
                      className={cn(
                        "hidden rounded px-1.5 py-0.5 font-mono text-[10px] font-medium md:inline-block",
                        active
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-sidebar-accent text-sidebar-muted group-hover:bg-sidebar-border"
                      )}
                    >
                      {item.shortcut}
                    </kbd>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer status */}
          <div className="border-t-2 border-sidebar-border px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-success" />
                <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-success opacity-75" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground">System Online</p>
                <p className="text-[11px] text-sidebar-muted truncate">All agents operational</p>
              </div>
            </div>
          </div>

          {/* Version tag */}
          <div className="border-t border-sidebar-border px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-sidebar-muted">v0.1 Preview</span>
              <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent">BETA</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

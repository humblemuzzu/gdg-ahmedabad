"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/process/demo", label: "Process" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
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
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-[280px] border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:sticky md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5">
            <Link href="/" className="group flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <span className="text-sm font-semibold tracking-tight">BB</span>
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-foreground">Bureaucracy Breaker</p>
                <p className="text-xs text-muted-foreground">Process GPS</p>
              </div>
            </Link>
            <button
              type="button"
              className="md:hidden rounded-xl border border-border bg-background/50 px-3 py-2 text-xs hover:bg-muted/50"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              Close
            </button>
          </div>

          <div className="px-3 pb-4">
            <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent px-4 py-3">
              <p className="text-xs font-medium text-sidebar-foreground">Quick start</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create a new plan, then track documents and risks.
              </p>
            </div>
          </div>

          <nav className="flex-1 px-3">
            <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
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
                      "flex items-center justify-between rounded-2xl px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/10 text-foreground ring-1 ring-primary/15"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                    )}
                  >
                    <span className="font-medium">{item.label}</span>
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        active ? "bg-primary" : "bg-border"
                      )}
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="px-5 py-5">
            <div className="rounded-2xl border border-sidebar-border bg-background/30 px-4 py-3">
              <p className="text-xs font-semibold">UI shell</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Core orchestration will be wired next. This layout is ready.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

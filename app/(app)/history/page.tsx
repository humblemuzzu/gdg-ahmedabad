"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCaseStore } from "@/lib/hooks/use-case-store";
import type { CaseRecord } from "@/lib/storage/caseStore";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function CaseCard({ record, onDelete }: { record: CaseRecord; onDelete: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting) return;
    
    if (confirm("Delete this analysis? This cannot be undone.")) {
      setIsDeleting(true);
      await onDelete();
    }
  };

  const statusConfig = {
    completed: { variant: "success" as const, bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400" },
    processing: { variant: "info" as const, bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400" },
    pending: { variant: "outline" as const, bg: "bg-muted/50", text: "text-muted-foreground" },
    failed: { variant: "destructive" as const, bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400" },
  }[record.status];

  return (
    <Link href={`/report/${record.id}`} className="block group">
      <div className="relative rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
        {/* Top Section */}
        <div className="space-y-3">
          {/* Title */}
          <h3 className="text-lg font-medium text-foreground leading-snug pr-4">
            {record.query.length > 80 ? record.query.slice(0, 80) + "..." : record.query}
          </h3>
          
          {/* Subtitle & Status */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={statusConfig.variant} className="capitalize font-medium px-3 py-1">
              {record.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {record.businessName || "Business Analysis"}
              {record.location && ` • ${record.location}`}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 border-t border-border/40" />

        {/* Bottom Section - Stats & Actions */}
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-5 text-sm">
            {record.licensesCount !== undefined && record.licensesCount > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/60">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span>{record.licensesCount} licenses</span>
              </div>
            )}
            {record.riskScore !== undefined && (
              <div className={`flex items-center gap-2 ${
                record.riskScore > 6 ? "text-destructive" : 
                record.riskScore > 3 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
              }`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                  record.riskScore > 6 ? "bg-red-100 dark:bg-red-950/40" : 
                  record.riskScore > 3 ? "bg-amber-100 dark:bg-amber-950/40" : "bg-emerald-100 dark:bg-emerald-950/40"
                }`}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <span className="font-medium">{record.riskScore}/10</span>
              </div>
            )}
            {record.totalDaysMin !== undefined && record.totalDaysMax !== undefined && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/60">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>
                  {record.totalDaysMin === record.totalDaysMax 
                    ? `${record.totalDaysMin} days` 
                    : `${record.totalDaysMin}-${record.totalDaysMax} days`}
                </span>
              </div>
            )}
          </div>

          {/* Time and delete */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {formatDate(record.createdAt)}
            </span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
              title="Delete"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error message */}
        {record.error && (
          <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">
              {record.error}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function HistoryPage() {
  const { cases, analytics, isLoading, removeCase, refresh } = useCaseStore();
  const [filter, setFilter] = useState<"all" | "completed" | "processing" | "failed">("all");

  const filteredCases = filter === "all" 
    ? cases 
    : cases.filter(c => c.status === filter);

  const filterCounts = {
    all: cases.length,
    completed: cases.filter(c => c.status === "completed").length,
    processing: cases.filter(c => c.status === "processing").length,
    failed: cases.filter(c => c.status === "failed").length,
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">History</h1>
          <p className="text-muted-foreground">
            Your previous analyses, stored locally
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-border/60 bg-background hover:bg-muted/50 transition-all hover:border-border"
        >
          <svg className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Analytics */}
      {analytics && analytics.totalCases > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Plans */}
          <div className="group relative rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/20 p-6 transition-all hover:border-border hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight">{analytics.totalCases}</p>
                <p className="text-sm text-muted-foreground">Total Plans</p>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="group relative rounded-2xl border border-border/50 bg-gradient-to-br from-background to-emerald-500/5 p-6 transition-all hover:border-emerald-500/30 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">{analytics.completedCases}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>

          {/* Avg Risk */}
          <div className={`group relative rounded-2xl border border-border/50 p-6 transition-all hover:shadow-md ${
            analytics.avgRiskScore > 6 
              ? "bg-gradient-to-br from-background to-red-500/5 hover:border-red-500/30" 
              : analytics.avgRiskScore > 3 
                ? "bg-gradient-to-br from-background to-amber-500/5 hover:border-amber-500/30" 
                : "bg-gradient-to-br from-background to-emerald-500/5 hover:border-emerald-500/30"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                analytics.avgRiskScore > 6 
                  ? "bg-red-500/10 text-red-600 dark:text-red-400" 
                  : analytics.avgRiskScore > 3 
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <p className={`text-3xl font-semibold tracking-tight ${
                  analytics.avgRiskScore > 6 ? "text-red-600 dark:text-red-400" : 
                  analytics.avgRiskScore > 3 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                }`}>
                  {analytics.avgRiskScore}<span className="text-lg text-muted-foreground">/10</span>
                </p>
                <p className="text-sm text-muted-foreground">Avg Risk Score</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs - Pill style */}
      {cases.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "completed", "processing", "failed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all capitalize ${
                filter === f 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f}
              <span className={`ml-2 text-xs ${filter === f ? "opacity-80" : "opacity-60"}`}>
                {filterCounts[f]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Cases list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <p className="text-sm">Loading your history...</p>
          </div>
        </div>
      ) : filteredCases.length > 0 ? (
        <div className="space-y-4">
          {filteredCases.map((record) => (
            <CaseCard 
              key={record.id} 
              record={record} 
              onDelete={() => removeCase(record.id)}
            />
          ))}
        </div>
      ) : cases.length > 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-muted-foreground">No {filter} analyses found</p>
          <button 
            onClick={() => setFilter("all")}
            className="mt-3 text-sm text-primary hover:underline"
          >
            View all analyses
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No analyses yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Your analysis history will appear here. All data is stored locally in your browser.
          </p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Start your first analysis
          </Link>
        </div>
      )}
    </div>
  );
}

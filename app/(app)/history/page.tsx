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

  const statusVariant = {
    completed: "success",
    processing: "info",
    pending: "outline",
    failed: "destructive",
  }[record.status] as "success" | "info" | "outline" | "destructive";

  return (
    <Link href={`/history/${record.id}`}>
      <Card className="transition-all hover:border-primary/50 hover:shadow-md cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-medium truncate">
                {record.query.length > 60 ? record.query.slice(0, 60) + "..." : record.query}
              </CardTitle>
              <CardDescription className="mt-1">
                {record.businessName || "Business Analysis"} 
                {record.location && ` • ${record.location}`}
              </CardDescription>
            </div>
            <Badge variant={statusVariant} className="flex-shrink-0 capitalize">
              {record.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {record.licensesCount !== undefined && record.licensesCount > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {record.licensesCount} licenses
                </span>
              )}
              {record.riskScore !== undefined && (
                <span className={`flex items-center gap-1 ${
                  record.riskScore > 6 ? "text-destructive" : 
                  record.riskScore > 3 ? "text-warning" : "text-success"
                }`}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  Risk: {record.riskScore}/10
                </span>
              )}
              {record.totalDaysMin !== undefined && record.totalDaysMax !== undefined && (
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {record.totalDaysMin === record.totalDaysMax 
                    ? `${record.totalDaysMin}d` 
                    : `${record.totalDaysMin}-${record.totalDaysMax}d`}
                </span>
              )}
            </div>

            {/* Time and delete */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {formatDate(record.createdAt)}
              </span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Delete"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Error message */}
          {record.error && (
            <p className="mt-2 text-sm text-destructive truncate">
              Error: {record.error}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function HistoryPage() {
  const { cases, analytics, isLoading, removeCase, refresh } = useCaseStore();
  const [filter, setFilter] = useState<"all" | "completed" | "processing" | "failed">("all");

  const filteredCases = filter === "all" 
    ? cases 
    : cases.filter(c => c.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">History</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your previous analyses are saved locally in your browser.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <svg className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Analytics */}
      {analytics && analytics.totalCases > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Analyses</p>
              <p className="text-2xl font-bold">{analytics.totalCases}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-success">{analytics.completedCases}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Avg. Risk Score</p>
              <p className={`text-2xl font-bold ${
                analytics.avgRiskScore > 6 ? "text-destructive" : 
                analytics.avgRiskScore > 3 ? "text-warning" : "text-success"
              }`}>
                {analytics.avgRiskScore}/10
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total High Risks</p>
              <p className="text-2xl font-bold text-destructive">{analytics.totalHighRisks}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter tabs */}
      {cases.length > 0 && (
        <div className="flex items-center gap-2 border-b border-border">
          {(["all", "completed", "processing", "failed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                filter === f 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
              {f !== "all" && (
                <span className="ml-1.5 text-xs">
                  ({cases.filter(c => c.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Cases list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Loading history...
          </div>
        </div>
      ) : filteredCases.length > 0 ? (
        <div className="space-y-3">
          {filteredCases.map((record) => (
            <CaseCard 
              key={record.id} 
              record={record} 
              onDelete={() => removeCase(record.id)}
            />
          ))}
        </div>
      ) : cases.length > 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No {filter} analyses found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No saved analyses</CardTitle>
            <CardDescription>
              Your analysis history will appear here. All data is stored locally in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm text-muted-foreground">
              Tip: Run analyses for common tasks like GST, FSSAI, and trade licenses to build your reference library.
            </div>
            <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
              Start a new analysis
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

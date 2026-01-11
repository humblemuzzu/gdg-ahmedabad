"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { VerificationInfo, VerificationSummary, VerificationSource } from "@/types";

// ================================
// VERIFICATION BADGE
// ================================

interface VerificationBadgeProps {
  verification?: VerificationInfo;
  size?: "sm" | "md";
  showConfidence?: boolean;
}

const sourceLabels: Record<VerificationSource, string> = {
  official_portal: "Official",
  live_search: "Live Verified",
  knowledge_base: "Database",
  estimated: "Estimated",
  cached: "Cached",
};

const sourceColors: Record<VerificationSource, string> = {
  official_portal: "bg-success/10 text-success border-success/20",
  live_search: "bg-success/10 text-success border-success/20",
  knowledge_base: "bg-info/10 text-info border-info/20",
  estimated: "bg-warning/10 text-warning border-warning/20",
  cached: "bg-muted/50 text-muted-foreground border-muted",
};

export function VerificationBadge({ verification, size = "sm", showConfidence = false }: VerificationBadgeProps) {
  if (!verification) {
    return null;
  }

  const source = verification.source || "estimated";
  const label = sourceLabels[source] || "Unknown";
  const colorClass = sourceColors[source] || sourceColors.estimated;
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <Badge 
      variant="outline" 
      className={`${colorClass} ${sizeClass} font-medium gap-1`}
    >
      {verification.verified && (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {label}
      {showConfidence && verification.confidence > 0 && (
        <span className="opacity-70">({Math.round(verification.confidence * 100)}%)</span>
      )}
      {verification.fromCache && (
        <span className="opacity-60">(cached)</span>
      )}
    </Badge>
  );
}

// ================================
// CONFIDENCE METER
// ================================

interface ConfidenceMeterProps {
  confidence: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ConfidenceMeter({ confidence, size = "sm", showLabel = true }: ConfidenceMeterProps) {
  const percentage = Math.round(confidence * 100);
  
  const color = 
    confidence >= 0.8 ? "bg-success" :
    confidence >= 0.6 ? "bg-warning" :
    confidence >= 0.4 ? "bg-orange-500" :
    "bg-destructive";

  const textColor = 
    confidence >= 0.8 ? "text-success" :
    confidence >= 0.6 ? "text-warning" :
    confidence >= 0.4 ? "text-orange-500" :
    "text-destructive";

  const heights = { sm: "h-1", md: "h-1.5", lg: "h-2" };
  const widths = { sm: "w-12", md: "w-16", lg: "w-24" };

  return (
    <div className="flex items-center gap-2">
      <div className={`${widths[size]} ${heights[size]} bg-muted rounded-full overflow-hidden`}>
        <div 
          className={`${heights[size]} ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${textColor}`}>
          {percentage}%
        </span>
      )}
    </div>
  );
}

// ================================
// VERIFICATION SUMMARY BADGE
// ================================

interface VerificationSummaryBadgeProps {
  summary?: VerificationSummary;
  showTimestamp?: boolean;
}

export function VerificationSummaryBadge({ summary, showTimestamp = true }: VerificationSummaryBadgeProps) {
  if (!summary) {
    return null;
  }

  const { verifiedCount, totalItems, overallConfidence, lastUpdated } = summary;
  const percentage = totalItems > 0 ? Math.round((verifiedCount / totalItems) * 100) : 0;

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
      <div className="flex items-center gap-1.5">
        <svg className="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>{verifiedCount}/{totalItems} verified ({percentage}%)</span>
      </div>
      <span className="text-muted-foreground/50">•</span>
      <ConfidenceMeter confidence={overallConfidence} size="sm" />
      {showTimestamp && lastUpdated && (
        <>
          <span className="text-muted-foreground/50">•</span>
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {lastUpdated}
          </span>
        </>
      )}
    </div>
  );
}

// ================================
// DATA SOURCE INDICATOR
// ================================

interface DataSourceIndicatorProps {
  hasLiveData?: boolean;
  isLoading?: boolean;
  lastVerified?: string;
}

export function DataSourceIndicator({ hasLiveData, isLoading, lastVerified }: DataSourceIndicatorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-info">
        <div className="relative">
          <div className="h-2 w-2 rounded-full bg-info animate-ping absolute" />
          <div className="h-2 w-2 rounded-full bg-info" />
        </div>
        <span className="animate-pulse">Verifying with live sources...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {hasLiveData ? (
        <>
          <div className="h-2 w-2 rounded-full bg-success" />
          <span className="text-success">Live data verified</span>
          {lastVerified && (
            <span className="text-muted-foreground">• {lastVerified}</span>
          )}
        </>
      ) : (
        <>
          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
          <span className="text-muted-foreground">Using knowledge base</span>
        </>
      )}
    </div>
  );
}

// ================================
// SOURCE LINK
// ================================

interface SourceLinkProps {
  sourceName?: string;
  sourceUrl?: string;
  className?: string;
}

export function SourceLink({ sourceName, sourceUrl, className = "" }: SourceLinkProps) {
  if (!sourceName && !sourceUrl) {
    return null;
  }

  const displayName = sourceName || "View Source";

  if (sourceUrl) {
    return (
      <a 
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 text-xs text-info hover:text-info/80 hover:underline transition-colors ${className}`}
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        {displayName}
      </a>
    );
  }

  return (
    <span className={`text-xs text-muted-foreground ${className}`}>
      Source: {displayName}
    </span>
  );
}

// ================================
// VERIFICATION LOG ENTRY
// ================================

export interface VerificationLogEntry {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  item: string;
  result: "verified" | "updated" | "cached" | "failed" | "skipped";
  oldValue?: string;
  newValue?: string;
  source?: string;
  sourceUrl?: string;
  confidence?: number;
  duration?: number; // ms
}

interface VerificationLogEntryProps {
  entry: VerificationLogEntry;
}

const resultColors: Record<VerificationLogEntry["result"], string> = {
  verified: "text-success",
  updated: "text-warning",
  cached: "text-muted-foreground",
  failed: "text-destructive",
  skipped: "text-muted-foreground",
};

const resultIcons: Record<VerificationLogEntry["result"], React.ReactNode> = {
  verified: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  updated: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  cached: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  failed: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  skipped: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  ),
};

export function VerificationLogEntryRow({ entry }: VerificationLogEntryProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0">
      <div className={`mt-0.5 ${resultColors[entry.result]}`}>
        {resultIcons[entry.result]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">{entry.timestamp}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {entry.agent}
          </Badge>
        </div>
        <p className="text-sm mt-1">
          <span className={resultColors[entry.result] + " font-medium"}>
            {entry.result.charAt(0).toUpperCase() + entry.result.slice(1)}:
          </span>{" "}
          {entry.item}
        </p>
        {entry.result === "updated" && entry.oldValue && entry.newValue && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className="line-through">{entry.oldValue}</span>
            <span className="mx-2">→</span>
            <span className="text-warning font-medium">{entry.newValue}</span>
          </p>
        )}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {entry.source && (
            <SourceLink sourceName={entry.source} sourceUrl={entry.sourceUrl} />
          )}
          {entry.confidence !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Confidence:</span>
              <ConfidenceMeter confidence={entry.confidence} size="sm" />
            </div>
          )}
          {entry.duration !== undefined && (
            <span className="text-xs text-muted-foreground">
              {entry.duration}ms
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================
// VERIFICATION LOG PANEL
// ================================

interface VerificationLogPanelProps {
  entries: VerificationLogEntry[];
  title?: string;
  isLoading?: boolean;
  maxHeight?: string;
}

export function VerificationLogPanel({ 
  entries, 
  title = "Verification Log", 
  isLoading = false,
  maxHeight = "400px"
}: VerificationLogPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const verified = entries.filter(e => e.result === "verified").length;
  const updated = entries.filter(e => e.result === "updated").length;
  const failed = entries.filter(e => e.result === "failed").length;

  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {entries.length} checks • {verified} verified • {updated} updated • {failed} failed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-info">
              <div className="h-2 w-2 rounded-full bg-info animate-ping" />
              <span>Verifying...</span>
            </div>
          )}
          <svg 
            className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div 
          className="border-t border-border/50 overflow-y-auto px-4"
          style={{ maxHeight }}
        >
          {entries.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">No verification entries yet</p>
            </div>
          ) : (
            entries.map((entry) => (
              <VerificationLogEntryRow key={entry.id} entry={entry} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ================================
// LIVE VERIFICATION LOADER
// ================================

interface LiveVerificationLoaderProps {
  agentName?: string;
  itemName?: string;
  progress?: number; // 0-100
}

export function LiveVerificationLoader({ 
  agentName = "Cost Calculator", 
  itemName = "government fees",
  progress
}: LiveVerificationLoaderProps) {
  return (
    <div className="bg-info/5 rounded-xl p-4 border border-info/20">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-8 w-8 rounded-full border-2 border-info/30 border-t-info animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-info">
            {agentName} is verifying {itemName}...
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-referencing with official government sources
          </p>
        </div>
      </div>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-info rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">{progress}% complete</p>
        </div>
      )}
    </div>
  );
}

// ================================
// TIMESTAMP BADGE
// ================================

interface TimestampBadgeProps {
  timestamp?: string;
  label?: string;
  variant?: "default" | "success" | "warning";
}

export function TimestampBadge({ timestamp, label = "Last verified", variant = "default" }: TimestampBadgeProps) {
  if (!timestamp) return null;

  const colors = {
    default: "text-muted-foreground",
    success: "text-success",
    warning: "text-warning",
  };

  return (
    <div className={`flex items-center gap-1.5 text-xs ${colors[variant]}`}>
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{label}: {timestamp}</span>
    </div>
  );
}

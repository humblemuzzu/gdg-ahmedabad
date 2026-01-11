"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PerplexityStatusData {
  isActive: boolean;
  keyStatus: string;
  stats?: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    cacheHits: number;
    fallbackCalls: number;
  };
  message: string;
}

interface TestResult {
  passed: boolean;
  error?: string;
  response?: string;
  message: string;
}

export function PerplexityStatus() {
  const [status, setStatus] = useState<PerplexityStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/perplexity-status");
      const data = await res.json();
      if (data.success) {
        setStatus(data.perplexity);
      }
    } catch (error) {
      console.error("Failed to fetch Perplexity status:", error);
    } finally {
      setLoading(false);
    }
  };

  const testApi = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/perplexity-status", { method: "POST" });
      const data = await res.json();
      setTestResult(data.test);
      // Refresh status after test
      fetchStatus();
    } catch (error) {
      setTestResult({
        passed: false,
        error: String(error),
        message: "Failed to connect to test endpoint",
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!status) {
    return null;
  }

  const isActive = status.isActive;
  const hasStats = status.stats && (status.stats.totalCalls > 0 || status.stats.cacheHits > 0);

  return (
    <div className="relative">
      {/* Compact Badge - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm"
      >
        <span className={`h-2 w-2 rounded-full ${isActive ? "bg-success" : "bg-warning"}`} />
        <span className="text-muted-foreground">
          {isActive ? "Live Verification" : "Static Data"}
        </span>
        <svg
          className={`h-3 w-3 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Panel */}
      {expanded && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-border bg-card shadow-lg p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-sm">Perplexity API Status</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{status.message}</p>
            </div>
            <Badge 
              variant="outline" 
              className={isActive 
                ? "bg-success/10 text-success border-success/20" 
                : "bg-warning/10 text-warning border-warning/20"
              }
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Status Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">API Key Status:</span>
              <span className={`font-medium ${
                status.keyStatus === "configured" ? "text-success" : 
                status.keyStatus === "invalid" ? "text-destructive" : "text-warning"
              }`}>
                {status.keyStatus === "configured" ? "Configured" : 
                 status.keyStatus === "invalid" ? "Invalid" : "Missing"}
              </span>
            </div>
            
            {hasStats && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total API Calls:</span>
                  <span className="font-medium">{status.stats?.totalCalls || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Successful:</span>
                  <span className="font-medium text-success">{status.stats?.successfulCalls || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cache Hits:</span>
                  <span className="font-medium text-info">{status.stats?.cacheHits || 0}</span>
                </div>
                {(status.stats?.failedCalls || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Failed:</span>
                    <span className="font-medium text-destructive">{status.stats?.failedCalls}</span>
                  </div>
                )}
                {(status.stats?.fallbackCalls || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Fallback (no key):</span>
                    <span className="font-medium text-warning">{status.stats?.fallbackCalls}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Test Button */}
          <div className="pt-2 border-t border-border">
            <Button 
              onClick={testApi} 
              disabled={testing}
              size="sm"
              variant={isActive ? "outline" : "default"}
              className="w-full"
            >
              {testing ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Testing...
                </>
              ) : (
                "Test API Connection"
              )}
            </Button>

            {/* Test Result */}
            {testResult && (
              <div className={`mt-2 p-2 rounded-lg text-xs ${
                testResult.passed 
                  ? "bg-success/10 text-success" 
                  : "bg-destructive/10 text-destructive"
              }`}>
                {testResult.passed ? (
                  <div className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {testResult.message}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {testResult.message}
                    </div>
                    {testResult.error && (
                      <p className="mt-1 text-[10px] opacity-80">{testResult.error}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Help Text for Missing Key */}
          {!isActive && (
            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              <p className="font-medium mb-1">To enable live verification:</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Get API key from perplexity.ai/settings/api</li>
                <li>Add to .env.local: PERPLEXITY_API_KEY=your_key</li>
                <li>Restart the dev server</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Simple inline status indicator (for headers/navs)
export function PerplexityStatusBadge() {
  const [isActive, setIsActive] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/perplexity-status")
      .then(res => res.json())
      .then(data => setIsActive(data.perplexity?.isActive ?? false))
      .catch(() => setIsActive(false));
  }, []);

  if (isActive === null) return null;

  return (
    <Badge 
      variant="outline" 
      className={`text-[10px] ${
        isActive 
          ? "bg-success/10 text-success border-success/20" 
          : "bg-muted text-muted-foreground border-muted"
      }`}
    >
      {isActive ? "Live Data" : "Static Data"}
    </Badge>
  );
}

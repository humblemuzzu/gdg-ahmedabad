"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FinalReport } from "@/components/process/FinalReport";
import { getCaseRecord, getCaseResult, getCaseEvents, deleteCase, type CaseRecord } from "@/lib/storage/caseStore";
import type { ProcessResult, ProcessStep, ProcessCost, ProcessRisk, ProcessDocument, AgentActivityStreamEvent } from "@/types";

// Convert ProcessResult to UI-friendly formats (same as use-analysis.ts)
function resultToSteps(result: ProcessResult): ProcessStep[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawResult = result as any;
  const timeline = rawResult.timeline?.items || rawResult.timeline;
  if (!Array.isArray(timeline) || !timeline.length) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return timeline.map((item: any, idx: number) => ({
    id: String(item.id || `step-${idx}`),
    title: String(item.name || item.title || "Step"),
    owner: String(item.owner || "Citizen"),
    eta: item.estimateDays && typeof item.estimateDays === "object"
      ? `${item.estimateDays.min || 0}-${item.estimateDays.max || 0} days`
      : String(item.eta || "TBD"),
    status: "pending" as const,
    notes: Array.isArray(item.notes) ? item.notes.join("; ") : undefined,
  }));
}

function resultToCosts(result: ProcessResult): ProcessCost[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawResult = result as any;
  const lineItems = rawResult.costs?.lineItems;
  if (!Array.isArray(lineItems) || !lineItems.length) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return lineItems.map((item: any, idx: number) => ({
    id: String(item.id || `cost-${idx}`),
    label: String(item.name || item.label || "Cost"),
    amountINR: Number(item.amountInr || item.amountINR || item.rangeInr?.min || 0),
    note: Array.isArray(item.notes) ? item.notes.join("; ") : item.note,
  }));
}

function resultToRisks(result: ProcessResult): ProcessRisk[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawResult = result as any;
  const items = rawResult.risks?.items;
  if (!Array.isArray(items) || !items.length) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return items.map((item: any, idx: number) => ({
    id: `risk-${idx}`,
    title: String(item.description || item.title || "Risk"),
    severity: (item.severity as "low" | "medium" | "high") || "medium",
    mitigation: String(item.action || item.mitigation || "Review and address"),
  }));
}

function resultToDocuments(result: ProcessResult): ProcessDocument[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawResult = result as any;
  const documents = rawResult.documents;
  
  if (!Array.isArray(documents) || !documents.length) return [];
  
  const docs: ProcessDocument[] = [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documents.forEach((group: any) => {
    if (group.items && Array.isArray(group.items)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      group.items.forEach((item: any) => {
        docs.push({
          id: String(item.id || `doc-${docs.length}`),
          title: String(item.name || item.title || "Document"),
          optional: item.required === false || item.optional === true,
        });
      });
    } else if (group.id || group.name) {
      docs.push({
        id: String(group.id || `doc-${docs.length}`),
        title: String(group.name || group.title || "Document"),
        optional: group.required === false || group.optional === true,
      });
    }
  });
  
  return docs;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [record, setRecord] = useState<CaseRecord | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [events, setEvents] = useState<AgentActivityStreamEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCase() {
      setIsLoading(true);
      try {
        const [rec, res, evt] = await Promise.all([
          getCaseRecord(caseId),
          getCaseResult(caseId),
          getCaseEvents(caseId),
        ]);
        
        if (!rec) {
          setError("Case not found");
        } else {
          setRecord(rec);
          setResult(res);
          setEvents(evt);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load case");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadCase();
  }, [caseId]);

  const handleDelete = async () => {
    if (confirm("Delete this analysis? This cannot be undone.")) {
      await deleteCase(caseId);
      router.push("/history");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-muted-foreground">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Loading analysis...
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="space-y-6">
        <Link href="/history" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to History
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error || "Case not found"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/history" className="text-sm font-medium text-primary hover:underline">
              Return to history
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps = result ? resultToSteps(result) : [];
  const costs = result ? resultToCosts(result) : [];
  const risks = result ? resultToRisks(result) : [];
  const documents = result ? resultToDocuments(result) : [];

  const statusVariant = {
    completed: "success",
    processing: "info",
    pending: "outline",
    failed: "destructive",
  }[record.status] as "success" | "info" | "outline" | "destructive";

  return (
    <div className="space-y-6">
      {/* Back link and actions */}
      <div className="flex items-center justify-between">
        <Link href="/history" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to History
        </Link>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {formatDate(record.createdAt)}
          </span>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Query header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{record.query}</CardTitle>
              <CardDescription className="mt-2">
                {record.businessName || "Business Analysis"}
                {record.location && ` • ${record.location}`}
              </CardDescription>
            </div>
            <Badge variant={statusVariant} className="capitalize">
              {record.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Error state */}
      {record.status === "failed" && record.error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Analysis Failed</CardTitle>
            <CardDescription>{record.error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
              Try running this analysis again
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Processing state */}
      {record.status === "processing" && (
        <Card className="border-info/30 bg-info/5">
          <CardHeader>
            <CardTitle className="text-info flex items-center gap-2">
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Analysis In Progress
            </CardTitle>
            <CardDescription>
              This analysis was still processing. You may need to run it again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
              Start a new analysis
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Complete result */}
      {record.status === "completed" && result && (
        <FinalReport
          result={result}
          isComplete={true}
          query={record.query}
          steps={steps}
          costs={costs}
          risks={risks}
          documents={documents}
        />
      )}

      {/* Activity log */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Agent activity during this analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <Badge variant="outline" className="flex-shrink-0">
                    {event.agentName}
                  </Badge>
                  <p className="text-muted-foreground">{event.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

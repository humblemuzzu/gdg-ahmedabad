"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FinalReport } from "@/components/process/FinalReport";
import { getCaseRecord, getCaseResult, type CaseRecord } from "@/lib/storage/caseStore";
import { resultToSteps, resultToCosts, resultToRisks, resultToDocuments } from "@/lib/hooks/use-analysis";
import type { ProcessResult } from "@/types";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default function ReportPage({ params }: ReportPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCase() {
      try {
        const [record, caseResult] = await Promise.all([
          getCaseRecord(id),
          getCaseResult(id),
        ]);
        if (!record) {
          setError("Report not found");
        } else {
          setCaseRecord(record);
          setResult(caseResult);
        }
      } catch (e) {
        setError("Failed to load report");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Bureaucracy Breaker Report",
          text: caseRecord?.query || "Government process analysis report",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      }
    } catch (e) {
      console.error("Failed to share:", e);
    }
  };

  const handleBack = () => {
    router.push("/history");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !caseRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-destructive/10">
            <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2">{error || "Report not found"}</h1>
          <p className="text-muted-foreground mb-4">The report you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Button onClick={handleBack}>Go to History</Button>
        </div>
      </div>
    );
  }

  const steps = result ? resultToSteps(result) : [];
  const costs = result ? resultToCosts(result) : [];
  const risks = result ? resultToRisks(result) : [];
  const documents = result ? resultToDocuments(result) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Print-friendly header - hidden on print */}
      <div className="print:hidden sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="font-semibold">Analysis Report</h1>
              <p className="text-xs text-muted-foreground">
                {new Date(caseRecord.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </Button>
            <Button variant="default" size="sm" onClick={handlePrint}>
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 print:py-0 print:px-0 max-w-5xl">
        {/* Print header - only shown when printing */}
        <div className="hidden print:block mb-8">
          <div className="text-center border-b-2 border-primary pb-4 mb-4">
            <h1 className="text-2xl font-bold">BUREAUCRACY BREAKER</h1>
            <p className="text-sm text-muted-foreground">Government Process Analysis Report</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Query:</p>
              <p className="font-medium">{caseRecord.query}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Generated:</p>
              <p className="font-medium">
                {new Date(caseRecord.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Query display - hidden on print since it's in print header */}
        <div className="print:hidden mb-6 p-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Original Query</p>
          <p className="font-medium">&ldquo;{caseRecord.query}&rdquo;</p>
        </div>

        {/* The FinalReport component */}
        {result ? (
          <FinalReport
            result={result}
            isComplete={true}
            query={caseRecord.query}
            steps={steps}
            costs={costs}
            risks={risks}
            documents={documents}
          />
        ) : (
          <div className="text-center py-16">
            <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-warning/10">
              <svg className="h-8 w-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">Analysis Incomplete</h2>
            <p className="text-muted-foreground mb-4">
              This analysis is still processing or encountered an error.
            </p>
            <Button onClick={() => router.push("/dashboard")}>Start New Analysis</Button>
          </div>
        )}
      </div>

      {/* Print footer */}
      <div className="hidden print:block fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 text-center text-xs text-muted-foreground">
        <p>Generated by Bureaucracy Breaker</p>
      </div>
    </div>
  );
}

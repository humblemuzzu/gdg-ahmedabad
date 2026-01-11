"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FinalReport } from "@/components/process/FinalReport";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { getCaseRecord, getCaseResult, deleteCase, type CaseRecord } from "@/lib/storage/caseStore";
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
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  const handleDelete = async () => {
    if (confirm("Delete this analysis? This cannot be undone.")) {
      await deleteCase(id);
      router.push("/history");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !caseRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-destructive/10">
            <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2">{error || "Report not found"}</h1>
          <p className="text-muted-foreground mb-4">The report you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Button asChild>
            <Link href="/history">Go to History</Link>
          </Button>
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
      {/* Fixed header - clean minimal design */}
      <header className="print:hidden sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Left side - Back and title */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/history" className="gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>
            
            <div className="h-6 w-px bg-border hidden sm:block" />
            
            <div className="hidden sm:block">
              <h1 className="font-semibold text-lg">Analysis Report</h1>
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

          {/* Center - Logo (mobile) */}
          <div className="sm:hidden">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                BB
              </div>
            </Link>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline ml-2">Delete</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="hidden sm:inline ml-2">Share</span>
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="hidden sm:inline ml-2">Print</span>
            </Button>
            <Button variant="outline" size="sm" asChild className="hidden md:flex">
              <Link href="/dashboard" className="gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Analysis
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content - full width, proper spacing */}
      <main className="px-4 py-6 md:px-6 lg:px-8 print:p-0">
        <div className="mx-auto max-w-6xl">
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

          {/* Query display - visible on screen */}
          <div className="print:hidden mb-6 p-4 rounded-xl bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Original Query</p>
            <p className="font-medium text-lg">&ldquo;{caseRecord.query}&rdquo;</p>
            {(caseRecord.businessName || caseRecord.location) && (
              <p className="text-sm text-muted-foreground mt-1">
                {caseRecord.businessName}{caseRecord.businessName && caseRecord.location && " - "}{caseRecord.location}
              </p>
            )}
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
              caseId={id}
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
              <Button asChild>
                <Link href="/dashboard">Start New Analysis</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Print footer */}
      <div className="hidden print:block fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 text-center text-xs text-muted-foreground">
        <p>Generated by Bureaucracy Breaker - bureaucracybreaker.com</p>
      </div>

      {/* Floating Chat Button */}
      {result && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="print:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-full shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-200 group"
          title="Ask AI Assistant"
        >
          <svg
            className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a10.07 10.07 0 01-4.39-.98L3 20l1.53-3.83A7.67 7.67 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="font-medium hidden sm:inline">Ask AI</span>
        </button>
      )}

      {/* Chat Panel */}
      <ChatPanel
        caseId={id}
        processResult={result}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}

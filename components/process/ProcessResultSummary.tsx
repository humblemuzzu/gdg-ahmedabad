"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProcessResult } from "@/types";

interface ProcessResultSummaryProps {
  result: ProcessResult | null;
  isComplete: boolean;
}

export function ProcessResultSummary({ result, isComplete }: ProcessResultSummaryProps) {
  if (!isComplete || !result) {
    return null;
  }

  // Extract key info from result
  const businessName = result.business?.name || result.intent?.businessTypeId || "Business";
  const location = result.location?.city 
    ? `${result.location.city}, ${result.location.state || "India"}`
    : result.location?.state || "India";
  const intentType = result.intent?.intent || "QUERY";
  const confidence = result.intent?.confidence || 0;
  
  // Get licenses count
  const licensesCount = result.licenses?.length || 0;
  
  // Get timeline estimate
  const timelineItems = result.timeline || [];
  const totalDaysMin = timelineItems.reduce((sum, item) => sum + (item.estimateDays?.min || 0), 0);
  const totalDaysMax = timelineItems.reduce((sum, item) => sum + (item.estimateDays?.max || 0), 0);
  
  // Get cost estimate
  const totalCost = result.costs?.officialFeesInr || 0;
  const practicalMin = result.costs?.practicalCostsInrRange?.min || 0;
  const practicalMax = result.costs?.practicalCostsInrRange?.max || 0;
  
  // Get risk score
  const riskScore = result.risks?.riskScore0to10 || 0;
  const highRisks = result.risks?.items?.filter(r => r.severity === "high").length || 0;

  // Get expert advice if available
  const expertAdvice = result.outputs?.expertAdvice as { perspectives?: Array<{ role: string; advice: string }> } | undefined;
  const recommendation = (expertAdvice as { recommendation?: string })?.recommendation;

  return (
    <Card className="border-2 border-success/30 bg-success/5">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Analysis Results</CardTitle>
            <CardDescription>
              {businessName} in {location}
            </CardDescription>
          </div>
          <Badge variant="success">Complete</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs font-medium text-muted-foreground">Licenses Required</p>
            <p className="mt-1 text-2xl font-bold">{licensesCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs font-medium text-muted-foreground">Est. Timeline</p>
            <p className="mt-1 text-2xl font-bold">
              {totalDaysMin === totalDaysMax 
                ? `${totalDaysMin}d` 
                : `${totalDaysMin}-${totalDaysMax}d`}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs font-medium text-muted-foreground">Official Fees</p>
            <p className="mt-1 text-2xl font-bold">
              {totalCost > 0 ? `₹${totalCost.toLocaleString("en-IN")}` : "TBD"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs font-medium text-muted-foreground">Risk Score</p>
            <p className={`mt-1 text-2xl font-bold ${riskScore > 6 ? "text-destructive" : riskScore > 3 ? "text-warning" : "text-success"}`}>
              {riskScore}/10
            </p>
          </div>
        </div>

        {/* Licenses List */}
        {result.licenses && result.licenses.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold">Required Licenses</p>
            <div className="flex flex-wrap gap-2">
              {result.licenses.map((license, idx) => (
                <Badge key={license.id || idx} variant="outline">
                  {license.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Practical Costs */}
        {(practicalMin > 0 || practicalMax > 0) && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-semibold">Practical Costs (including consultants, travel)</p>
            <p className="mt-1 text-lg font-bold">
              ₹{practicalMin.toLocaleString("en-IN")} - ₹{practicalMax.toLocaleString("en-IN")}
            </p>
          </div>
        )}

        {/* Risk Warning */}
        {highRisks > 0 && (
          <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-foreground">{highRisks} High Risk{highRisks > 1 ? "s" : ""} Identified</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check the Risk Analysis section below for details and mitigations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendation */}
        {recommendation && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-primary">Expert Recommendation</p>
            <p className="mt-2 text-sm text-foreground">{recommendation}</p>
          </div>
        )}

        {/* Clarifying Questions */}
        {result.intent?.clarifyingQuestions && result.intent.clarifyingQuestions.length > 0 && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
            <p className="text-sm font-semibold text-warning">More Info Needed</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {result.intent.clarifyingQuestions.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Debug: Show raw result structure */}
        {process.env.NODE_ENV === "development" && (
          <details className="rounded-lg border border-border bg-muted/30 p-4">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
              Debug: Raw Result
            </summary>
            <pre className="mt-2 max-h-64 overflow-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

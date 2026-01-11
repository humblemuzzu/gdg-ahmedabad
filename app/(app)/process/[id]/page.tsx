"use client";

import Link from "next/link";
import { AgentActivityStream } from "@/components/agents/AgentActivityStream";
import { AgentDebateViewer } from "@/components/agents/AgentDebateViewer";
import { DocumentChecklist } from "@/components/process/DocumentChecklist";
import { ProcessCostBreakdown } from "@/components/process/ProcessCostBreakdown";
import { ProcessDependencyGraph } from "@/components/process/ProcessDependencyGraph";
import { ProcessRiskAnalysis } from "@/components/process/ProcessRiskAnalysis";
import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalysisContext } from "@/lib/context/analysis-context";

export default function ProcessPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { steps, costs, risks, documents, activities, isComplete, query, debateMessages, typingAgent, isRunning } = useAnalysisContext();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Process</h1>
            <Badge variant="outline">#{id}</Badge>
            {isComplete && <Badge variant="success">Complete</Badge>}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {query || "Detailed view with timeline, risks, costs, and documents."}
          </p>
        </div>
        <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <ProcessTimeline steps={steps} />
          <ProcessDependencyGraph />
          <div className="grid gap-6 xl:grid-cols-2">
            <ProcessCostBreakdown costs={costs} />
            <ProcessRiskAnalysis risks={risks} />
          </div>
        </div>
        <div className="space-y-6">
          <AgentActivityStream events={activities} />
          <AgentDebateViewer 
            messages={debateMessages} 
            isLive={isRunning}
            typingAgent={typingAgent}
          />
          <DocumentChecklist documents={documents} />
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>For calls, visits, and follow-ups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                Add note-taking and reminders after core functionality is connected.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

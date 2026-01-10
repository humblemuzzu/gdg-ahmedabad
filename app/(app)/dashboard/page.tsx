import Link from "next/link";
import { AgentActivityStream } from "@/components/agents/AgentActivityStream";
import { AgentGrid } from "@/components/agents/AgentGrid";
import { DocumentChecklist } from "@/components/process/DocumentChecklist";
import { ProcessCostBreakdown } from "@/components/process/ProcessCostBreakdown";
import { ProcessInput } from "@/components/process/ProcessInput";
import { ProcessRiskAnalysis } from "@/components/process/ProcessRiskAnalysis";
import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const stats = [
    { label: "Active agents", value: "3", hint: "Working right now" },
    { label: "High risks", value: "2", hint: "Needs attention" },
    { label: "Documents", value: "5", hint: "Checklist items" },
    { label: "ETA", value: "3–6w", hint: "Rough end-to-end" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything you need in one place: inputs, agent activity, and a clear plan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">UI preview</Badge>
          <Badge variant="outline">No backend calls</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div id="new">
            <ProcessInput />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ProcessTimeline />
            <ProcessCostBreakdown />
          </div>

          <ProcessRiskAnalysis />
        </div>

        <div className="space-y-6">
          <AgentActivityStream />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Agents</CardTitle>
                  <CardDescription>Who’s active right now (preview)</CardDescription>
                </div>
                <Link
                  href="/process/demo"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View process
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <AgentGrid compact />
              <Separator />
              <p className="text-xs text-muted-foreground">
                The orchestration stream will map directly into this panel.
              </p>
            </CardContent>
          </Card>

          <DocumentChecklist />
        </div>
      </div>
    </div>
  );
}

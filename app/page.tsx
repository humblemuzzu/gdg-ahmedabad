import Link from "next/link";
import { AgentGrid } from "@/components/agents/AgentGrid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Agent } from "@/types";

// Sample agents for landing page preview
const previewAgents: Agent[] = [
  { id: "intent", name: "Intent Decoder", tier: "intake", status: "done", summary: "Business setup detected" },
  { id: "location", name: "Location Intel", tier: "intake", status: "done", summary: "Ahmedabad, Gujarat" },
  { id: "classifier", name: "Business Classifier", tier: "intake", status: "done", summary: "Cafe / QSR" },
  { id: "librarian", name: "Regulation Librarian", tier: "research", status: "idle" },
  { id: "risk", name: "Risk Assessor", tier: "intelligence", status: "idle" },
  { id: "timeline", name: "Timeline Architect", tier: "strategy", status: "idle" },
  { id: "cost", name: "Cost Calculator", tier: "strategy", status: "idle" },
  { id: "compiler", name: "Final Compiler", tier: "intelligence", status: "idle" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[560px] w-[880px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-44 right-[-10%] h-[420px] w-[420px] rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] h-[520px] w-[520px] rounded-full bg-success/10 blur-3xl" />
        </div>

        <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:px-10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <span className="text-sm font-semibold tracking-tight">BB</span>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium text-foreground">Bureaucracy Breaker</p>
              <p className="text-xs text-muted-foreground">Government process GPS</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a className="hover:text-foreground" href="#features">
              Features
            </a>
            <a className="hover:text-foreground" href="#preview">
              Preview
            </a>
            <Link className="hover:text-foreground" href="/dashboard">
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Badge className="hidden md:inline-flex" variant="secondary">
              25+ agents
            </Badge>
            <Button asChild>
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          </div>
        </header>

        <main className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-10 md:px-10 md:pb-24 md:pt-16">
          <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground shadow-sm">
                <span className="h-2 w-2 rounded-full bg-success ring-2 ring-success/15" />
                25 AI agents ready · Powered by Gemini
              </div>

              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
                Clear, step-by-step battle plans for any government process.
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground md:text-lg">
                Describe what you want to do. The agent army drafts the timeline, documents, costs, risks, and
                “what to do next” — in a clean workspace designed for speed.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" asChild>
                  <Link href="/dashboard">Start a new plan</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="#preview">See the UI preview</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2" id="features">
                <Card className="p-5">
                  <p className="text-sm font-medium">Agent collaboration</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    See who’s working, what they found, and what changed — without noise.
                  </p>
                </Card>
                <Card className="p-5">
                  <p className="text-sm font-medium">Document-ready outputs</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Checklists, drafts, and step sequences you can actually follow.
                  </p>
                </Card>
                <Card className="p-5">
                  <p className="text-sm font-medium">Risk-first planning</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Identify blockers early: zone issues, prerequisites, deadlines, and fees.
                  </p>
                </Card>
                <Card className="p-5">
                  <p className="text-sm font-medium">Parallel optimization</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Split workstreams so you waste less time in queues and offices.
                  </p>
                </Card>
              </div>
            </div>

            <div className="space-y-4" id="preview">
              <Card className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Agent status</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      25 specialized agents work together on your query
                    </p>
                  </div>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="mt-4">
                  <AgentGrid agents={previewAgents} compact />
                </div>
              </Card>

              <Card className="p-5">
                <p className="text-sm font-medium">Try a sample prompt</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  “Ahmedabad me café kholna hai — licenses, timeline, aur total kharcha?”
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <div className="rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
                    This input is a UI preview. Open the dashboard to explore the full layout.
                  </div>
                  <Button variant="secondary" asChild>
                    <Link href="/dashboard">Open dashboard</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          <footer className="mt-16 border-t border-border pt-8 text-sm text-muted-foreground">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <p>Built for judges, citizens, and speed. UI ships first.</p>
              <div className="flex items-center gap-3">
                <a className="hover:text-foreground" href="#features">
                  Features
                </a>
                <Link className="hover:text-foreground" href="/dashboard">
                  Dashboard
                </Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

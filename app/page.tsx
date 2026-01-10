import Link from "next/link";
import { AgentGrid } from "@/components/agents/AgentGrid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeButton } from "@/components/theme/ThemeButton";
import type { Agent } from "@/types";

// Sample agents for landing page preview
const previewAgents: Agent[] = [
  { id: "intent", name: "Intent Decoder", tier: "intake", status: "done", summary: "Business setup detected" },
  { id: "location", name: "Location Intel", tier: "intake", status: "done", summary: "Mumbai, Maharashtra" },
  { id: "classifier", name: "Business Classifier", tier: "intake", status: "working", summary: "Analyzing..." },
  { id: "scale", name: "Scale Analyzer", tier: "intake", status: "working", summary: "Calculating..." },
  { id: "librarian", name: "Regulation Librarian", tier: "research", status: "working", summary: "Researching..." },
  { id: "document", name: "Document Detective", tier: "research", status: "idle" },
  { id: "risk", name: "Risk Assessor", tier: "intelligence", status: "idle" },
  { id: "timeline", name: "Timeline Architect", tier: "strategy", status: "idle" },
  { id: "parallel", name: "Parallel Optimizer", tier: "strategy", status: "idle" },
  { id: "cost", name: "Cost Calculator", tier: "strategy", status: "idle" },
  { id: "form", name: "Form Wizard", tier: "document", status: "idle" },
  { id: "compiler", name: "Final Compiler", tier: "intelligence", status: "idle" },
];

const agentTiers = [
  {
    name: "Intake Battalion",
    color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    count: 4,
    agents: ["Intent Decoder", "Location Intelligence", "Business Classifier", "Scale Analyzer"],
    description: "First responders who understand your query and classify requirements"
  },
  {
    name: "Research Battalion",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    count: 4,
    agents: ["Regulation Librarian", "Policy Scout", "Document Detective", "Department Mapper"],
    description: "Deep knowledge experts who know every rule and requirement"
  },
  {
    name: "Strategy Battalion",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    count: 5,
    agents: ["Dependency Builder", "Timeline Architect", "Parallel Optimizer", "Cost Calculator", "Risk Assessor"],
    description: "Master planners who create optimal execution strategies"
  },
  {
    name: "Document Battalion",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    count: 5,
    agents: ["Form Wizard", "Document Validator", "RTI Drafter", "Grievance Writer", "Appeal Crafter"],
    description: "Paperwork specialists who handle all documentation needs"
  },
  {
    name: "Execution Battalion",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    count: 3,
    agents: ["Visit Planner", "Reminder Engine", "Status Tracker"],
    description: "Action coordinators who keep everything on track"
  },
  {
    name: "Intelligence Battalion",
    color: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    count: 4,
    agents: ["Corruption Detector", "Comparison Agent", "What-If Simulator", "Expert Simulator"],
    description: "Smart analysts who predict problems and optimize outcomes"
  },
];

const features = [
  {
    icon: "🤖",
    title: "25 Specialized AI Agents",
    description: "Not just one chatbot - an entire ecosystem of expert agents working together like a real consulting team"
  },
  {
    icon: "🎯",
    title: "Risk Detection System",
    description: "Catches problems before you waste time and money - zone issues, missing prerequisites, timeline conflicts"
  },
  {
    icon: "⚡",
    title: "Parallel Execution Optimizer",
    description: "Identifies what can be done simultaneously, cutting your total time by 30-40%"
  },
  {
    icon: "📋",
    title: "Complete Document Checklists",
    description: "Exhaustive lists with exact specifications - photo sizes, attestation types, validity periods"
  },
  {
    icon: "💰",
    title: "Real Cost Breakdown",
    description: "Separates official fees from practical costs - consultants, notary, travel, the whole picture"
  },
  {
    icon: "📄",
    title: "One-Click RTI Generator",
    description: "Stuck application? Generate legally correct RTI applications and grievances in seconds"
  },
  {
    icon: "🗺️",
    title: "Visual Journey Maps",
    description: "Interactive flowcharts showing your entire path with all decision points and outcomes"
  },
  {
    icon: "🆚",
    title: "State Comparison Engine",
    description: "See how your state compares to others - timelines, costs, complexity for the same process"
  },
  {
    icon: "🔮",
    title: "What-If Simulator",
    description: "Simulate scenarios before they happen - what if Fire NOC fails? What if there's a delay?"
  },
  {
    icon: "👥",
    title: "Agent Debate Viewer",
    description: "Watch agents discuss and debate decisions in real-time - transparent AI reasoning"
  },
  {
    icon: "📊",
    title: "Timeline Architect",
    description: "Realistic timelines with ranges, not just single numbers - accounts for backlogs and seasonal delays"
  },
  {
    icon: "🕵️",
    title: "Corruption Risk Scoring",
    description: "Data-driven analysis of delay patterns and red flags in specific departments"
  },
];

const stats = [
  { number: "25+", label: "Specialized AI Agents", sublabel: "Each an expert in their domain" },
  { number: "100+", label: "Business Types", sublabel: "Pre-loaded with requirements" },
  { number: "50+", label: "License Types", sublabel: "Across all major sectors" },
  { number: "28", label: "States Covered", sublabel: "State-specific variations" },
  { number: "30-40%", label: "Time Saved", sublabel: "Via parallel execution" },
  { number: "1.4B", label: "Indians Affected", sublabel: "By bureaucracy issues" },
];

const problems = [
  {
    problem: "Confusing requirements",
    solution: "Clear step-by-step breakdown with exact specifications",
    icon: "❓"
  },
  {
    problem: "Hidden dependencies",
    solution: "Visual dependency graph showing what needs what",
    icon: "🔗"
  },
  {
    problem: "Unclear timelines",
    solution: "Realistic ranges based on actual data, not promises",
    icon: "⏱️"
  },
  {
    problem: "Surprise costs",
    solution: "Complete breakdown including 'unofficial' expenses",
    icon: "💸"
  },
  {
    problem: "Application rejections",
    solution: "Pre-validation catches errors before submission",
    icon: "❌"
  },
  {
    problem: "Stuck applications",
    solution: "Automatic RTI and escalation path generation",
    icon: "🚫"
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/4 h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 h-[600px] w-[600px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-success/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground font-bold text-base transition-transform group-hover:scale-105">
              BB
            </div>
            <div className="leading-tight">
              <p className="text-base font-semibold text-foreground">Bureaucracy Breaker</p>
              <p className="text-sm text-muted-foreground">Government Process GPS</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-10 text-sm font-medium md:flex">
            <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#agents" className="text-muted-foreground transition-colors hover:text-foreground">
              Agent Army
            </a>
            <a href="#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </a>
            <a href="#impact" className="text-muted-foreground transition-colors hover:text-foreground">
              Impact
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeButton />
            <Button asChild size="lg" className="font-semibold px-6">
              <Link href="/dashboard">Launch Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 lg:px-8 lg:pt-32 lg:pb-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
            </span>
            25 AI Agents Ready • Powered by Google Gemini
          </div>

          <h1 className="mt-8 text-balance font-display text-5xl font-bold tracking-tight lg:text-7xl">
            Your Government Process{" "}
            <span className="text-gradient">GPS</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground lg:text-xl">
            Deploy an army of <strong className="font-semibold text-foreground">25 specialized AI agents</strong> to navigate any bureaucratic process. Get complete battle plans with timelines, documents, costs, and risks — all in one place.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="text-base font-semibold shadow-lg hover-lift">
              <Link href="/dashboard">
                Start Your Journey
                <span className="ml-2">→</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="text-base font-semibold">
              <Link href="#agents">
                Meet the Agents
              </Link>
            </Button>
          </div>

          {/* Example Queries */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
            <p className="w-full mb-2 text-base font-medium text-muted-foreground">Try asking:</p>
            <Badge variant="secondary" className="text-sm px-5 py-2.5 font-medium hover-lift cursor-pointer">
              "Mumbai mein restaurant kholna hai"
            </Badge>
            <Badge variant="secondary" className="text-sm px-5 py-2.5 font-medium hover-lift cursor-pointer">
              "Starting an IT company in Bangalore"
            </Badge>
            <Badge variant="secondary" className="text-sm px-5 py-2.5 font-medium hover-lift cursor-pointer">
              "Export business license requirements"
            </Badge>
            <Badge variant="secondary" className="text-sm px-5 py-2.5 font-medium hover-lift cursor-pointer">
              "My Fire NOC is stuck for 60 days"
            </Badge>
          </div>
        </div>

        {/* What You Get - Clean Explanation */}
        <div className="mt-20 lg:mt-28">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
              What You Get in Seconds
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              From vague question to complete execution plan — automatically
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-16">
            <Card className="p-8 hover-lift">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mb-4">
                📋
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete Checklist</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every license, document, and form you need — with exact specifications and where to get them
              </p>
            </Card>

            <Card className="p-8 hover-lift">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mb-4">
                ⏱️
              </div>
              <h3 className="text-xl font-semibold mb-2">Realistic Timeline</h3>
              <p className="text-muted-foreground leading-relaxed">
                Best case, worst case, and realistic timelines — with parallel execution optimization
              </p>
            </Card>

            <Card className="p-8 hover-lift">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mb-4">
                ⚠️
              </div>
              <h3 className="text-xl font-semibold mb-2">Risk Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Problems caught before you start — zone issues, missing docs, dependency conflicts
              </p>
            </Card>
          </div>

          {/* Simplified Agent Preview */}
          <Card className="overflow-hidden border shadow-xl">
            <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 px-8 py-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-foreground">Live Agent Analysis</h3>
                    <Badge className="bg-success/10 text-success border-success/20 text-xs">
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success"></span>
                      Active
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Watch our 25 specialized agents work together on your query. Each agent is an expert in their domain — they collaborate, debate, and build your complete plan.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <AgentGrid agents={previewAgents} />
            </div>
            <div className="border-t border-border bg-muted/30 px-8 py-5">
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">25 agents</strong> across 6 specialized battalions
                </p>
                <Button variant="secondary" asChild>
                  <Link href="#agents">Learn about each agent →</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="relative border-y border-border bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight lg:text-5xl">
              Every Indian's Bureaucracy Nightmare,{" "}
              <span className="text-primary">Solved</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Starting a business? Getting a license? We know the pain. Here's how we fix it.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((item, index) => (
              <Card key={index} className="p-6 hover-lift">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-destructive line-through">
                      {item.problem}
                    </p>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-success">
                      ✓ {item.solution}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight lg:text-5xl">
              Features That Make Judges Say{" "}
              <span className="text-primary">"Wait, This Was Built in 32 Hours?!"</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Not just a chatbot. A complete AI-powered system with unique capabilities.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover-lift transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-lg text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Army Section */}
      <section id="agents" className="relative border-y border-border bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight lg:text-5xl">
              Meet Your{" "}
              <span className="text-gradient">Agent Army</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              25 specialized agents organized in 6 battalions. Each agent has a specific job, deep expertise, and communicates with others to build your complete battle plan.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            {agentTiers.map((tier, index) => (
              <Card key={index} className="p-6 hover-lift">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-xl text-foreground">{tier.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                  <Badge className={tier.color}>{tier.count} agents</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tier.agents.map((agent, agentIndex) => (
                    <Badge key={agentIndex} variant="secondary" className="text-xs">
                      {agent}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="inline-block p-6 bg-primary/5 border-primary/20">
              <p className="text-sm font-medium text-foreground">
                <span className="text-primary font-bold">Agent Orchestration:</span> The Orchestrator Agent coordinates all 25 agents, managing their communication, resolving debates, and compiling the final output.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight lg:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              From query to complete battle plan in minutes
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "You Ask",
                description: "Type your query in plain language - Hindi, English, or Hinglish. 'Mumbai mein restaurant kholna hai'",
                icon: "💬"
              },
              {
                step: "02",
                title: "Agents Deploy",
                description: "25 specialized agents spring into action. Intake Battalion understands your need, Research Battalion gathers requirements.",
                icon: "🚀"
              },
              {
                step: "03",
                title: "They Collaborate",
                description: "Watch agents debate and discuss in real-time. Strategy Battalion builds the optimal plan, Document Battalion prepares checklists.",
                icon: "🤝"
              },
              {
                step: "04",
                title: "You Get Your Plan",
                description: "Complete battle plan with timeline, costs, documents, risks, and next steps. Ready to execute immediately.",
                icon: "📋"
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl shadow-sm ring-1 ring-primary/20">
                    {item.icon}
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-mono font-bold text-primary">{item.step}</p>
                    <h3 className="mt-2 font-semibold text-lg text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                {index < 3 && (
                  <div className="absolute top-8 left-[calc(50%+2rem)] hidden h-0.5 w-[calc(100%-4rem)] bg-gradient-to-r from-primary/40 to-transparent lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="impact" className="relative border-y border-border bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight lg:text-5xl">
              Built for Scale, Built for Impact
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <Card key={index} className="p-8 text-center hover-lift">
                <div className="font-display text-5xl font-bold text-primary lg:text-6xl">
                  {stat.number}
                </div>
                <div className="mt-3 font-semibold text-lg text-foreground">{stat.label}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.sublabel}</div>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Card className="inline-block p-8 max-w-3xl">
              <p className="text-lg font-medium italic text-foreground quote-mark">
                In India, you don't just start a business. You navigate a maze of 50+ licenses, 100+ forms, and 10+ departments. We're building the GPS for that maze.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="font-display text-4xl font-bold tracking-tight lg:text-6xl">
            Ready to Break Through Bureaucracy?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Join thousands navigating government processes with confidence. Start your journey today.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="text-base font-semibold shadow-xl glow-primary">
              <Link href="/dashboard">
                Launch Dashboard
                <span className="ml-2">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border bg-muted/50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                  BB
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-foreground">Bureaucracy Breaker</p>
                  <p className="text-xs text-muted-foreground">Government Process GPS</p>
                </div>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-md">
                AI-powered system with 25 specialized agents helping Indians navigate bureaucratic processes. Built for AutonomousHacks 2026.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-foreground">Navigation</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#agents" className="hover:text-foreground transition-colors">Agent Army</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#impact" className="hover:text-foreground transition-colors">Impact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-foreground">Get Started</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Start Analysis</Link></li>
                <li><Link href="/history" className="hover:text-foreground transition-colors">View History</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>Built with ❤️ for GDG Ahmedabad Hackathon • Powered by Google Gemini ADK</p>
            <p className="mt-2">© 2026 Bureaucracy Breaker. Making bureaucracy navigable for 1.4 billion Indians.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

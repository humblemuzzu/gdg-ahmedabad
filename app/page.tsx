import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/components/landing/LandingHeader";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Distinct, minimal */}
      <LandingHeader />

      {/* Hero Section - Full viewport, focused */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16">
        {/* Subtle background gradient */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-info/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Status Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
            </span>
            <span className="text-muted-foreground">Built for GDG Ahmedabad Hackathon</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Stop guessing.
            <br />
            <span className="text-primary">Start your business.</span>
          </h1>

          {/* Sub-headline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            25 AI agents analyze government requirements, build your complete roadmap, 
            and tell you exactly what you need—licenses, documents, costs, timeline, risks.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link href="/dashboard">
                Start Free Analysis
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#problem">See How It Works</a>
            </Button>
          </div>

          {/* Example prompts */}
          <div className="mt-16 space-y-3">
            <p className="text-sm text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                "I want to open a restaurant in Mumbai",
                "Starting an IT company in Bangalore",
                "Export license requirements",
              ].map((prompt) => (
                <span
                  key={prompt}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  "{prompt}"
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <a href="#problem" className="flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
            <span className="text-xs">Scroll</span>
            <svg className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="border-t border-border bg-muted/30 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">The Problem</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Starting a business in India is a maze
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              50+ licenses. 100+ forms. 10+ departments. Conflicting information everywhere. 
              Most entrepreneurs spend months figuring out what they even need.
            </p>
          </div>

          {/* Pain points */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Weeks of research",
                description: "Endless Google searches, government websites, and conflicting answers from consultants.",
                icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
              },
              {
                title: "Hidden requirements",
                description: "Discover you need License B only after applying for License A. Back to square one.",
                icon: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
              },
              {
                title: "Surprise rejections",
                description: "Wrong document format. Missing attestation. Application rejected after 60 days of waiting.",
                icon: "M6 18L18 6M6 6l12 12",
              },
              {
                title: "No clear timeline",
                description: "Is it 30 days or 6 months? Nobody gives you straight answers.",
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                title: "Unexpected costs",
                description: "Official fee is ₹500. Actual cost with consultants and travel? ₹15,000.",
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                title: "Stuck applications",
                description: "Your file is 'under process' for months. No way to know what's happening.",
                icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
              },
            ].map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Impact stat */}
          <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
            <p className="font-display text-4xl font-bold text-primary sm:text-5xl">1.4 Billion</p>
            <p className="mt-2 text-muted-foreground">Indians navigate this bureaucracy every day</p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">The Solution</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Your complete roadmap in minutes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tell us what you want to do. Our 25 AI agents work together to analyze 
              requirements, identify risks, and build your personalized action plan.
            </p>
          </div>

          {/* How it works steps */}
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Describe your goal",
                description: "Type in plain language—Hindi, English, or Hinglish. 'Mumbai mein restaurant kholna hai' works perfectly.",
                icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
              },
              {
                step: "02",
                title: "Agents analyze",
                description: "25 specialized agents research regulations, identify dependencies, calculate timelines, and assess risks.",
                icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
              },
              {
                step: "03",
                title: "Get your roadmap",
                description: "Complete plan with every license, document, cost, timeline, and risk—plus RTI drafts if things go wrong.",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="rounded-2xl border border-border bg-card p-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <span className="font-mono text-sm font-semibold text-primary">{item.step}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-3 text-muted-foreground">{item.description}</p>
                </div>
                {idx < 2 && (
                  <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 lg:block">
                    <svg className="h-6 w-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Output preview */}
          <div className="mt-16 rounded-2xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Analysis Complete</p>
                  <p className="text-sm text-muted-foreground">Restaurant in Mumbai, Maharashtra</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-4">
              {[
                { label: "Licenses", value: "12", color: "text-primary" },
                { label: "Days", value: "45-90", color: "text-info" },
                { label: "Est. Cost", value: "₹25K", color: "text-success" },
                { label: "Risk Score", value: "4/10", color: "text-warning" },
              ].map((stat, idx) => (
                <div key={idx} className="rounded-xl bg-muted/30 p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border bg-muted/30 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Features</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to navigate bureaucracy
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "25 Specialized Agents",
                description: "Not one chatbot—an entire team. Each agent is an expert in their domain, from regulations to risk assessment.",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
              },
              {
                title: "Complete Checklists",
                description: "Every document with exact specs—photo sizes, attestation requirements, validity periods. Nothing left to guess.",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
              },
              {
                title: "Realistic Timelines",
                description: "Best case, worst case, and realistic estimates. We account for backlogs, not just official processing times.",
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                title: "True Cost Breakdown",
                description: "Official fees plus real costs—consultants, notary, travel, everything. No surprises.",
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                title: "Risk Detection",
                description: "Catches problems before you start—zone restrictions, missing prerequisites, potential rejection reasons.",
                icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z",
              },
              {
                title: "RTI & Grievance Drafts",
                description: "Application stuck? Generate legally correct RTI applications and escalation letters in seconds.",
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              },
              {
                title: "State Comparison",
                description: "See how requirements differ across states. Find where it's easier to start your business.",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
              },
              {
                title: "What-If Simulator",
                description: "Simulate scenarios before they happen. What if Fire NOC gets rejected? We show you the impact and alternatives.",
                icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                title: "Parallel Optimization",
                description: "Identifies what can be done simultaneously. Cut your total time by 30-40% with smart sequencing.",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
              },
            ].map((feature, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Section - Simplified */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Under the Hood</p>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                25 agents, 6 specialized teams
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Each agent has deep expertise in one area. They research, analyze, debate, 
                and collaborate to build your complete plan. Watch them work in real-time.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { name: "Intake", desc: "Understands your query and classifies requirements", color: "bg-cyan-500" },
                  { name: "Research", desc: "Finds every regulation and requirement", color: "bg-purple-500" },
                  { name: "Strategy", desc: "Builds timelines and optimizes execution", color: "bg-orange-500" },
                  { name: "Document", desc: "Creates checklists and drafts applications", color: "bg-green-500" },
                  { name: "Execution", desc: "Plans visits and tracks progress", color: "bg-blue-500" },
                  { name: "Intelligence", desc: "Detects risks and simulates scenarios", color: "bg-pink-500" },
                ].map((team, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${team.color}`} />
                    <div>
                      <span className="font-medium text-foreground">{team.name}</span>
                      <span className="mx-2 text-muted-foreground">—</span>
                      <span className="text-sm text-muted-foreground">{team.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent visualization */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 25 }).map((_, idx) => {
                  const colors = [
                    "bg-cyan-500/20 border-cyan-500/30",
                    "bg-purple-500/20 border-purple-500/30",
                    "bg-orange-500/20 border-orange-500/30",
                    "bg-green-500/20 border-green-500/30",
                    "bg-blue-500/20 border-blue-500/30",
                    "bg-pink-500/20 border-pink-500/30",
                  ];
                  const colorIdx = Math.floor(idx / 4) % colors.length;
                  return (
                    <div
                      key={idx}
                      className={`aspect-square rounded-lg border ${colors[colorIdx]} flex items-center justify-center`}
                    >
                      <div className={`h-2 w-2 rounded-full ${colors[colorIdx].split(" ")[0].replace("/20", "")}`} />
                    </div>
                  );
                })}
              </div>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                25 agents working together on your query
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to start your business?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Stop spending weeks on research. Get your complete roadmap in minutes.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link href="/dashboard">
                Start Free Analysis
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-semibold text-xs">
                BB
              </div>
              <div className="text-sm">
                <span className="font-semibold text-foreground">Bureaucracy Breaker</span>
                <span className="mx-2 text-muted-foreground">·</span>
                <span className="text-muted-foreground">Government Process GPS</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with Google Gemini ADK for AutonomousHacks 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

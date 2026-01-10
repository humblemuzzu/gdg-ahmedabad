# BUREAUCRACY BREAKER - 24-HOUR IMPLEMENTATION PLAN

## Project: Government Process GPS with 25+ AI Agents
## Stack: Next.js 16 + shadcn/ui + Google ADK + Tailwind CSS 4

---

# OVERVIEW

Building an AI-powered multi-agent system that helps Indian citizens navigate bureaucratic processes. The system deploys specialized agents that collaborate to provide complete "battle plans" for any government-related task.

**Key Differentiators:**
- 25+ specialized AI agents (not just one chatbot)
- Visible agent collaboration and debate
- Pre-built knowledge base (no live APIs needed)
- Beautiful, modern UI with real-time agent activity visualization
- Risk detection, parallel execution optimization, and document validation

---

# PHASE 1: FOUNDATION (Hours 0-4)

## 1.1 Project Setup & UI Framework (Hour 0-1)

### Install shadcn/ui and dependencies
```bash
npx shadcn@latest init
npx shadcn@latest add button card input textarea badge avatar dialog sheet tabs accordion progress skeleton toast sonner scroll-area separator command popover tooltip dropdown-menu
npm install framer-motion lucide-react clsx tailwind-merge class-variance-authority
```

### Create folder structure
```
/app
  /page.tsx                    # Landing/Home page
  /(app)
    /layout.tsx                # App layout with sidebar
    /dashboard/page.tsx        # Main dashboard
    /process/[id]/page.tsx     # Process detail view
    /api
      /agents/route.ts         # Agent orchestration API
      /analyze/route.ts        # Analysis endpoint
  /globals.css                 # Global styles + theme

/components
  /ui/                         # shadcn components (auto-generated)
  /layout/
    /Sidebar.tsx
    /Header.tsx
    /Footer.tsx
  /agents/
    /AgentCard.tsx             # Individual agent display
    /AgentGrid.tsx             # Grid of all agents
    /AgentActivityStream.tsx   # Live activity feed
    /AgentDebateViewer.tsx     # Agent collaboration view
    /AgentAvatar.tsx           # Agent icons/avatars
  /process/
    /ProcessInput.tsx          # Main input form
    /ProcessTimeline.tsx       # Gantt chart view
    /ProcessDependencyGraph.tsx
    /ProcessCostBreakdown.tsx
    /ProcessRiskAnalysis.tsx
    /DocumentChecklist.tsx
  /visualization/
    /JourneyMap.tsx            # Interactive flowchart
    /GanttChart.tsx
    /SunburstChart.tsx
    /ComparisonTable.tsx
  /common/
    /LoadingSpinner.tsx
    /StatusBadge.tsx
    /AnimatedCounter.tsx

/lib
  /utils.ts                    # Utility functions
  /agents/
    /orchestrator.ts           # Main agent orchestrator
    /base-agent.ts             # Base agent class
    /types.ts                  # Agent type definitions
  /data/
    /business-types.ts
    /states.ts
    /licenses.ts
    /forms.ts
    /templates.ts

/adk
  /agents/
    /orchestrator/             # Main orchestrator agent
    /intake/                   # Tier 1: Intake Battalion
      /intent-decoder.ts
      /location-intelligence.ts
      /business-classifier.ts
      /scale-analyzer.ts
    /research/                 # Tier 2: Research Battalion
      /regulation-librarian.ts
      /policy-scout.ts
      /document-detective.ts
      /department-mapper.ts
    /strategy/                 # Tier 3: Strategy Battalion
      /dependency-builder.ts
      /timeline-architect.ts
      /parallel-optimizer.ts
      /cost-calculator.ts
      /risk-assessor.ts
    /document/                 # Tier 4: Document Battalion
      /form-wizard.ts
      /document-validator.ts
      /rti-drafter.ts
      /grievance-writer.ts
      /appeal-crafter.ts
    /execution/                # Tier 5: Execution Battalion
      /visit-planner.ts
      /reminder-engine.ts
      /status-tracker.ts
    /intelligence/             # Tier 6: Intelligence Battalion
      /corruption-detector.ts
      /comparison-agent.ts
      /whatif-simulator.ts
      /expert-simulator.ts
  /prompts/
    /templates.ts              # All agent prompts
    /index.ts
  /tools/
    /index.ts
    /knowledge-base.ts         # Access to data

/data
  /business-types/
    /restaurant.json
    /it-company.json
    /retail-shop.json
    /export-business.json
    /manufacturing.json
  /states/
    /maharashtra.json
    /karnataka.json
    /gujarat.json
    /delhi.json
    /telangana.json
  /licenses/
    /fssai.json
    /gst.json
    /fire-noc.json
    /shop-establishment.json
    /trade-license.json
  /templates/
    /rti-templates.json
    /grievance-templates.json
  /statistics/
    /department-performance.json
    /processing-times.json

/types
  /index.ts                    # All TypeScript types
  /agents.ts
  /process.ts
  /data.ts
```

### Design System & Theme (globals.css)
```css
/* Modern dark theme with accent colors */
:root {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 221 83% 53%;        /* Blue - primary actions */
  --secondary: 262 83% 58%;      /* Purple - agents */
  --accent: 142 76% 36%;         /* Green - success */
  --destructive: 0 84% 60%;      /* Red - errors/risks */
  --warning: 38 92% 50%;         /* Orange - warnings */
  --muted: 0 0% 14.9%;
  
  /* Agent tier colors */
  --tier-intake: 199 89% 48%;    /* Cyan */
  --tier-research: 262 83% 58%;  /* Purple */
  --tier-strategy: 38 92% 50%;   /* Orange */
  --tier-document: 142 76% 36%;  /* Green */
  --tier-execution: 221 83% 53%; /* Blue */
  --tier-intelligence: 330 81% 60%; /* Pink */
}
```

---

## 1.2 Core UI Components (Hour 1-2)

### Landing Page Design
- Hero section with animated agent visualization
- "Start Your Journey" CTA
- Feature highlights (25 agents, risk detection, etc.)
- Demo showcase section

### Main Dashboard Layout
- Left sidebar with navigation
- Central workspace for process visualization
- Right panel for agent activity stream
- Bottom section for document checklist

### Key UI Components to Build:
1. **ProcessInput** - Hinglish-friendly input with suggestions
2. **AgentActivityStream** - Real-time agent updates
3. **AgentCard** - Individual agent status display
4. **StatusBadge** - Process status indicators

---

## 1.3 Agent Base Architecture (Hour 2-3)

### Agent Type Definitions (types/agents.ts)
```typescript
export interface Agent {
  id: string;
  name: string;
  displayName: string;
  tier: 'intake' | 'research' | 'strategy' | 'document' | 'execution' | 'intelligence';
  description: string;
  icon: string;
  model: 'gemini-2.0-flash' | 'gemini-2.0-flash-thinking-exp';
  status: 'idle' | 'thinking' | 'complete' | 'error';
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'INFO' | 'WARNING' | 'QUERY' | 'RESPONSE' | 'CONSENSUS';
  content: any;
  timestamp: Date;
  confidence?: number;
}

export interface AgentOutput {
  agentId: string;
  result: any;
  reasoning: string;
  suggestions?: string[];
  warnings?: string[];
}
```

### Orchestrator Design
```typescript
// lib/agents/orchestrator.ts
export class AgentOrchestrator {
  private agents: Map<string, Agent>;
  private messageQueue: AgentMessage[];
  private eventEmitter: EventEmitter;

  async processQuery(query: string): Promise<ProcessResult> {
    // 1. Intent Decoder → Understand query
    // 2. Location + Business + Scale → Classify
    // 3. Research agents → Gather requirements
    // 4. Strategy agents → Build plan
    // 5. Document agents → Prepare checklists
    // 6. Intelligence agents → Risk analysis
    // 7. Compile final output
  }

  emitActivity(activity: AgentActivity) {
    // Stream to UI in real-time
  }
}
```

---

## 1.4 Knowledge Base Setup (Hour 3-4)

### Data Structure Examples

**Restaurant Business Type (data/business-types/restaurant.json)**
```json
{
  "id": "restaurant",
  "name": "Restaurant / Food Service",
  "subTypes": [
    { "id": "dine-in", "name": "Dine-in Restaurant" },
    { "id": "cloud-kitchen", "name": "Cloud Kitchen" },
    { "id": "cafe", "name": "Cafe (No Cooking)" },
    { "id": "qsr", "name": "Quick Service Restaurant" },
    { "id": "bar-restaurant", "name": "Bar + Restaurant" },
    { "id": "food-truck", "name": "Food Truck" }
  ],
  "defaultLicenses": [
    "fssai", "gst", "fire-noc", "shop-establishment", 
    "health-trade-license", "signage-license"
  ],
  "conditionalLicenses": {
    "bar-restaurant": ["liquor-license", "excise-permit"],
    "food-truck": ["mobile-vendor-license"]
  },
  "scaleThresholds": {
    "employees": { "epfo": 20, "esic": 10 },
    "turnover": { "gst": 4000000 },
    "area": { "fire-noc-mandatory": 500 }
  }
}
```

**Maharashtra State Rules (data/states/maharashtra.json)**
```json
{
  "id": "maharashtra",
  "name": "Maharashtra",
  "majorCities": ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "licenses": {
    "shop-establishment": {
      "localName": "Gumasta License",
      "authority": "Labour Commissioner",
      "timeline": { "min": 15, "max": 30, "avg": 22 },
      "fees": { "base": 1500, "renewal": 500 },
      "documents": ["pan", "aadhaar", "rent-agreement", "photos"],
      "onlinePortal": "https://mahakamgar.maharashtra.gov.in"
    },
    "health-trade-license": {
      "localName": "BMC Health License",
      "authority": "BMC Health Department",
      "timeline": { "min": 10, "max": 21, "avg": 14 },
      "fees": { "base": 2500, "annual": 2500 }
    }
  },
  "specialRules": [
    "Building must have Occupancy Certificate for Fire NOC",
    "Residential zone requires Land Use Conversion"
  ]
}
```

---

# PHASE 2: AGENT ARMY (Hours 4-12)

## 2.1 Tier 1: Intake Battalion (Hour 4-5)

### Agent 1: Intent Decoder
```typescript
// adk/agents/intake/intent-decoder.ts
export const intentDecoderAgent = {
  name: "intent_decoder",
  model: "gemini-2.0-flash",
  instruction: `You are the Intent Decoder Agent. Your job is to understand what the user wants.

CAPABILITIES:
- Parse Hinglish queries ("bhai restaurant kholna hai")
- Identify business intent (START, MODIFY, CLOSE, RENEW, QUERY)
- Extract location information
- Identify urgency level
- Generate clarifying questions if needed

OUTPUT FORMAT:
{
  "intent": "START_BUSINESS | RENEW_LICENSE | QUERY | ...",
  "businessType": "detected type or null",
  "location": { "city": "", "state": "" },
  "urgency": "normal | urgent | critical",
  "confidence": 0.0-1.0,
  "clarifyingQuestions": ["question1", "question2"],
  "rawEntities": { ... }
}

Be smart about Hinglish. "kholna" = open/start, "banana" = make, "lagega" = required.`,
};
```

### Agent 2: Location Intelligence
```typescript
// adk/agents/intake/location-intelligence.ts
export const locationIntelligenceAgent = {
  name: "location_intelligence",
  model: "gemini-2.0-flash",
  instruction: `You are the Location Intelligence Agent. You know state and city-specific rules.

KNOWLEDGE BASE ACCESS: You have access to state-specific data.

YOUR JOB:
1. Identify correct state from city name
2. Apply state-specific license requirements
3. Identify municipal corporation rules
4. Flag location-specific challenges

OUTPUT:
{
  "state": "Maharashtra",
  "city": "Mumbai",
  "municipality": "BMC",
  "zone": "commercial | residential | mixed",
  "specialRules": ["list of location-specific rules"],
  "stateVariations": ["how this differs from other states"]
}`,
};
```

### Agent 3: Business Classifier
### Agent 4: Scale Analyzer

---

## 2.2 Tier 2: Research Battalion (Hour 5-7)

### Agent 5: Regulation Librarian
```typescript
export const regulationLibrarianAgent = {
  name: "regulation_librarian",
  model: "gemini-2.0-flash",
  instruction: `You are the Regulation Librarian. You know ALL Indian business laws.

KNOWLEDGE:
- 50+ Central Acts (FSSAI Act, Companies Act, GST Act, etc.)
- State variations
- Recent amendments (2024-2025)
- Citizen charters and timelines

ALWAYS cite specific sections: "As per Section 31 of FSSAI Act 2006..."

OUTPUT:
{
  "applicableLaws": [
    { "act": "FSSAI Act 2006", "relevantSections": ["31", "32"], "requirement": "..." }
  ],
  "exemptions": ["list of applicable exemptions"],
  "recentChanges": ["any recent amendments"]
}`,
};
```

### Agent 6: Policy Scout (uses web search simulation)
### Agent 7: Document Detective
### Agent 8: Department Mapper

---

## 2.3 Tier 3: Strategy Battalion (Hour 7-9)

### Agent 9: Dependency Graph Builder
```typescript
export const dependencyBuilderAgent = {
  name: "dependency_builder",
  model: "gemini-2.0-flash",
  instruction: `You are the Dependency Graph Builder. You map what depends on what.

CREATE dependency graph showing:
- Which licenses need which documents
- Which licenses are prerequisites for others
- Critical path (longest chain)

OUTPUT:
{
  "nodes": [
    { "id": "pan", "type": "document", "name": "PAN Card" },
    { "id": "gst", "type": "license", "name": "GST Registration", "dependencies": ["pan"] }
  ],
  "edges": [
    { "from": "pan", "to": "gst", "type": "requires" }
  ],
  "criticalPath": ["pan", "gst", "fssai", "shop-establishment"],
  "parallelGroups": [["fire-noc", "health-license"], ["gst", "fssai"]]
}`,
};
```

### Agent 10: Timeline Architect
### Agent 11: Parallel Path Optimizer
### Agent 12: Cost Calculator
### Agent 13: Risk Assessor

---

## 2.4 Tier 4: Document Battalion (Hour 9-10)

### Agent 14: Form Wizard
### Agent 15: Document Validator
### Agent 16: RTI Drafter
### Agent 17: Grievance Writer
### Agent 18: Appeal Crafter

---

## 2.5 Tier 5: Execution Battalion (Hour 10-11)

### Agent 19: Visit Planner
### Agent 20: Reminder Engine
### Agent 21: Status Tracker

---

## 2.6 Tier 6: Intelligence Battalion (Hour 11-12)

### Agent 22: Corruption Detector
```typescript
export const corruptionDetectorAgent = {
  name: "corruption_detector",
  model: "gemini-2.0-flash",
  instruction: `You are the Corruption Detector. You identify RED FLAGS.

ANALYZE:
- Timeline vs expected (>2x = suspicious)
- Known problematic departments
- Common excuse patterns ("file not found")
- Illegal requests ("facilitation fee")

OUTPUT:
{
  "riskScore": 0-10,
  "redFlags": [
    {
      "type": "DELAY | BRIBE_REQUEST | DOCUMENT_LOSS",
      "description": "...",
      "action": "File RTI | Complain on CPGRAMS | ...",
      "urgency": "immediate | soon | later"
    }
  ],
  "preventiveMeasures": ["Always get acknowledgment", "Apply via RTPS"]
}`,
};
```

### Agent 23: Comparison Agent
### Agent 24: What-If Simulator
### Agent 25: Expert Simulator

---

# PHASE 3: UI IMPLEMENTATION (Hours 12-18)

## 3.1 Landing Page (Hour 12-13)

### Hero Section
- Animated visualization of 25 agents in a grid
- "Government Process GPS" headline
- Hinglish-friendly input field
- Example queries as suggestions

### Features Section
- 25 Specialized Agents
- Risk Detection
- Parallel Execution Optimizer
- One-Click RTI Generator
- State Comparison

---

## 3.2 Main Dashboard (Hour 13-15)

### Layout Components
```
+------------------------------------------------------------------+
|  [Logo] BUREAUCRACY BREAKER         [Search]        [Settings]    |
+------------------------------------------------------------------+
|         |                                    |                    |
| SIDEBAR |        MAIN WORKSPACE              |  AGENT ACTIVITY    |
|         |                                    |                    |
| - Home  |  [Process Input Form]              |  [Live Stream]     |
| - My    |                                    |                    |
|   Cases |  +------------------------+        |  [10:30] Intent    |
| - Docs  |  | Process Visualization  |        |  Decoder: Query    |
| - Help  |  | - Journey Map          |        |  understood...     |
|         |  | - Timeline             |        |                    |
|         |  | - Dependencies         |        |  [10:31] Location  |
|         |  +------------------------+        |  Agent: Mumbai,    |
|         |                                    |  Maharashtra...    |
|         |  +------------------------+        |                    |
|         |  | Results Panel          |        |  [10:32] Risk      |
|         |  | - Documents            |        |  Agent: Warning!   |
|         |  | - Costs                |        |  Zone issue...     |
|         |  | - Risks                |        |                    |
|         |  +------------------------+        |                    |
+------------------------------------------------------------------+
```

### Key Interactive Components

**1. ProcessInput Component**
```typescript
// Smart input with Hinglish support
// Auto-suggestions based on typing
// Voice input option
// Example queries as chips
```

**2. AgentActivityStream Component**
```typescript
// Real-time updates from all agents
// Color-coded by agent tier
// Expandable for details
// Shows agent "thinking" state
```

**3. ProcessVisualization Tabs**
- Journey Map (flowchart)
- Timeline (Gantt chart)
- Dependencies (network graph)
- Costs (sunburst chart)

---

## 3.3 Agent Visualization (Hour 15-16)

### Agent Grid Display
```typescript
// 5x5 grid showing all 25 agents
// Animated when active
// Pulse effect when communicating
// Connection lines between collaborating agents
```

### Agent Debate Viewer
```typescript
// Chat-like interface showing agent discussions
// Timeline of decisions
// Consensus indicators
// Reasoning transparency
```

---

## 3.4 Results Display (Hour 16-18)

### Document Checklist Component
- Categorized list (Identity, Address, Business, Technical)
- Checkboxes for completion tracking
- Specifications (size, format, attestation)
- Download template buttons

### Cost Breakdown Component
- Official fees vs practical costs
- State comparison
- Category breakdown (licenses, docs, consultants)
- Interactive sunburst chart

### Risk Analysis Component
- Risk score visualization
- High/Medium/Low categorization
- Actionable recommendations
- "Fix this" quick actions

### Timeline View Component
- Interactive Gantt chart
- Parallel execution visualization
- Critical path highlighting
- Drag to reschedule (simulation)

---

# PHASE 4: INTEGRATION & POLISH (Hours 18-22)

## 4.1 API Integration (Hour 18-19)

### Main Analysis Endpoint
```typescript
// app/api/analyze/route.ts
export async function POST(req: Request) {
  const { query } = await req.json();
  
  const orchestrator = new AgentOrchestrator();
  
  // Stream responses to client
  const stream = new ReadableStream({
    async start(controller) {
      orchestrator.on('activity', (activity) => {
        controller.enqueue(JSON.stringify(activity));
      });
      
      const result = await orchestrator.processQuery(query);
      controller.enqueue(JSON.stringify({ type: 'complete', result }));
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

### Real-time Updates
- Server-Sent Events for agent activity
- WebSocket alternative for bidirectional
- Optimistic UI updates

---

## 4.2 Animations & Micro-interactions (Hour 19-20)

### Framer Motion Animations
```typescript
// Agent activation animation
// Data loading skeletons
// Tab transitions
// Success/error states
// Agent collaboration lines
```

### Key Animations
1. Agent grid "activation" wave
2. Activity stream scroll
3. Chart data transitions
4. Risk score counter
5. Progress indicators

---

## 4.3 Demo Scenarios (Hour 20-21)

### Scenario 1: Restaurant in Mumbai
```
Input: "Bhai Mumbai mein restaurant kholna hai"
Expected output:
- 12 licenses identified
- 47 documents needed
- Rs 45,000-65,000 cost
- 35-50 days timeline
- 3 high risks (zone issue, OC requirement, etc.)
```

### Scenario 2: IT Company in Bangalore
```
Input: "Starting a software company in Bangalore with 5 employees"
Expected output:
- Company registration options
- GST requirements
- No EPFO/ESIC (under threshold)
- Startup India benefits applicable
```

### Scenario 3: Stuck Application
```
Input: "My Fire NOC is stuck for 60 days"
Expected output:
- High corruption risk score
- RTI application generated
- CPGRAMS complaint draft
- Escalation path
```

---

## 4.4 Final Polish (Hour 21-22)

### Performance Optimization
- Code splitting
- Image optimization
- Lazy loading for charts
- Caching strategies

### Responsive Design
- Mobile-friendly dashboard
- Touch-friendly interactions
- Collapsible sidebar

### Error Handling
- Graceful degradation
- Retry mechanisms
- User-friendly error messages

---

# PHASE 5: DEPLOYMENT & PRESENTATION (Hours 22-24)

## 5.1 Deployment (Hour 22-23)

### Vercel Deployment
```bash
vercel --prod
```

### Environment Variables
```
GOOGLE_GENAI_API_KEY=xxx
NEXT_PUBLIC_APP_URL=xxx
```

---

## 5.2 Presentation Prep (Hour 23-24)

### Demo Script
1. **Hook** (30s): Show the problem - complex bureaucracy
2. **Solution** (1m): Introduce the 25-agent army
3. **Demo 1** (2m): Restaurant in Mumbai - full flow
4. **Demo 2** (1m): Stuck application rescue
5. **Tech Deep Dive** (1m): Agent collaboration, knowledge base
6. **Impact** (30s): 1.4 billion Indians affected
7. **Close** (30s): Call to action

### Key Talking Points
- "Not one AI - an ecosystem of 25 specialized agents"
- "Each agent has deep expertise - like 25 consultants"
- "Watch them debate and reach consensus"
- "Catches problems before you waste money"
- "One-click escalation with legal RTI drafts"

---

# IMPLEMENTATION PRIORITY

## MUST HAVE (MVP)
- [ ] Basic UI with shadcn components
- [ ] 10 core agents working
- [ ] 1 complete demo flow (restaurant)
- [ ] Agent activity visualization
- [ ] Document checklist output
- [ ] Cost breakdown
- [ ] Timeline estimation

## SHOULD HAVE
- [ ] All 25 agents
- [ ] Risk analysis
- [ ] Multiple business types
- [ ] State comparison
- [ ] Dependency graph visualization

## NICE TO HAVE
- [ ] RTI generator
- [ ] What-if simulator
- [ ] Corruption detector
- [ ] Expert simulator
- [ ] Mobile responsive

---

# QUICK WINS FOR JUDGES

1. **Agent Army Visualization** - Instant wow factor
2. **Real-time Activity Stream** - Shows agents working
3. **Risk Detection** - Practical value demonstration
4. **Hinglish Support** - Relatability for Indian judges
5. **State Comparison** - Data-driven insights
6. **One-click RTI** - Actionable output

---

# FILE CHECKLIST

## UI Components (Priority Order)
- [ ] `components/ui/*` - shadcn setup
- [ ] `components/layout/Sidebar.tsx`
- [ ] `components/layout/Header.tsx`
- [ ] `components/process/ProcessInput.tsx`
- [ ] `components/agents/AgentActivityStream.tsx`
- [ ] `components/agents/AgentCard.tsx`
- [ ] `components/agents/AgentGrid.tsx`
- [ ] `components/process/DocumentChecklist.tsx`
- [ ] `components/process/ProcessTimeline.tsx`
- [ ] `components/process/ProcessCostBreakdown.tsx`
- [ ] `components/process/ProcessRiskAnalysis.tsx`

## Pages
- [ ] `app/page.tsx` - Landing
- [ ] `app/(app)/layout.tsx` - App layout
- [ ] `app/(app)/dashboard/page.tsx` - Main dashboard

## Agents (Priority Order)
- [ ] `adk/agents/orchestrator/index.ts`
- [ ] `adk/agents/intake/intent-decoder.ts`
- [ ] `adk/agents/intake/location-intelligence.ts`
- [ ] `adk/agents/intake/business-classifier.ts`
- [ ] `adk/agents/research/document-detective.ts`
- [ ] `adk/agents/strategy/timeline-architect.ts`
- [ ] `adk/agents/strategy/cost-calculator.ts`
- [ ] `adk/agents/strategy/risk-assessor.ts`

## Data Files
- [ ] `data/business-types/restaurant.json`
- [ ] `data/states/maharashtra.json`
- [ ] `data/licenses/fssai.json`
- [ ] `data/licenses/gst.json`

---

# LET'S BUILD THIS!

Execute phases sequentially. Focus on visual impact first, then depth.
The goal is to make judges say "BRO IS THIS REALLY BUILT IN 24 HOURS?!"

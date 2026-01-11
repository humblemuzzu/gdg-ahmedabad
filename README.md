# Bureaucracy Breaker

**Your Government Process GPS** - Cut through red tape with AI-powered guidance.

An AI-powered multi-agent system that helps Indian citizens navigate complex government bureaucratic processes. Instead of a single chatbot, Bureaucracy Breaker deploys an army of **25+ specialized AI agents** that collaborate, debate, and produce complete "battle plans" for any government-related task.

## The Problem

Every year, millions of Indians struggle with:
- Starting a business (12+ licenses, 50+ documents, 6+ months)
- Navigating confusing government portals
- Different rules for different states
- Hidden requirements that cause rejections
- Corruption and unnecessary delays
- No single source of truth

**Result**: Lost time, money, and opportunities.

## The Solution

Bureaucracy Breaker transforms this chaos into clarity with:

- **25+ Specialized AI Agents** - Each expert in their domain
- **Real-time Agent Collaboration** - Watch agents debate and reach consensus
- **Complete Battle Plans** - Timelines, documents, costs, risks
- **Hinglish Support** - "Bhai restaurant kholna hai Mumbai mein"
- **State-wise Intelligence** - Maharashtra ≠ Karnataka ≠ Gujarat
- **Risk Detection** - Catch problems before they cost you

## Features

### Multi-Agent System

The agent army is organized into 6 specialized battalions:

| Battalion | Agents | Purpose |
|-----------|--------|---------|
| **Intake** | Intent Decoder, Location Intelligence, Business Classifier, Scale Analyzer | Understand exactly what you need |
| **Research** | Regulation Librarian, Policy Scout, Document Detective, Department Mapper | Gather all requirements |
| **Strategy** | Dependency Builder, Timeline Architect, Parallel Optimizer, Cost Calculator, Risk Assessor | Build your optimal plan |
| **Document** | Form Wizard, Document Validator, RTI Drafter, Grievance Writer, Appeal Crafter | Handle all paperwork |
| **Execution** | Visit Planner, Reminder Engine, Status Tracker | Get things done efficiently |
| **Intelligence** | Corruption Detector, Comparison Agent, What-If Simulator, Expert Simulator | Smart insights & protection |

### Key Capabilities

- **Process Visualization** - Interactive flowcharts, Gantt charts, dependency graphs
- **Document Checklist** - Exhaustive lists with exact specifications
- **Cost Breakdown** - Official fees vs realistic costs
- **Timeline Estimation** - Parallel execution optimization (save 25+ days!)
- **Risk Analysis** - High/Medium/Low categorization with actionable fixes
- **RTI Generator** - Auto-draft RTI applications when things get stuck
- **State Comparison** - See how your state compares to others
- **Corruption Detection** - Identify red flags and know your rights

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS 4
- **AI**: Google ADK with Gemini 2.0 Flash
- **Language**: TypeScript
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Google AI API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/bureaucracy-breaker.git
cd bureaucracy-breaker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your GOOGLE_GENAI_API_KEY to .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

```env
GOOGLE_GENAI_API_KEY=your_google_ai_api_key
```

## Deployment (Google Cloud Run)

This repo is deployable as a single Cloud Run service (frontend + Next.js API routes).

- Create a Secret Manager secret named `GOOGLE_GENAI_API_KEY`
- Deploy via Cloud Build: `gcloud builds submit --config cloudbuild.yaml .`
- Or deploy from your machine: `./deploy-cloudrun.sh` (edit `PROJECT_ID` first)

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Main application routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── process/       # Process detail views
│   │   └── history/       # Case history
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── agents/            # Agent visualization
│   ├── process/           # Process-related components
│   └── layout/            # Layout components
├── lib/                   # Utilities and services
│   ├── agents/            # Agent orchestration
│   ├── services/          # Business logic
│   └── data/              # Static data
├── adk/                   # Google ADK agent definitions
│   ├── agents/            # All 25 agent definitions
│   ├── prompts/           # Agent prompt templates
│   └── tools/             # Agent tools
└── data/                  # Knowledge base
    ├── business-types/    # Business type definitions
    ├── states/            # State-specific rules
    ├── licenses/          # License information
    └── templates/         # Document templates
```

## Demo Scenarios

### 1. Starting a Restaurant in Mumbai
```
Input: "Bhai Mumbai mein restaurant kholna hai"

Output:
- 12 licenses identified
- 47 documents needed
- ₹45,000-65,000 estimated cost
- 35-50 days timeline (with parallel execution)
- 3 high risks flagged (zone issue, OC requirement, etc.)
```

### 2. IT Company in Bangalore
```
Input: "Starting a software company in Bangalore with 5 employees"

Output:
- Company registration options (Pvt Ltd vs LLP)
- GST requirements
- No EPFO/ESIC needed (under threshold)
- Startup India benefits applicable
```

### 3. Stuck Application
```
Input: "My Fire NOC is stuck for 60 days"

Output:
- High corruption risk score identified
- RTI application auto-generated
- CPGRAMS complaint draft ready
- Escalation path mapped
```

## How It Works

1. **Query Understanding**: The Intent Decoder parses your request (even in Hinglish)
2. **Classification**: Business Classifier and Scale Analyzer identify exact requirements
3. **Research**: Research battalion gathers all applicable rules and documents
4. **Planning**: Strategy battalion builds optimal execution plan
5. **Visualization**: Results displayed as interactive timelines and checklists
6. **Execution**: Track progress, get reminders, escalate when needed

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Built for GDG Ahmedabad Hackathon
- Powered by Google's Gemini AI
- UI components from shadcn/ui

---

**Bureaucracy Breaker** - Because navigating government shouldn't require a PhD.

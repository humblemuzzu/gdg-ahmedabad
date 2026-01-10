# EXECUTION CHECKLIST - 24 HOURS

## HOUR 0-1: Setup
```bash
# Run these commands in order
npx shadcn@latest init
# Choose: New York style, Zinc color, CSS variables: yes

npx shadcn@latest add button card input textarea badge avatar dialog sheet tabs accordion progress skeleton toast scroll-area separator tooltip

npm install framer-motion lucide-react clsx tailwind-merge class-variance-authority zustand
```

- [ ] shadcn initialized
- [ ] Core components added
- [ ] Additional dependencies installed
- [ ] Folder structure created

---

## HOUR 1-2: Theme & Layout

### Update globals.css with dark theme
- [ ] Custom CSS variables for agent tier colors
- [ ] Dark mode styling
- [ ] Custom scrollbar
- [ ] Glow effects for agents

### Create Layout Components
- [ ] `components/layout/Sidebar.tsx`
- [ ] `components/layout/Header.tsx`
- [ ] `app/(app)/layout.tsx`

---

## HOUR 2-3: Landing Page

### Create `app/page.tsx`
- [ ] Hero section with headline
- [ ] Animated agent grid preview
- [ ] Input field with examples
- [ ] Feature cards (25 agents, risk detection, etc.)
- [ ] "Start Your Journey" CTA

---

## HOUR 3-4: Core Types & Data

### Create Type Definitions
- [ ] `types/index.ts` - All TypeScript interfaces
- [ ] `types/agents.ts` - Agent types
- [ ] `types/process.ts` - Process types

### Create Initial Data Files
- [ ] `data/business-types/restaurant.json`
- [ ] `data/states/maharashtra.json`
- [ ] `data/licenses/fssai.json`
- [ ] `data/licenses/gst.json`
- [ ] `data/licenses/fire-noc.json`

---

## HOUR 4-6: Agent Prompts

### Create Agent Prompt Templates
- [ ] `adk/prompts/templates.ts` - All 25 agent prompts
- [ ] Intake tier prompts (4 agents)
- [ ] Research tier prompts (4 agents)
- [ ] Strategy tier prompts (5 agents)
- [ ] Document tier prompts (5 agents)
- [ ] Execution tier prompts (3 agents)
- [ ] Intelligence tier prompts (4 agents)

---

## HOUR 6-8: Orchestrator

### Build Main Orchestrator
- [ ] `lib/agents/orchestrator.ts`
- [ ] Agent registration
- [ ] Message passing system
- [ ] Event emitter for UI updates
- [ ] Sequential/parallel execution logic

### API Route
- [ ] `app/api/analyze/route.ts`
- [ ] Streaming response setup
- [ ] Error handling

---

## HOUR 8-10: Dashboard UI

### Main Dashboard
- [ ] `app/(app)/dashboard/page.tsx`
- [ ] Three-column layout
- [ ] Process input form
- [ ] Results panel placeholder

### Agent Components
- [ ] `components/agents/AgentCard.tsx`
- [ ] `components/agents/AgentGrid.tsx`
- [ ] `components/agents/AgentActivityStream.tsx`
- [ ] `components/agents/AgentAvatar.tsx`

---

## HOUR 10-12: Process Input & Output

### Input Component
- [ ] `components/process/ProcessInput.tsx`
- [ ] Hinglish-friendly placeholder
- [ ] Example query chips
- [ ] Submit handler

### Output Components
- [ ] `components/process/DocumentChecklist.tsx`
- [ ] `components/process/ProcessTimeline.tsx`
- [ ] `components/process/ProcessCostBreakdown.tsx`
- [ ] `components/process/ProcessRiskAnalysis.tsx`

---

## HOUR 12-14: Integration

### Connect Frontend to Backend
- [ ] API call from ProcessInput
- [ ] Stream handling in React
- [ ] State management with Zustand
- [ ] Real-time agent updates

### Test Full Flow
- [ ] Input → Agents → Output working
- [ ] Agent activity streaming
- [ ] Results displaying correctly

---

## HOUR 14-16: Visualizations

### Charts & Graphs
- [ ] Gantt chart for timeline
- [ ] Cost breakdown chart
- [ ] Risk score visualization
- [ ] Agent collaboration lines

### Animations
- [ ] Agent activation effects
- [ ] Loading states
- [ ] Transition animations
- [ ] Success celebrations

---

## HOUR 16-18: Polish

### Responsive Design
- [ ] Mobile sidebar collapse
- [ ] Touch-friendly buttons
- [ ] Readable on small screens

### Error States
- [ ] Loading skeletons
- [ ] Error messages
- [ ] Empty states
- [ ] Retry buttons

---

## HOUR 18-20: Demo Scenarios

### Pre-build Demo Data
- [ ] Restaurant in Mumbai (full data)
- [ ] IT Company in Bangalore
- [ ] Stuck Application scenario

### Test Each Scenario
- [ ] End-to-end working
- [ ] All outputs correct
- [ ] Visual flow smooth

---

## HOUR 20-22: More Agents & Features

### Implement Remaining Agents
- [ ] RTI Drafter
- [ ] Corruption Detector
- [ ] What-If Simulator
- [ ] Expert Simulator

### Additional Features
- [ ] State comparison view
- [ ] Document validator
- [ ] Visit planner output

---

## HOUR 22-23: Deployment

### Deploy to Vercel
```bash
vercel --prod
```

- [ ] Environment variables set
- [ ] Build passing
- [ ] Live URL working

### Final Testing
- [ ] Full demo flow on prod
- [ ] Performance check
- [ ] Mobile test

---

## HOUR 23-24: Presentation

### Prepare Demo
- [ ] Script memorized
- [ ] Backup scenarios ready
- [ ] Offline fallback if needed

### Key Demo Points
1. Show agent army activating (visual)
2. Show real-time activity stream
3. Show complete output (docs, costs, risks)
4. Show risk detection saving user from rejection
5. Show RTI generation for stuck case
6. Show state comparison insights

---

# CRITICAL PATH (MINIMUM VIABLE DEMO)

If time is tight, MUST complete:

1. [ ] Landing page with input
2. [ ] 5 core agents working:
   - Intent Decoder
   - Location Intelligence
   - Document Detective
   - Timeline Architect
   - Cost Calculator
3. [ ] Agent activity stream (shows work happening)
4. [ ] Document checklist output
5. [ ] Cost breakdown output
6. [ ] Basic timeline output

This alone = impressive demo!

---

# EMERGENCY SHORTCUTS

### If agents not working in time:
- Pre-compute results for demo scenarios
- Show UI with mock data
- Focus on visualization over AI accuracy

### If UI not ready:
- Use shadcn defaults (still looks good)
- Skip animations
- Focus on functionality

### If no time for all 25 agents:
- 10 agents with good prompts > 25 with bad ones
- Focus on intake + strategy tiers
- Skip document/execution tiers

---

# SUCCESS METRICS

## Visual Impact
- [ ] Agent army visualization
- [ ] Real-time activity updates
- [ ] Beautiful dark theme
- [ ] Smooth animations

## Functional Demo
- [ ] Query → Complete result
- [ ] Multiple scenarios working
- [ ] Hinglish support

## Technical Depth
- [ ] Agent collaboration visible
- [ ] Knowledge base evident
- [ ] Risk detection working

## Presentation
- [ ] Clear problem statement
- [ ] Compelling demo flow
- [ ] Technical explanation ready
- [ ] Impact statement clear

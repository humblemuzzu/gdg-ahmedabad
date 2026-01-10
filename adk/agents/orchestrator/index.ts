import { SequentialAgent } from "@google/adk";
import { intentDecoderAgent } from "../intake/intent-decoder";
import { locationIntelligenceAgent } from "../intake/location-intelligence";
import { businessClassifierAgent } from "../intake/business-classifier";
import { scaleAnalyzerAgent } from "../intake/scale-analyzer";
import { regulationLibrarianAgent } from "../research/regulation-librarian";
import { policyScoutAgent } from "../research/policy-scout";
import { documentDetectiveAgent } from "../research/document-detective";
import { departmentMapperAgent } from "../research/department-mapper";
import { dependencyBuilderAgent } from "../strategy/dependency-builder";
import { timelineArchitectAgent } from "../strategy/timeline-architect";
import { parallelOptimizerAgent } from "../strategy/parallel-optimizer";
import { costCalculatorAgent } from "../strategy/cost-calculator";
import { riskAssessorAgent } from "../strategy/risk-assessor";
import { formWizardAgent } from "../document/form-wizard";
import { documentValidatorAgent } from "../document/document-validator";
import { rtiDrafterAgent } from "../document/rti-drafter";
import { grievanceWriterAgent } from "../document/grievance-writer";
import { appealCrafterAgent } from "../document/appeal-crafter";
import { visitPlannerAgent } from "../execution/visit-planner";
import { reminderEngineAgent } from "../execution/reminder-engine";
import { statusTrackerAgent } from "../execution/status-tracker";
import { corruptionDetectorAgent } from "../intelligence/corruption-detector";
import { comparisonAgent } from "../intelligence/comparison-agent";
import { whatIfSimulatorAgent } from "../intelligence/whatif-simulator";
import { expertSimulatorAgent } from "../intelligence/expert-simulator";
import { finalCompilerAgent } from "./final-compiler";

export const bureaucracyBreakerAgent = new SequentialAgent({
  name: "bureaucracy_breaker",
  description: "Runs the full Bureaucracy Breaker 25-agent pipeline.",
  subAgents: [
    // Tier 1: Intake
    intentDecoderAgent,
    locationIntelligenceAgent,
    businessClassifierAgent,
    scaleAnalyzerAgent,

    // Tier 2: Research
    regulationLibrarianAgent,
    policyScoutAgent,
    documentDetectiveAgent,
    departmentMapperAgent,

    // Tier 3: Strategy
    dependencyBuilderAgent,
    timelineArchitectAgent,
    parallelOptimizerAgent,
    costCalculatorAgent,
    riskAssessorAgent,

    // Tier 4: Document
    formWizardAgent,
    documentValidatorAgent,
    rtiDrafterAgent,
    grievanceWriterAgent,
    appealCrafterAgent,

    // Tier 5: Execution
    visitPlannerAgent,
    reminderEngineAgent,
    statusTrackerAgent,

    // Tier 6: Intelligence
    corruptionDetectorAgent,
    comparisonAgent,
    whatIfSimulatorAgent,
    expertSimulatorAgent,

    // Final aggregation
    finalCompilerAgent,
  ],
});


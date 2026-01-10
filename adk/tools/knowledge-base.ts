import { FunctionTool } from "@google/adk";
import { Type } from "@google/genai";
import { getKnowledgeBase } from "../../lib/knowledge-base";

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

function toStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = val == null ? "" : String(val);
  }
  return out;
}

function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    const k = String(key).trim();
    if (k in variables) return variables[k];
    return match;
  });
}

export const kbSearchTool = new FunctionTool({
  name: "kb_search",
  description: "Search the local Bureaucracy Breaker knowledge base (no web).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "Natural language search query." },
      maxCount: { type: Type.INTEGER, description: "Maximum number of results." },
    },
    required: ["query"],
  },
  execute: async (input: unknown) => {
    const kb = getKnowledgeBase();
    const record = asRecord(input);
    const query = String(record.query ?? "");
    const maxCount = typeof record.maxCount === "number" ? record.maxCount : 10;
    return kb.search(query, maxCount);
  },
});

export const kbGetBusinessTypeTool = new FunctionTool({
  name: "kb_get_business_type",
  description: "Fetch a business type by id from the knowledge base.",
  parameters: {
    type: Type.OBJECT,
    properties: { id: { type: Type.STRING, description: "Business type id (e.g., restaurant)." } },
    required: ["id"],
  },
  execute: async (input: unknown) => {
    const kb = getKnowledgeBase();
    const record = asRecord(input);
    return kb.getBusinessType(String(record.id ?? ""));
  },
});

export const kbListBusinessTypesTool = new FunctionTool({
  name: "kb_list_business_types",
  description: "List all known business types in the knowledge base.",
  execute: async () => {
    const kb = getKnowledgeBase();
    return kb.listBusinessTypes();
  },
});

export const kbGetStateTool = new FunctionTool({
  name: "kb_get_state",
  description: "Fetch a state rules record by id (e.g., maharashtra).",
  parameters: {
    type: Type.OBJECT,
    properties: { id: { type: Type.STRING, description: "State id (lowercase, hyphenated)." } },
    required: ["id"],
  },
  execute: async (input: unknown) => {
    const kb = getKnowledgeBase();
    const record = asRecord(input);
    return kb.getState(String(record.id ?? ""));
  },
});

export const kbListStatesTool = new FunctionTool({
  name: "kb_list_states",
  description: "List all states in the knowledge base.",
  execute: async () => {
    const kb = getKnowledgeBase();
    return kb.listStates();
  },
});

export const kbResolveStateByCityTool = new FunctionTool({
  name: "kb_resolve_state_by_city",
  description: "Resolve state and municipality from a city name using the knowledge base.",
  parameters: {
    type: Type.OBJECT,
    properties: { city: { type: Type.STRING, description: "City name (e.g., Mumbai)." } },
    required: ["city"],
  },
  execute: async (input: unknown) => {
    const kb = getKnowledgeBase();
    const record = asRecord(input);
    return kb.resolveStateByCity(String(record.city ?? ""));
  },
});

export const kbGetLicenseTool = new FunctionTool({
  name: "kb_get_license",
  description: "Fetch a license requirement by id (e.g., fssai, gst).",
  parameters: {
    type: Type.OBJECT,
    properties: { id: { type: Type.STRING, description: "License id." } },
    required: ["id"],
  },
  execute: async (input: unknown) => {
    const kb = getKnowledgeBase();
    const record = asRecord(input);
    return kb.getLicense(String(record.id ?? ""));
  },
});

export const kbListLicensesTool = new FunctionTool({
  name: "kb_list_licenses",
  description: "List all licenses in the knowledge base.",
  execute: async () => {
    const kb = getKnowledgeBase();
    return kb.listLicenses();
  },
});

export const kbGetTemplatesTool = new FunctionTool({
  name: "kb_get_templates",
  description: "Fetch RTI/grievance/appeal templates bundle from the knowledge base.",
  execute: async () => {
    const kb = getKnowledgeBase();
    return kb.getTemplates();
  },
});

export const kbGetStatisticsTool = new FunctionTool({
  name: "kb_get_statistics",
  description: "Fetch processing-time and department-performance statistics from the knowledge base.",
  execute: async () => {
    const kb = getKnowledgeBase();
    return kb.getStatistics();
  },
});

export const kbRenderTemplateTool = new FunctionTool({
  name: "kb_render_template",
  description:
    "Render a template from the knowledge base by replacing {placeholders} with provided variables.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      kind: { type: Type.STRING, description: "One of: rti | grievance | appeal." },
      templateId: { type: Type.STRING, description: "Template id (e.g., rti-status-delay)." },
      variables: {
        type: Type.OBJECT,
        description: "Placeholder variables as a string map.",
      },
    },
    required: ["kind", "templateId", "variables"],
  },
  execute: async (input: unknown) => {
    const kb = getKnowledgeBase();
    const record = asRecord(input);
    const kind = String(record.kind ?? "");
    const templateId = String(record.templateId ?? "");
    const variables = toStringRecord(record.variables);
    const templates = await kb.getTemplates();

    const list =
      kind === "rti" ? templates.rti : kind === "grievance" ? templates.grievance : kind === "appeal" ? templates.appeal : [];
    const found = list.find((t) => t.id === templateId);
    if (!found) return null;
    return {
      id: found.id,
      name: found.name,
      rendered: renderTemplate(found.template, variables),
      notes: found.notes ?? [],
    };
  },
});

export const ALL_KB_TOOLS = [
  kbSearchTool,
  kbGetBusinessTypeTool,
  kbListBusinessTypesTool,
  kbGetStateTool,
  kbListStatesTool,
  kbResolveStateByCityTool,
  kbGetLicenseTool,
  kbListLicensesTool,
  kbGetTemplatesTool,
  kbGetStatisticsTool,
  kbRenderTemplateTool,
];

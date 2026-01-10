import fs from "node:fs/promises";
import path from "node:path";
import type {
  BusinessType,
  LicenseRequirement,
  StateRules,
  StatisticsBundle,
  TemplatesBundle,
} from "../../types";
import { getDataDir } from "./paths";

type JsonRecord = Record<string, unknown>;

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, { encoding: "utf-8" });
  return JSON.parse(raw) as T;
}

async function listJsonFilesRecursively(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listJsonFilesRecursively(full)));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(full);
    }
  }
  return files;
}

function normalizeId(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function scoreMatch(text: string, tokens: string[]): number {
  const haystack = text.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (!token) continue;
    if (haystack.includes(token)) score += 1;
  }
  return score;
}

export interface KnowledgeBaseSearchHit {
  kind: "business-type" | "state" | "license" | "template" | "statistics" | "raw";
  id?: string;
  title: string;
  score: number;
  path?: string;
  snippet?: string;
  data?: unknown;
}

export class KnowledgeBase {
  private loaded = false;
  private businessTypes = new Map<string, BusinessType>();
  private states = new Map<string, StateRules>();
  private licenses = new Map<string, LicenseRequirement>();
  private templates: TemplatesBundle | null = null;
  private statistics: StatisticsBundle | null = null;
  private rawDocs: Array<{ path: string; data: JsonRecord }> = [];

  async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    const dataDir = getDataDir();

    const files = await listJsonFilesRecursively(dataDir);
    for (const file of files) {
      const rel = path.relative(dataDir, file);
      const [top] = rel.split(path.sep);
      const data = await readJsonFile<JsonRecord>(file);
      this.rawDocs.push({ path: rel, data });

      if (top === "business-types" && typeof data.id === "string") {
        this.businessTypes.set(normalizeId(data.id), data as unknown as BusinessType);
      } else if (top === "states" && typeof data.id === "string") {
        this.states.set(normalizeId(data.id), data as unknown as StateRules);
      } else if (top === "licenses" && typeof data.id === "string") {
        this.licenses.set(normalizeId(data.id), data as unknown as LicenseRequirement);
      } else if (top === "templates") {
        const record = data as Record<string, unknown>;
        if (rel.endsWith("rti-templates.json")) {
          this.templates ??= { rti: [], grievance: [], appeal: [] };
          const v = record.rti;
          this.templates.rti = (Array.isArray(v) ? v : []) as unknown as TemplatesBundle["rti"];
        } else if (rel.endsWith("grievance-templates.json")) {
          this.templates ??= { rti: [], grievance: [], appeal: [] };
          const v = record.grievance;
          this.templates.grievance = (Array.isArray(v) ? v : []) as unknown as TemplatesBundle["grievance"];
        } else if (rel.endsWith("appeal-templates.json")) {
          this.templates ??= { rti: [], grievance: [], appeal: [] };
          const v = record.appeal;
          this.templates.appeal = (Array.isArray(v) ? v : []) as unknown as TemplatesBundle["appeal"];
        }
      } else if (top === "statistics") {
        const record = data as Record<string, unknown>;
        this.statistics ??= {};
        if (rel.endsWith("processing-times.json")) {
          const v = record.processingTimes;
          this.statistics.processingTimes =
            (v && typeof v === "object" ? (v as Record<string, unknown>) : {}) as unknown as StatisticsBundle["processingTimes"];
        } else if (rel.endsWith("department-performance.json")) {
          const v = record.departmentPerformance ?? record.departments;
          this.statistics.departmentPerformance = (Array.isArray(v) ? v : []) as unknown as StatisticsBundle["departmentPerformance"];
        } else if (rel.endsWith("corruption-patterns.json")) {
          const v = record.corruptionPatterns;
          this.statistics.corruptionPatterns = (Array.isArray(v) ? v : []) as unknown as StatisticsBundle["corruptionPatterns"];
        }
      }
    }

    this.loaded = true;
  }

  async getBusinessType(id: string): Promise<BusinessType | null> {
    await this.ensureLoaded();
    return this.businessTypes.get(normalizeId(id)) ?? null;
  }

  async listBusinessTypes(): Promise<BusinessType[]> {
    await this.ensureLoaded();
    return Array.from(this.businessTypes.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getState(id: string): Promise<StateRules | null> {
    await this.ensureLoaded();
    return this.states.get(normalizeId(id)) ?? null;
  }

  async listStates(): Promise<StateRules[]> {
    await this.ensureLoaded();
    return Array.from(this.states.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async resolveStateByCity(city: string): Promise<{ state: StateRules | null; municipality?: string | null }> {
    await this.ensureLoaded();
    const normalizedCity = city.trim().toLowerCase();
    for (const state of this.states.values()) {
      const cities = (state.majorCities ?? []).map((c) => c.toLowerCase());
      if (cities.includes(normalizedCity)) {
        const municipality =
          state.cityToMunicipality?.[state.majorCities?.find((c) => c.toLowerCase() === normalizedCity) ?? city] ??
          state.cityToMunicipality?.[city] ??
          null;
        return { state, municipality };
      }
    }
    return { state: null, municipality: null };
  }

  async getLicense(id: string): Promise<LicenseRequirement | null> {
    await this.ensureLoaded();
    return this.licenses.get(normalizeId(id)) ?? null;
  }

  async listLicenses(): Promise<LicenseRequirement[]> {
    await this.ensureLoaded();
    return Array.from(this.licenses.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getTemplates(): Promise<TemplatesBundle> {
    await this.ensureLoaded();
    return this.templates ?? { rti: [], grievance: [], appeal: [] };
  }

  async getStatistics(): Promise<StatisticsBundle> {
    await this.ensureLoaded();
    return this.statistics ?? {};
  }

  async search(query: string, maxCount = 10): Promise<KnowledgeBaseSearchHit[]> {
    await this.ensureLoaded();
    const tokens = query
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .map((t) => t.trim())
      .filter(Boolean);

    const hits: KnowledgeBaseSearchHit[] = [];

    for (const bt of this.businessTypes.values()) {
      const score = scoreMatch(`${bt.id} ${bt.name} ${safeStringify(bt)}`, tokens);
      if (score > 0) hits.push({ kind: "business-type", id: bt.id, title: bt.name, score, data: bt });
    }
    for (const st of this.states.values()) {
      const score = scoreMatch(`${st.id} ${st.name} ${safeStringify(st)}`, tokens);
      if (score > 0) hits.push({ kind: "state", id: st.id, title: st.name, score, data: st });
    }
    for (const li of this.licenses.values()) {
      const score = scoreMatch(`${li.id} ${li.name} ${safeStringify(li)}`, tokens);
      if (score > 0) hits.push({ kind: "license", id: li.id, title: li.name, score, data: li });
    }
    if (this.templates) {
      for (const block of [...this.templates.rti, ...this.templates.grievance, ...this.templates.appeal]) {
        const score = scoreMatch(`${block.id} ${block.name} ${block.template}`, tokens);
        if (score > 0) hits.push({ kind: "template", id: block.id, title: block.name, score, data: block });
      }
    }
    if (this.statistics) {
      const score = scoreMatch(safeStringify(this.statistics), tokens);
      if (score > 0) hits.push({ kind: "statistics", title: "statistics", score, data: this.statistics });
    }
    for (const doc of this.rawDocs) {
      const score = scoreMatch(`${doc.path} ${safeStringify(doc.data)}`, tokens);
      if (score > 0) hits.push({ kind: "raw", title: doc.path, score, path: doc.path });
    }

    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, maxCount);
  }
}

let singleton: KnowledgeBase | null = null;

export function getKnowledgeBase(): KnowledgeBase {
  singleton ??= new KnowledgeBase();
  return singleton;
}

/**
 * Browser-side Case Store
 *
 * IndexedDB-based persistence for analysis cases.
 * Falls back to in-memory storage when IndexedDB is unavailable.
 */

import type { ProcessResult, AgentActivityStreamEvent } from "@/types";

export type CaseStatus = "pending" | "processing" | "completed" | "failed";

export interface CaseRecord {
  id: string;
  status: CaseStatus;
  query: string;
  createdAt: string;
  updatedAt: string;
  // Summary fields for quick display
  businessName?: string;
  location?: string;
  licensesCount?: number;
  riskScore?: number;
  totalDaysMin?: number;
  totalDaysMax?: number;
  officialFeesInr?: number;
  highRisksCount?: number;
  error?: string;
}

export interface CaseAnalytics {
  totalCases: number;
  completedCases: number;
  failedCases: number;
  avgRiskScore: number;
  avgLicensesCount: number;
  totalHighRisks: number;
  lastUpdated: string;
}

const DB_NAME = "bureaucracy_breaker";
const DB_VERSION = 1;
const STORE_RECORDS = "case_records";
const STORE_RESULTS = "case_results";
const STORE_EVENTS = "case_events";

const EVENT_LIMIT = 500;

// In-memory fallback
const memoryStore = {
  records: new Map<string, CaseRecord>(),
  results: new Map<string, ProcessResult>(),
  events: new Map<string, AgentActivityStreamEvent[]>(),
};

function isBrowser() {
  return typeof window !== "undefined";
}

function isIndexedDbAvailable() {
  return isBrowser() && "indexedDB" in window;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (!isIndexedDbAvailable()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_RECORDS)) {
        db.createObjectStore(STORE_RECORDS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_RESULTS)) {
        db.createObjectStore(STORE_RESULTS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_EVENTS)) {
        db.createObjectStore(STORE_EVENTS, { keyPath: "id" });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve(null);
  });

  return dbPromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function withStores<T>(
  storeNames: string[],
  mode: IDBTransactionMode,
  fn: (stores: Record<string, IDBObjectStore>) => Promise<T>
): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;

  const tx = db.transaction(storeNames, mode);
  const stores: Record<string, IDBObjectStore> = {};
  for (const name of storeNames) {
    stores[name] = tx.objectStore(name);
  }

  const result = await fn(stores);
  await transactionComplete(tx);
  return result;
}

function nowIso() {
  return new Date().toISOString();
}

function buildRecordFromResult(caseId: string, query: string, result: ProcessResult): CaseRecord {
  const businessName = result.business?.name || result.intent?.businessTypeId || undefined;
  const location = result.location?.city
    ? `${result.location.city}, ${result.location.state || "India"}`
    : result.location?.state || undefined;

  const timelineItems = result.timeline || [];
  const totalDaysMin = timelineItems.reduce((sum, item) => sum + (item.estimateDays?.min || 0), 0);
  const totalDaysMax = timelineItems.reduce((sum, item) => sum + (item.estimateDays?.max || 0), 0);

  return {
    id: caseId,
    status: "completed",
    query,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    businessName,
    location,
    licensesCount: result.licenses?.length || 0,
    riskScore: result.risks?.riskScore0to10,
    totalDaysMin: totalDaysMin || undefined,
    totalDaysMax: totalDaysMax || undefined,
    officialFeesInr: result.costs?.officialFeesInr,
    highRisksCount: result.risks?.items?.filter(r => r.severity === "high").length || 0,
  };
}

// ============ Public API ============

/**
 * Save when analysis starts (creates a pending/processing record)
 */
export async function saveCaseStart(caseId: string, query: string): Promise<void> {
  const record: CaseRecord = {
    id: caseId,
    status: "processing",
    query,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  memoryStore.records.set(caseId, record);

  await withStores([STORE_RECORDS], "readwrite", async ({ [STORE_RECORDS]: store }) => {
    await requestToPromise(store.put(record));
    return null;
  });
}

/**
 * Append activity events during processing
 */
export async function appendCaseEvents(caseId: string, events: AgentActivityStreamEvent[]): Promise<void> {
  if (events.length === 0) return;

  const existingEvents = memoryStore.events.get(caseId) || [];
  const merged = [...existingEvents, ...events].slice(-EVENT_LIMIT);
  memoryStore.events.set(caseId, merged);

  await withStores([STORE_EVENTS], "readwrite", async ({ [STORE_EVENTS]: store }) => {
    const current = await requestToPromise<{ id: string; events: AgentActivityStreamEvent[] } | undefined>(
      store.get(caseId)
    );
    const updated = {
      id: caseId,
      events: [...(current?.events || []), ...events].slice(-EVENT_LIMIT),
    };
    await requestToPromise(store.put(updated));
    return null;
  });
}

/**
 * Save completed analysis result
 */
export async function saveCaseResult(
  caseId: string,
  query: string,
  result: ProcessResult,
  events?: AgentActivityStreamEvent[]
): Promise<void> {
  const record = buildRecordFromResult(caseId, query, result);
  
  // Preserve original createdAt if exists
  const existing = memoryStore.records.get(caseId);
  if (existing?.createdAt) {
    record.createdAt = existing.createdAt;
  }

  memoryStore.records.set(caseId, record);
  memoryStore.results.set(caseId, result);
  if (events?.length) {
    memoryStore.events.set(caseId, events.slice(-EVENT_LIMIT));
  }

  await withStores(
    [STORE_RECORDS, STORE_RESULTS, STORE_EVENTS],
    "readwrite",
    async (stores) => {
      await requestToPromise(stores[STORE_RECORDS].put(record));
      await requestToPromise(stores[STORE_RESULTS].put({ id: caseId, result }));
      if (events?.length) {
        await requestToPromise(
          stores[STORE_EVENTS].put({ id: caseId, events: events.slice(-EVENT_LIMIT) })
        );
      }
      return null;
    }
  );
}

/**
 * Save failure state
 */
export async function saveCaseFailure(caseId: string, query: string, error: string): Promise<void> {
  const existing = memoryStore.records.get(caseId);
  const record: CaseRecord = {
    id: caseId,
    status: "failed",
    query,
    createdAt: existing?.createdAt || nowIso(),
    updatedAt: nowIso(),
    error,
  };

  memoryStore.records.set(caseId, record);

  await withStores([STORE_RECORDS], "readwrite", async ({ [STORE_RECORDS]: store }) => {
    await requestToPromise(store.put(record));
    return null;
  });
}

/**
 * Get a single case record (metadata)
 */
export async function getCaseRecord(caseId: string): Promise<CaseRecord | null> {
  const memoryRecord = memoryStore.records.get(caseId);
  if (memoryRecord) return memoryRecord;

  const record = await withStores([STORE_RECORDS], "readonly", async ({ [STORE_RECORDS]: store }) => {
    const result = await requestToPromise<CaseRecord | undefined>(store.get(caseId));
    return result || null;
  });

  if (record) memoryStore.records.set(caseId, record);
  return record || null;
}

/**
 * Get full analysis result
 */
export async function getCaseResult(caseId: string): Promise<ProcessResult | null> {
  const memoryResult = memoryStore.results.get(caseId);
  if (memoryResult) return memoryResult;

  const payload = await withStores([STORE_RESULTS], "readonly", async ({ [STORE_RESULTS]: store }) => {
    const result = await requestToPromise<{ id: string; result: ProcessResult } | undefined>(
      store.get(caseId)
    );
    return result?.result || null;
  });

  if (payload) memoryStore.results.set(caseId, payload);
  return payload || null;
}

/**
 * Get activity events for a case
 */
export async function getCaseEvents(caseId: string): Promise<AgentActivityStreamEvent[]> {
  const memoryEvents = memoryStore.events.get(caseId);
  if (memoryEvents) return memoryEvents;

  const events = await withStores([STORE_EVENTS], "readonly", async ({ [STORE_EVENTS]: store }) => {
    const result = await requestToPromise<{ id: string; events: AgentActivityStreamEvent[] } | undefined>(
      store.get(caseId)
    );
    return result?.events || [];
  });

  memoryStore.events.set(caseId, events || []);
  return events || [];
}

/**
 * List all cases sorted by date (newest first)
 */
export async function listCases(): Promise<CaseRecord[]> {
  const records = await withStores([STORE_RECORDS], "readonly", async ({ [STORE_RECORDS]: store }) => {
    const result = await requestToPromise<CaseRecord[]>(store.getAll());
    return result || [];
  });

  if (records) {
    records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    for (const record of records) {
      memoryStore.records.set(record.id, record);
    }
    return records;
  }

  return Array.from(memoryStore.records.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

/**
 * Delete a case and all its data
 */
export async function deleteCase(caseId: string): Promise<void> {
  memoryStore.records.delete(caseId);
  memoryStore.results.delete(caseId);
  memoryStore.events.delete(caseId);

  await withStores(
    [STORE_RECORDS, STORE_RESULTS, STORE_EVENTS],
    "readwrite",
    async (stores) => {
      await requestToPromise(stores[STORE_RECORDS].delete(caseId));
      await requestToPromise(stores[STORE_RESULTS].delete(caseId));
      await requestToPromise(stores[STORE_EVENTS].delete(caseId));
      return null;
    }
  );
}

/**
 * Clear all data (for debugging/reset)
 */
export async function clearAllCases(): Promise<void> {
  memoryStore.records.clear();
  memoryStore.results.clear();
  memoryStore.events.clear();

  await withStores(
    [STORE_RECORDS, STORE_RESULTS, STORE_EVENTS],
    "readwrite",
    async (stores) => {
      await requestToPromise(stores[STORE_RECORDS].clear());
      await requestToPromise(stores[STORE_RESULTS].clear());
      await requestToPromise(stores[STORE_EVENTS].clear());
      return null;
    }
  );
}

/**
 * Get analytics across all cases
 */
export async function getCaseAnalytics(): Promise<CaseAnalytics> {
  const records = await listCases();
  
  const completed = records.filter(r => r.status === "completed");
  const failed = records.filter(r => r.status === "failed");
  
  const riskScores = completed
    .map(r => r.riskScore)
    .filter((s): s is number => typeof s === "number");
  
  const licenseCounts = completed
    .map(r => r.licensesCount)
    .filter((c): c is number => typeof c === "number");

  const totalHighRisks = completed.reduce((sum, r) => sum + (r.highRisksCount || 0), 0);

  return {
    totalCases: records.length,
    completedCases: completed.length,
    failedCases: failed.length,
    avgRiskScore: riskScores.length > 0
      ? Math.round((riskScores.reduce((a, b) => a + b, 0) / riskScores.length) * 10) / 10
      : 0,
    avgLicensesCount: licenseCounts.length > 0
      ? Math.round((licenseCounts.reduce((a, b) => a + b, 0) / licenseCounts.length) * 10) / 10
      : 0,
    totalHighRisks,
    lastUpdated: nowIso(),
  };
}

/**
 * Update case status (for recovery sync)
 */
export async function updateCaseStatus(caseId: string, status: CaseStatus): Promise<void> {
  const existing = await getCaseRecord(caseId);
  if (!existing) return;

  const updated: CaseRecord = {
    ...existing,
    status,
    updatedAt: nowIso(),
  };

  memoryStore.records.set(caseId, updated);

  await withStores([STORE_RECORDS], "readwrite", async ({ [STORE_RECORDS]: store }) => {
    await requestToPromise(store.put(updated));
    return null;
  });
}

export default {
  saveCaseStart,
  appendCaseEvents,
  saveCaseResult,
  saveCaseFailure,
  getCaseRecord,
  getCaseResult,
  getCaseEvents,
  listCases,
  deleteCase,
  clearAllCases,
  getCaseAnalytics,
  updateCaseStatus,
};

import crypto from "node:crypto";

export interface StoredCase {
  id: string;
  createdAt: number;
  query: string;
  userId?: string;
  sessionId?: string;
  result: unknown;
}

class CaseStore {
  private cases = new Map<string, StoredCase>();

  create(input: Omit<StoredCase, "id" | "createdAt">): StoredCase {
    const id = crypto.randomUUID();
    const item: StoredCase = { id, createdAt: Date.now(), ...input };
    this.cases.set(id, item);
    return item;
  }

  get(id: string): StoredCase | null {
    return this.cases.get(id) ?? null;
  }

  list(limit = 50): StoredCase[] {
    return Array.from(this.cases.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }
}

let singleton: CaseStore | null = null;

export function getCaseStore(): CaseStore {
  singleton ??= new CaseStore();
  return singleton;
}


import { getKnowledgeBase } from "../../../../lib/knowledge-base";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const query = String(record.query ?? "").trim();
  if (!query) return new Response("Missing `query`", { status: 400 });
  const maxCount = Math.min(Math.max(Number(record.maxCount ?? 10), 1), 50);

  const kb = getKnowledgeBase();
  const results = await kb.search(query, maxCount);
  return Response.json({ results });
}

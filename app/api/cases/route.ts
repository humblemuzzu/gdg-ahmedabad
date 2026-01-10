import { getCaseStore } from "../../../lib/storage";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? "50"), 1), 200);
  return Response.json({ cases: getCaseStore().list(limit) });
}


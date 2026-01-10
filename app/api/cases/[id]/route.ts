import { getCaseStore } from "../../../../lib/storage";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const item = getCaseStore().get(id);
  if (!item) return new Response("Not found", { status: 404 });
  return Response.json(item);
}

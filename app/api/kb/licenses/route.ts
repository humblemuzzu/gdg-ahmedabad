import { getKnowledgeBase } from "../../../../lib/knowledge-base";

export const runtime = "nodejs";

export async function GET() {
  const kb = getKnowledgeBase();
  return Response.json({ licenses: await kb.listLicenses() });
}


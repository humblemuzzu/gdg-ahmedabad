import { AgentOrchestrator } from "../../../lib/agents/orchestrator";
import { getCaseStore } from "../../../lib/storage";

export const runtime = "nodejs";

function sseEncode(event: string, data: unknown): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

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

  const userId = record.userId ? String(record.userId) : undefined;
  const sessionId = record.sessionId ? String(record.sessionId) : undefined;
  const saveCase = Boolean(record.saveCase ?? false);

  const url = new URL(req.url);
  const streamParam = url.searchParams.get("stream");
  const accept = req.headers.get("accept") ?? "";
  const wantsStream = streamParam === "1" || accept.includes("text/event-stream");

  const orchestrator = new AgentOrchestrator();

  if (!wantsStream) {
    try {
      const out = await orchestrator.processQuery(query, { userId, sessionId });
      const stored = saveCase
        ? getCaseStore().create({ query, result: out.result, userId: out.userId, sessionId: out.sessionId })
        : null;
      return Response.json({ ...out, caseId: stored?.id ?? null });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return Response.json({ error: message }, { status: 500 });
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(sseEncode("meta", { startedAt: Date.now() }));
      try {
        let finalResult: { result: unknown; sessionId: string; userId: string } | null = null;

        for await (const item of orchestrator.runQuery(query, { userId, sessionId })) {
          if (item.type === "event") {
            controller.enqueue(
              sseEncode("event", {
                author: item.author,
                timestamp: item.timestamp,
                text: item.text,
                partial: item.partial,
                functionCalls: item.functionCalls,
                functionResponses: item.functionResponses,
              })
            );
          } else if (item.type === "debate") {
            // Stream debate message
            controller.enqueue(sseEncode("debate", item.message));
          } else if (item.type === "typing") {
            // Stream typing indicator
            controller.enqueue(
              sseEncode("typing", {
                agentId: item.agentId,
                agentName: item.agentName,
                isTyping: item.isTyping,
              })
            );
          } else if (item.type === "complete") {
            finalResult = { result: item.result, sessionId: item.sessionId, userId: item.userId };
            controller.enqueue(sseEncode("complete", finalResult));
          }
        }

        if (saveCase && finalResult) {
          const stored = getCaseStore().create({
            query,
            result: finalResult.result,
            userId: finalResult.userId,
            sessionId: finalResult.sessionId,
          });
          controller.enqueue(sseEncode("case_saved", { caseId: stored.id }));
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        controller.enqueue(sseEncode("error", { message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

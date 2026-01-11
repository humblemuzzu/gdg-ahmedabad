import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/services/chatService";
import type { ChatRequest } from "@/types/chat";
import type { ProcessResult } from "@/types/process";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest;

    // Validate required fields
    if (!body.caseId) {
      return NextResponse.json({ success: false, error: "caseId is required" }, { status: 400 });
    }

    if (!body.message?.trim()) {
      return NextResponse.json({ success: false, error: "message is required" }, { status: 400 });
    }

    if (!body.processResult) {
      return NextResponse.json(
        {
          success: false,
          error:
            "processResult is required (analysis data is stored locally in IndexedDB, not on the server).",
        },
        { status: 400 }
      );
    }

    // Call the chat service
    const response = await chat(
      {
        caseId: body.caseId,
        message: body.message,
        history: body.history || [],
      },
      body.processResult as ProcessResult
    );

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error("[Chat API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Chat failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

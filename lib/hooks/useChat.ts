"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clearChatHistory, getChatHistory, saveChatHistory } from "@/lib/storage/caseStore";
import type { ChatMessage, ChatResponse } from "@/types/chat";
import type { ProcessResult } from "@/types/process";

interface UseChatOptions {
  caseId: string;
  processResult: ProcessResult | null;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  suggestedQuestions: string[];
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => Promise<void>;
}

const DEFAULT_SUGGESTIONS = [
  "What licenses do I need and how long will each take?",
  "What are the high-risk areas I should focus on?",
  "What should I do first?",
  "What will be the total cost?",
];

function makeUserMessage(content: string): ChatMessage {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    role: "user",
    content,
    timestamp: new Date().toISOString(),
  };
}

export function useChat({ caseId, processResult }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(DEFAULT_SUGGESTIONS);

  // Use ref to avoid stale closure in sendMessage
  const messagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const stored = await getChatHistory(caseId);
        if (cancelled) return;
        setMessages(stored);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error("[useChat] Failed to load history:", err);
        setError(err instanceof Error ? err.message : "Failed to load chat history");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const canChat = useMemo(() => Boolean(caseId && processResult), [caseId, processResult]);

  const sendMessage = useCallback(
    async (rawContent: string) => {
      const content = rawContent.trim();
      if (!content || isLoading) return;

      if (!canChat || !processResult) {
        setError("Analysis context is not ready yet. Please wait and try again.");
        return;
      }

      const userMessage = makeUserMessage(content);
      const nextHistory = [...messagesRef.current, userMessage];

      // Optimistically update UI
      messagesRef.current = nextHistory;
      setMessages(nextHistory);
      setIsLoading(true);
      setError(null);

      // Save to storage
      await saveChatHistory(caseId, nextHistory);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caseId,
            message: content,
            history: nextHistory.slice(-10), // Send last 10 messages for context
            processResult,
          }),
        });

        const data = (await response.json()) as ChatResponse & {
          success: boolean;
          error?: string;
        };

        if (!response.ok || !data.success) {
          throw new Error(data.error || `Chat failed: ${response.statusText}`);
        }

        // Update with assistant response
        const updated = [...messagesRef.current, data.message];
        messagesRef.current = updated;
        setMessages(updated);
        await saveChatHistory(caseId, updated);

        // Update suggestions
        if (data.suggestedQuestions?.length) {
          setSuggestedQuestions(data.suggestedQuestions);
        }
      } catch (err) {
        console.error("[useChat] Send error:", err);
        setError(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        setIsLoading(false);
      }
    },
    [caseId, canChat, isLoading, processResult]
  );

  const clearChat = useCallback(async () => {
    setMessages([]);
    messagesRef.current = [];
    setError(null);
    setSuggestedQuestions(DEFAULT_SUGGESTIONS);
    await clearChatHistory(caseId);
  }, [caseId]);

  return {
    messages,
    isLoading,
    error,
    suggestedQuestions,
    sendMessage,
    clearChat,
  };
}

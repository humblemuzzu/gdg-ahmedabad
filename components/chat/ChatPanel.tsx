"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessage as ChatMessageRow } from "./ChatMessage";
import { useChat } from "@/lib/hooks/useChat";
import type { ProcessResult } from "@/types/process";

interface ChatPanelProps {
  caseId: string;
  processResult: ProcessResult | null;
  isOpen: boolean;
  onClose: () => void;
}

function SparkleIcon() {
  return (
    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 2l1.6 5.2 5.4 1.3-4.6 3.3 1.4 5.3L12 14.6 8.2 17.4l1.4-5.3L5 8.5l5.4-1.3L12 2z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  );
}

function CompressIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a10.07 10.07 0 01-4.39-.98L3 20l1.53-3.83A7.67 7.67 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

export function ChatPanel({ caseId, processResult, isOpen, onClose }: ChatPanelProps) {
  const { messages, isLoading, error, suggestedQuestions, sendMessage, clearChat } = useChat({
    caseId,
    processResult,
  });

  const [isFullHeight, setIsFullHeight] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const showSuggestions = useMemo(
    () => messages.length === 0 && suggestedQuestions.length > 0,
    [messages.length, suggestedQuestions.length]
  );

  if (!isOpen) return null;

  return (
    <div
      className={`fixed right-0 z-50 animate-in slide-in-from-right duration-300 ${
        isFullHeight ? "top-0 bottom-0" : "bottom-5"
      }`}
    >
      <div
        className={`w-screen sm:w-[92vw] sm:max-w-[440px] ${
          isFullHeight ? "h-screen" : "h-[85vh] max-h-[700px]"
        } bg-background/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullHeight ? "sm:rounded-l-3xl" : "rounded-3xl sm:mr-5"
        } border border-border/50`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-background via-muted/5 to-background border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center shadow-lg shadow-primary/10">
              <ChatIcon />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground tracking-tight">AI Assistant</div>
              <div className="text-sm text-muted-foreground/80">Ask about your analysis</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsFullHeight(!isFullHeight)}
              className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 active:scale-95"
              title={isFullHeight ? "Exit full height" : "Expand to full height"}
            >
              {isFullHeight ? <CompressIcon /> : <ExpandIcon />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 active:scale-95"
              title="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scroll-smooth">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 animate-in fade-in duration-500">
              <div className="mx-auto mb-4 w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-xl shadow-primary/10">
                <SparkleIcon />
              </div>
              <p className="text-base font-semibold text-foreground mb-2">
                Ask me anything about this analysis
              </p>
              <p className="text-sm text-muted-foreground/70 max-w-xs mx-auto leading-relaxed">
                I can explain licenses, costs, timelines, risks, and help you plan your next steps.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id}
                className="animate-in slide-in-from-bottom duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ChatMessageRow message={msg} />
              </div>
            ))
          )}

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-300">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 rounded-full bg-primary/70 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-primary/70 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-primary/70 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span>Thinking...</span>
            </div>
          ) : null}

          {error ? (
            <div className="text-sm text-red-700 dark:text-red-300 bg-red-50/80 dark:bg-red-950/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg animate-in fade-in duration-300">
              {error}
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {showSuggestions ? (
          <div className="px-5 pb-4">
            <div className="flex flex-col gap-2.5">
              {suggestedQuestions.map((q, index) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void sendMessage(q)}
                  className="group text-left text-sm px-4 py-3 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 text-foreground hover:from-muted/60 hover:to-muted/40 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shadow-sm border border-border/30 hover:border-primary/30 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary/60 group-hover:bg-primary group-hover:scale-125 transition-all duration-200" />
                    <span className="group-hover:text-primary transition-colors duration-200">
                      {q}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Input */}
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
          onClear={clearChat}
          hasMessages={messages.length > 0}
        />
      </div>
    </div>
  );
}

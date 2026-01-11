"use client";

import { useCallback, useState, type KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => Promise<void> | void;
  disabled?: boolean;
  onClear: () => Promise<void> | void;
  hasMessages: boolean;
}

function SendIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h14"
      />
    </svg>
  );
}

export function ChatInput({ onSend, disabled, onClear, hasMessages }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || disabled) return;
    setInput("");
    await onSend(content);
  }, [disabled, input, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="px-5 py-4 bg-gradient-to-t from-background/80 to-background/40 backdrop-blur-sm border-t border-border/30">
      <div className="flex items-center gap-2.5">
        {hasMessages ? (
          <button
            type="button"
            onClick={() => void onClear()}
            className="shrink-0 p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
            title="Clear chat"
            disabled={disabled}
          >
            <TrashIcon />
          </button>
        ) : null}

        <div className="flex-1 relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your analysis..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none px-4 py-3 rounded-2xl bg-muted/30 backdrop-blur-sm focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 text-[15px] leading-relaxed placeholder:text-muted-foreground/60 transition-all duration-200 shadow-sm focus:shadow-md antialiased"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
        </div>

        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={disabled || !input.trim()}
          className="shrink-0 p-3 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-full hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 shadow-md shadow-primary/20"
          title="Send"
        >
          <SendIcon />
        </button>
      </div>
      <p className="mt-2.5 text-xs text-muted-foreground/70 px-1">
        <span className="font-medium">Enter</span> to send -{" "}
        <span className="font-medium">Shift+Enter</span> for new line
      </p>
    </div>
  );
}

"use client";

import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
}

function UserIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 21H9a4 4 0 01-4-4v-1a4 4 0 014-4h6a4 4 0 014 4v1a4 4 0 01-4 4zM12 12a4 4 0 100-8 4 4 0 000 8z"
      />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 group items-start", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 mt-0.5",
          isUser
            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-primary/20"
            : "bg-gradient-to-br from-muted/80 to-muted/50 text-foreground shadow-black/5"
        )}
      >
        {isUser ? <UserIcon /> : <BotIcon />}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed transition-all duration-200 group-hover:shadow-lg antialiased",
          isUser
            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/10"
            : "bg-gradient-to-br from-muted/50 to-muted/30 text-foreground shadow-md shadow-black/5 backdrop-blur-sm"
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-2 prose-strong:font-bold prose-strong:text-foreground whitespace-pre-wrap break-words">
            {/* Simple markdown-like rendering */}
            {message.content.split("\n").map((line, i) => {
              // Handle headers
              if (line.startsWith("### ")) {
                return (
                  <h4 key={i} className="font-semibold text-foreground mt-3 mb-1">
                    {line.slice(4)}
                  </h4>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h3 key={i} className="font-semibold text-foreground mt-3 mb-1 text-base">
                    {line.slice(3)}
                  </h3>
                );
              }
              // Handle bullet points
              if (line.startsWith("- ") || line.startsWith("* ")) {
                return (
                  <div key={i} className="flex gap-2 my-0.5">
                    <span className="text-primary">-</span>
                    <span>{line.slice(2)}</span>
                  </div>
                );
              }
              // Handle numbered lists
              if (/^\d+\.\s/.test(line)) {
                const match = line.match(/^(\d+)\.\s(.*)$/);
                if (match) {
                  return (
                    <div key={i} className="flex gap-2 my-0.5">
                      <span className="text-primary font-medium">{match[1]}.</span>
                      <span>{match[2]}</span>
                    </div>
                  );
                }
              }
              // Handle bold text
              const boldRendered = line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                j % 2 === 1 ? (
                  <strong key={j} className="font-bold text-foreground">
                    {part}
                  </strong>
                ) : (
                  part
                )
              );
              // Empty lines
              if (!line.trim()) {
                return <div key={i} className="h-2" />;
              }
              return (
                <p key={i} className="my-1">
                  {boldRendered}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

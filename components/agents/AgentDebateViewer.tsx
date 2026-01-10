"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AGENT_INFO } from "@/lib/constants/agents";
import type { DebateMessage, DebateMessageType, Tier } from "@/types";

interface AgentDebateViewerProps {
  messages: DebateMessage[];
  isLive?: boolean;
  typingAgent?: { id: string; name: string } | null;
}

// Tier colors for avatars and accents
const TIER_COLORS: Record<Tier, { bg: string; text: string; border: string; gradient: string }> = {
  intake: { 
    bg: "bg-cyan-500/20", 
    text: "text-cyan-400", 
    border: "border-cyan-500/40",
    gradient: "from-cyan-500/20 to-cyan-600/10"
  },
  research: { 
    bg: "bg-purple-500/20", 
    text: "text-purple-400", 
    border: "border-purple-500/40",
    gradient: "from-purple-500/20 to-purple-600/10"
  },
  strategy: { 
    bg: "bg-orange-500/20", 
    text: "text-orange-400", 
    border: "border-orange-500/40",
    gradient: "from-orange-500/20 to-orange-600/10"
  },
  document: { 
    bg: "bg-green-500/20", 
    text: "text-green-400", 
    border: "border-green-500/40",
    gradient: "from-green-500/20 to-green-600/10"
  },
  execution: { 
    bg: "bg-blue-500/20", 
    text: "text-blue-400", 
    border: "border-blue-500/40",
    gradient: "from-blue-500/20 to-blue-600/10"
  },
  intelligence: { 
    bg: "bg-pink-500/20", 
    text: "text-pink-400", 
    border: "border-pink-500/40",
    gradient: "from-pink-500/20 to-pink-600/10"
  },
};

// Message type styling
const MESSAGE_TYPE_STYLES: Record<DebateMessageType, { icon: string; color: string; label: string }> = {
  observation: { icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", color: "text-slate-400", label: "Observes" },
  agreement: { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-green-400", label: "Agrees" },
  disagreement: { icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-red-400", label: "Disagrees" },
  question: { icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-yellow-400", label: "Questions" },
  warning: { icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z", color: "text-orange-400", label: "Warns" },
  insight: { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", color: "text-purple-400", label: "Insight" },
  consensus: { icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z", color: "text-emerald-400", label: "Consensus" },
  suggestion: { icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z", color: "text-blue-400", label: "Suggests" },
  correction: { icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10", color: "text-amber-400", label: "Corrects" },
};

// Get initials from agent name
function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// Format timestamp
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// Single message bubble component
function MessageBubble({ message, isConsecutive }: { message: DebateMessage; isConsecutive: boolean }) {
  const tierStyle = TIER_COLORS[message.fromTier];
  const typeStyle = MESSAGE_TYPE_STYLES[message.type];
  
  const isWarningOrDisagreement = message.type === "warning" || message.type === "disagreement";
  const isConsensus = message.type === "consensus";
  
  return (
    <div className={cn(
      "flex gap-3 animate-in slide-in-from-bottom-2 duration-300",
      isConsecutive ? "mt-1" : "mt-4"
    )}>
      {/* Avatar */}
      {!isConsecutive ? (
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2",
          tierStyle.bg,
          tierStyle.text,
          tierStyle.border
        )}>
          {message.emoji || getInitials(message.fromDisplayName)}
        </div>
      ) : (
        <div className="w-10" /> // Spacer for consecutive messages
      )}
      
      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header - only show for first message in a sequence */}
        {!isConsecutive && (
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("font-semibold text-sm", tierStyle.text)}>
              {message.fromDisplayName}
            </span>
            {message.referencesAgentName && (
              <span className="text-xs text-muted-foreground">
                <svg className="inline w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                {message.referencesAgentName}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
        
        {/* Message Bubble */}
        <div className={cn(
          "rounded-2xl px-4 py-2.5 max-w-[90%] inline-block",
          "border transition-all duration-200",
          isWarningOrDisagreement 
            ? "bg-red-500/10 border-red-500/30" 
            : isConsensus
            ? "bg-emerald-500/10 border-emerald-500/30"
            : `bg-gradient-to-br ${tierStyle.gradient} ${tierStyle.border}`
        )}>
          {/* Type indicator */}
          <div className="flex items-start gap-2">
            <svg 
              className={cn("w-4 h-4 mt-0.5 flex-shrink-0", typeStyle.color)} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={typeStyle.icon} />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-relaxed break-words">
                {message.content}
              </p>
            </div>
          </div>
          
          {/* Confidence badge */}
          {message.confidence && (
            <div className="mt-2 flex items-center gap-1">
              <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full", tierStyle.bg.replace("/20", ""))}
                  style={{ width: `${message.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(message.confidence * 100)}% conf
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Typing indicator component
function TypingIndicator({ agentId, agentName }: { agentId: string; agentName: string }) {
  // Get tier from AGENT_INFO
  const normalizedId = agentId.replace(/-/g, "_");
  const agentInfo = AGENT_INFO[normalizedId];
  const tier = agentInfo?.tier || "intelligence";
  const emoji = agentInfo?.emoji;
  const tierStyle = TIER_COLORS[tier];
  
  return (
    <div className="flex gap-3 mt-4 animate-in fade-in duration-200">
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2",
        tierStyle.bg,
        tierStyle.text,
        tierStyle.border
      )}>
        {emoji || getInitials(agentName)}
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("font-semibold text-sm", tierStyle.text)}>
          {agentName}
        </span>
        <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-muted/50">
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-xs text-muted-foreground">is thinking...</span>
      </div>
    </div>
  );
}

export function AgentDebateViewer({ messages, isLive = false, typingAgent }: AgentDebateViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingAgent]);
  
  const hasMessages = messages.length > 0;
  
  // Group consecutive messages from same agent
  const isConsecutiveMessage = (index: number) => {
    if (index === 0) return false;
    return messages[index].fromAgent === messages[index - 1].fromAgent;
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0 border-b border-border/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Agent Debate
              {isLive && (
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {hasMessages 
                ? `${messages.length} messages from ${new Set(messages.map(m => m.fromAgent)).size} agents`
                : "Watch agents discuss and debate in real-time"
              }
            </CardDescription>
          </div>
          {isLive && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              Live
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        {hasMessages || typingAgent ? (
          <div 
            ref={scrollRef}
            className="h-[450px] overflow-y-auto px-4 py-3 space-y-0 scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <MessageBubble 
                key={msg.id} 
                message={msg}
                isConsecutive={isConsecutiveMessage(idx)}
              />
            ))}
            
            {/* Typing indicator */}
            {typingAgent && (
              <TypingIndicator 
                agentId={typingAgent.id}
                agentName={typingAgent.name}
              />
            )}
          </div>
        ) : (
          <div className="h-[450px] flex flex-col items-center justify-center text-muted-foreground px-6">
            <div className="relative mb-6">
              {/* Animated agent avatars */}
              <div className="flex -space-x-3">
                {["intake", "research", "strategy", "intelligence"].map((tier, i) => (
                  <div
                    key={tier}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2 border-background",
                      TIER_COLORS[tier as Tier].bg,
                      "animate-pulse"
                    )}
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    <span className={cn("text-lg", TIER_COLORS[tier as Tier].text)}>
                      {tier === "intake" ? "🎯" : tier === "research" ? "📚" : tier === "strategy" ? "⚡" : "🧠"}
                    </span>
                  </div>
                ))}
              </div>
              {/* Connecting lines animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse" />
              </div>
            </div>
            
            <p className="font-medium text-lg mb-2">Agents Standing By</p>
            <p className="text-sm text-center max-w-xs">
              Start an analysis to watch 26 specialized agents collaborate, debate, and reach consensus on your query
            </p>
            
            {/* Feature highlights */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Real-time debate
              </div>
              <div className="flex items-center gap-2 text-orange-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                Risk warnings
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Key insights
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                Consensus building
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

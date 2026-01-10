"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAnalysisContext } from "@/lib/context/analysis-context";

const suggestions = [
  { label: "Open a Cafe", query: "Ahmedabad me cafe kholna hai - licenses, timeline, aur total kharcha?" },
  { label: "GST Registration", query: "Gujarat me GST registration karna hai - step-by-step checklist" },
  { label: "Shop License", query: "Society NOC ke bina shop license possible hai?" },
  { label: "Fire NOC", query: "Fire NOC me kya documents lagte hai?" },
  { label: "Restaurant", query: "Mumbai me restaurant kholna hai - complete guide" },
];

export function ProcessInput() {
  const [value, setValue] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const context = useAnalysisContext();
  const { analyze, isRunning } = context;
  const startDemo = "startDemo" in context ? context.startDemo : undefined;

  const handleSubmit = async () => {
    if (!value.trim() || isRunning) return;
    await analyze(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDemo = async () => {
    if (startDemo && typeof startDemo === "function") {
      await startDemo();
    }
  };

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Greeting */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-medium text-foreground tracking-tight">
          What can we help you with?
        </h1>
        <p className="mt-3 text-muted-foreground">
          Describe your business goal in Hindi or English
        </p>
      </div>

      {/* Input Container */}
      <div
        className={cn(
          "relative rounded-2xl border bg-card/50 backdrop-blur-sm transition-all duration-200",
          isFocused
            ? "border-foreground/30 shadow-lg shadow-foreground/5"
            : "border-foreground/15 hover:border-foreground/25",
          isRunning && "opacity-70 pointer-events-none"
        )}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Ahmedabad me cafe kholna hai..."
          disabled={isRunning}
          rows={1}
          className={cn(
            "w-full resize-none bg-transparent px-5 pt-5 pb-16 text-base placeholder:text-muted-foreground/60 focus:outline-none",
            "min-h-[60px] max-h-[200px]"
          )}
        />

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3">
          {/* Left side - Demo button */}
          <button
            type="button"
            onClick={handleDemo}
            disabled={isRunning || !startDemo}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
            <span>Try Demo</span>
          </button>

          {/* Right side - Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isRunning || !value.trim()}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
              value.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isRunning ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            onClick={() => setValue(suggestion.query)}
            disabled={isRunning}
            className={cn(
              "px-4 py-2 rounded-full text-sm border transition-all",
              "border-border/60 text-muted-foreground",
              "hover:border-primary/50 hover:text-foreground hover:bg-primary/5",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
}

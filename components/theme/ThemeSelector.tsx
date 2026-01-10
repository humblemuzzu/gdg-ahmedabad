"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme, themes, ThemeKey } from "@/lib/context/theme-context";

export function ThemeSelector({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { activeTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeKeys: ThemeKey[] = ["defaultLight", "cyanLight", "default", "slate"];

  if (isCollapsed) {
    return (
      <div className="px-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => {
            const currentIndex = themeKeys.indexOf(activeTheme);
            const nextTheme = themeKeys[(currentIndex + 1) % themeKeys.length];
            setTheme(nextTheme);
          }}
          title={`Current: ${themes[activeTheme].name}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v4" />
            <path d="m16 6 2-2" />
            <path d="M22 12h-4" />
            <path d="m18 16 2 2" />
            <path d="M12 18v4" />
            <path d="m6 16-2 2" />
            <path d="M2 12h4" />
            <path d="m6 6-2-2" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 relative">
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v4" />
            <path d="m16 6 2-2" />
            <path d="M22 12h-4" />
            <path d="m18 16 2 2" />
            <path d="M12 18v4" />
            <path d="m6 16-2 2" />
            <path d="M2 12h4" />
            <path d="m6 6-2-2" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-sm">{themes[activeTheme].name}</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 mx-3 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
            Light Themes
          </div>
          {(["defaultLight", "cyanLight"] as ThemeKey[]).map((key) => (
            <button
              key={key}
              className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-muted transition-colors text-left ${
                activeTheme === key ? "bg-muted/50" : ""
              }`}
              onClick={() => {
                setTheme(key);
                setIsOpen(false);
              }}
            >
              <div className="flex gap-1">
                {themes[key].preview.map((color, i) => (
                  <div
                    key={i}
                    className="h-4 w-4 rounded-sm border border-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium">{themes[key].name}</span>
                <span className="text-xs text-muted-foreground">{themes[key].description}</span>
              </div>
              {activeTheme === key && (
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}

          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-t border-b border-border">
            Dark Themes
          </div>
          {(["default", "slate"] as ThemeKey[]).map((key) => (
            <button
              key={key}
              className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-muted transition-colors text-left ${
                activeTheme === key ? "bg-muted/50" : ""
              }`}
              onClick={() => {
                setTheme(key);
                setIsOpen(false);
              }}
            >
              <div className="flex gap-1">
                {themes[key].preview.map((color, i) => (
                  <div
                    key={i}
                    className="h-4 w-4 rounded-sm border border-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium">{themes[key].name}</span>
                <span className="text-xs text-muted-foreground">{themes[key].description}</span>
              </div>
              {activeTheme === key && (
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

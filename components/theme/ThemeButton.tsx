"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme, themes, ThemeKey } from "@/lib/context/theme-context";

export function ThemeButton() {
  const { activeTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
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
          className="mr-2"
        >
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
        Theme
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close on outside click */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
            <div className="px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border">
              Light Themes
            </div>
            {(["defaultLight", "cyanLight"] as ThemeKey[]).map((key) => (
              <button
                key={key}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left ${
                  activeTheme === key ? "bg-muted/50" : ""
                }`}
                onClick={() => {
                  setTheme(key);
                  setIsOpen(false);
                }}
              >
                <div className="flex gap-1.5">
                  {themes[key].preview.map((color, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded border border-border"
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

            <div className="px-4 py-3 text-xs font-semibold text-muted-foreground border-t border-b border-border">
              Dark Themes
            </div>
            {(["default", "slate"] as ThemeKey[]).map((key) => (
              <button
                key={key}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left ${
                  activeTheme === key ? "bg-muted/50" : ""
                }`}
                onClick={() => {
                  setTheme(key);
                  setIsOpen(false);
                }}
              >
                <div className="flex gap-1.5">
                  {themes[key].preview.map((color, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded border border-border"
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
        </>
      )}
    </div>
  );
}

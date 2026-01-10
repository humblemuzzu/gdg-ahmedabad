"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ThemeKey = "defaultLight" | "cyanLight" | "default" | "slate";

interface Theme {
  name: string;
  description: string;
  preview: [string, string, string];
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    border: string;
    input: string;
    ring: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
    severityCritical: string;
    severityHigh: string;
    severityMedium: string;
    severityLow: string;
  };
}

const themes: Record<ThemeKey, Theme> = {
  defaultLight: {
    name: "Default Light",
    description: "Original warm light theme",
    preview: ["#fcfcfc", "#5b6b9e", "#f0e8d8"],
    colors: {
      background: "oklch(0.99 0.002 85)",
      foreground: "oklch(0.20 0.015 265)",
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.20 0.015 265)",
      popover: "oklch(1 0 0)",
      popoverForeground: "oklch(0.20 0.015 265)",
      primary: "oklch(0.45 0.05 250)",
      primaryForeground: "oklch(0.99 0.002 85)",
      secondary: "oklch(0.95 0.01 75)",
      secondaryForeground: "oklch(0.30 0.02 265)",
      muted: "oklch(0.96 0.005 75)",
      mutedForeground: "oklch(0.50 0.01 265)",
      accent: "oklch(0.94 0.03 85)",
      accentForeground: "oklch(0.30 0.02 265)",
      destructive: "oklch(0.55 0.20 25)",
      border: "oklch(0.92 0.005 265)",
      input: "oklch(0.92 0.005 265)",
      ring: "oklch(0.45 0.05 250)",
      success: "oklch(0.55 0.15 145)",
      warning: "oklch(0.65 0.15 75)",
      error: "oklch(0.55 0.20 25)",
      info: "oklch(0.60 0.12 240)",
      chart1: "oklch(0.65 0.12 85)",
      chart2: "oklch(0.60 0.10 250)",
      chart3: "oklch(0.55 0.08 180)",
      chart4: "oklch(0.50 0.15 35)",
      chart5: "oklch(0.45 0.10 265)",
      sidebar: "oklch(0.98 0 0)",
      sidebarForeground: "oklch(0.30 0.02 265)",
      sidebarPrimary: "oklch(0.45 0.05 250)",
      sidebarPrimaryForeground: "oklch(0.99 0.002 85)",
      sidebarAccent: "oklch(0.96 0.005 75)",
      sidebarAccentForeground: "oklch(0.30 0.02 265)",
      sidebarBorder: "oklch(0.94 0.005 265)",
      sidebarRing: "oklch(0.45 0.05 250)",
      severityCritical: "oklch(0.55 0.20 25)",
      severityHigh: "oklch(0.60 0.15 35)",
      severityMedium: "oklch(0.65 0.12 75)",
      severityLow: "oklch(0.70 0.08 200)",
    },
  },
  cyanLight: {
    name: "Cyan Fresh",
    description: "Clean white with cyan accents",
    preview: ["#fcfdfe", "#0ea5e9", "#bae6fd"],
    colors: {
      background: "oklch(0.99 0.002 200)",
      foreground: "oklch(0.20 0.015 240)",
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.20 0.015 240)",
      popover: "oklch(1 0 0)",
      popoverForeground: "oklch(0.20 0.015 240)",
      primary: "oklch(0.55 0.18 200)",
      primaryForeground: "oklch(0.99 0.002 200)",
      secondary: "oklch(0.96 0.008 200)",
      secondaryForeground: "oklch(0.30 0.02 240)",
      muted: "oklch(0.97 0.005 200)",
      mutedForeground: "oklch(0.50 0.01 240)",
      accent: "oklch(0.93 0.05 190)",
      accentForeground: "oklch(0.25 0.02 240)",
      destructive: "oklch(0.55 0.20 25)",
      border: "oklch(0.93 0.005 200)",
      input: "oklch(0.93 0.005 200)",
      ring: "oklch(0.55 0.18 200)",
      success: "oklch(0.55 0.15 170)",
      warning: "oklch(0.65 0.15 75)",
      error: "oklch(0.55 0.20 25)",
      info: "oklch(0.60 0.15 200)",
      chart1: "oklch(0.65 0.15 200)",
      chart2: "oklch(0.60 0.12 240)",
      chart3: "oklch(0.55 0.10 180)",
      chart4: "oklch(0.50 0.15 160)",
      chart5: "oklch(0.45 0.12 220)",
      sidebar: "oklch(0.98 0.002 200)",
      sidebarForeground: "oklch(0.30 0.02 240)",
      sidebarPrimary: "oklch(0.55 0.18 200)",
      sidebarPrimaryForeground: "oklch(0.99 0.002 200)",
      sidebarAccent: "oklch(0.96 0.008 200)",
      sidebarAccentForeground: "oklch(0.30 0.02 240)",
      sidebarBorder: "oklch(0.94 0.005 200)",
      sidebarRing: "oklch(0.55 0.18 200)",
      severityCritical: "oklch(0.55 0.20 25)",
      severityHigh: "oklch(0.60 0.15 35)",
      severityMedium: "oklch(0.65 0.12 200)",
      severityLow: "oklch(0.70 0.10 190)",
    },
  },
  default: {
    name: "Default Dark",
    description: "Current dark theme (default)",
    preview: ["#262933", "#7b8ec4", "#4d5633"],
    colors: {
      background: "oklch(0.15 0.01 265)",
      foreground: "oklch(0.95 0.005 85)",
      card: "oklch(0.20 0.01 265)",
      cardForeground: "oklch(0.95 0.005 85)",
      popover: "oklch(0.20 0.01 265)",
      popoverForeground: "oklch(0.95 0.005 85)",
      primary: "oklch(0.65 0.08 250)",
      primaryForeground: "oklch(0.15 0.01 265)",
      secondary: "oklch(0.25 0.01 75)",
      secondaryForeground: "oklch(0.95 0.005 85)",
      muted: "oklch(0.25 0.01 265)",
      mutedForeground: "oklch(0.65 0.01 265)",
      accent: "oklch(0.30 0.03 85)",
      accentForeground: "oklch(0.95 0.005 85)",
      destructive: "oklch(0.60 0.20 25)",
      border: "oklch(0.30 0.01 265)",
      input: "oklch(0.30 0.01 265)",
      ring: "oklch(0.65 0.08 250)",
      success: "oklch(0.60 0.15 145)",
      warning: "oklch(0.70 0.15 75)",
      error: "oklch(0.60 0.20 25)",
      info: "oklch(0.65 0.12 240)",
      chart1: "oklch(0.65 0.12 85)",
      chart2: "oklch(0.60 0.10 250)",
      chart3: "oklch(0.55 0.08 180)",
      chart4: "oklch(0.50 0.15 35)",
      chart5: "oklch(0.45 0.10 265)",
      sidebar: "oklch(0.18 0.01 265)",
      sidebarForeground: "oklch(0.90 0.005 85)",
      sidebarPrimary: "oklch(0.65 0.08 250)",
      sidebarPrimaryForeground: "oklch(0.15 0.01 265)",
      sidebarAccent: "oklch(0.25 0.01 265)",
      sidebarAccentForeground: "oklch(0.95 0.005 85)",
      sidebarBorder: "oklch(0.30 0.01 265)",
      sidebarRing: "oklch(0.65 0.08 250)",
      severityCritical: "oklch(0.60 0.20 25)",
      severityHigh: "oklch(0.65 0.15 35)",
      severityMedium: "oklch(0.70 0.12 75)",
      severityLow: "oklch(0.75 0.08 200)",
    },
  },
  slate: {
    name: "Slate Storm",
    description: "Cool gray with electric cyan",
    preview: ["#272a33", "#68d4ff", "#4dd4d4"],
    colors: {
      background: "oklch(0.16 0.01 260)",
      foreground: "oklch(0.96 0.005 260)",
      card: "oklch(0.21 0.015 260)",
      cardForeground: "oklch(0.96 0.005 260)",
      popover: "oklch(0.21 0.015 260)",
      popoverForeground: "oklch(0.96 0.005 260)",
      primary: "oklch(0.75 0.15 200)",
      primaryForeground: "oklch(0.16 0.01 260)",
      secondary: "oklch(0.27 0.015 260)",
      secondaryForeground: "oklch(0.96 0.005 260)",
      muted: "oklch(0.25 0.015 260)",
      mutedForeground: "oklch(0.68 0.01 260)",
      accent: "oklch(0.65 0.20 200)",
      accentForeground: "oklch(0.16 0.01 260)",
      destructive: "oklch(0.60 0.20 25)",
      border: "oklch(0.31 0.015 260)",
      input: "oklch(0.31 0.015 260)",
      ring: "oklch(0.75 0.15 200)",
      success: "oklch(0.60 0.18 170)",
      warning: "oklch(0.70 0.15 75)",
      error: "oklch(0.60 0.20 25)",
      info: "oklch(0.70 0.18 200)",
      chart1: "oklch(0.70 0.18 200)",
      chart2: "oklch(0.65 0.15 220)",
      chart3: "oklch(0.60 0.12 180)",
      chart4: "oklch(0.55 0.18 160)",
      chart5: "oklch(0.50 0.15 240)",
      sidebar: "oklch(0.18 0.012 260)",
      sidebarForeground: "oklch(0.92 0.005 260)",
      sidebarPrimary: "oklch(0.75 0.15 200)",
      sidebarPrimaryForeground: "oklch(0.16 0.01 260)",
      sidebarAccent: "oklch(0.27 0.015 260)",
      sidebarAccentForeground: "oklch(0.96 0.005 260)",
      sidebarBorder: "oklch(0.31 0.015 260)",
      sidebarRing: "oklch(0.75 0.15 200)",
      severityCritical: "oklch(0.60 0.20 25)",
      severityHigh: "oklch(0.65 0.15 35)",
      severityMedium: "oklch(0.70 0.15 200)",
      severityLow: "oklch(0.75 0.12 190)",
    },
  },
};

const cssVars = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "success",
  "warning",
  "error",
  "info",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "severity-critical",
  "severity-high",
  "severity-medium",
  "severity-low",
];

export function ThemeButton() {
  const [activeTheme, setActiveTheme] = useState<ThemeKey>("default");
  const [isOpen, setIsOpen] = useState(false);

  const applyTheme = (themeName: ThemeKey) => {
    setActiveTheme(themeName);
    const root = document.documentElement;

    // Determine if it's a light theme
    const isLightTheme = themeName.includes("Light");

    // Toggle dark class
    if (isLightTheme) {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }

    // Reset to default themes (remove inline styles to use globals.css)
    if (themeName === "default" || themeName === "defaultLight") {
      cssVars.forEach((cssVar) => {
        root.style.removeProperty(`--${cssVar}`);
      });
      return;
    }

    // Apply custom theme
    const theme = themes[themeName];
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
    });
  };

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
        <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border">
            Light Themes
          </div>
          {(["defaultLight", "cyanLight"] as ThemeKey[]).map((key) => (
            <button
              key={key}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
              onClick={() => {
                applyTheme(key);
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
              <div className="flex flex-col">
                <span className="text-sm font-medium">{themes[key].name}</span>
                <span className="text-xs text-muted-foreground">{themes[key].description}</span>
              </div>
            </button>
          ))}

          <div className="px-4 py-3 text-xs font-semibold text-muted-foreground border-t border-b border-border">
            Dark Themes
          </div>
          {(["default", "slate"] as ThemeKey[]).map((key) => (
            <button
              key={key}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
              onClick={() => {
                applyTheme(key);
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
              <div className="flex flex-col">
                <span className="text-sm font-medium">{themes[key].name}</span>
                <span className="text-xs text-muted-foreground">{themes[key].description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

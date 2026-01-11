"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ThemeKey = "defaultLight" | "cyanLight" | "default" | "slate";

interface ThemeContextType {
  activeTheme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  themes: typeof themes;
}

interface Theme {
  name: string;
  description: string;
  preview: [string, string, string];
  colors: Record<string, string>;
}

export const themes: Record<ThemeKey, Theme> = {
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
  "background", "foreground", "card", "card-foreground", "popover", "popover-foreground",
  "primary", "primary-foreground", "secondary", "secondary-foreground", "muted", "muted-foreground",
  "accent", "accent-foreground", "destructive", "border", "input", "ring",
  "success", "warning", "error", "info",
  "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
  "sidebar", "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground",
  "sidebar-accent", "sidebar-accent-foreground", "sidebar-border", "sidebar-ring",
  "severity-critical", "severity-high", "severity-medium", "severity-low",
];

const THEME_STORAGE_KEY = "bb-theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<ThemeKey>("defaultLight");
  const [mounted, setMounted] = useState(false);

  // Apply theme to DOM
  const applyThemeToDOM = useCallback((themeName: ThemeKey) => {
    const root = document.documentElement;
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
  }, []);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeKey | null;
    if (savedTheme && themes[savedTheme]) {
      setActiveTheme(savedTheme);
      applyThemeToDOM(savedTheme);
    } else {
      // Apply default light theme
      applyThemeToDOM("defaultLight");
    }
    setMounted(true);
  }, [applyThemeToDOM]);

  // Set theme and persist
  const setTheme = useCallback((themeName: ThemeKey) => {
    setActiveTheme(themeName);
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
    applyThemeToDOM(themeName);
  }, [applyThemeToDOM]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

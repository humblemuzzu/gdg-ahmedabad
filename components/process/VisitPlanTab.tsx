"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VisitPlanData, VisitDay, Visit, VisitPriority } from "@/types";

// Types for user location
type LocationStatus = "idle" | "loading" | "success" | "error" | "denied";

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface VisitPlanTabProps {
  visitPlan: VisitPlanData | null | undefined;
}

const priorityStyles: Record<VisitPriority, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-destructive/10", text: "text-destructive", label: "Critical" },
  high: { bg: "bg-warning/10", text: "text-warning", label: "High" },
  medium: { bg: "bg-info/10", text: "text-info", label: "Medium" },
  low: { bg: "bg-muted/50", text: "text-muted-foreground", label: "Low" },
};

// Helper to generate Google Maps URL
const generateMapsUrl = (address: string, landmark?: string): string => {
  const query = landmark ? `${address} near ${landmark}` : address;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

// Helper to generate multi-stop route URL
// userOrigin can be: coordinates string "lat,lng", an address string, or undefined (falls back to first visit)
const generateRouteUrl = (visits: Visit[], userOrigin?: string): string => {
  const addresses = visits
    .filter((v) => v.location?.address || v.office)
    .map((v) => v.location?.address || v.office);
  if (addresses.length === 0) return "";
  
  // If user origin is provided, use it. Otherwise use first visit address.
  // When user origin is set, all visit addresses become the route (first as waypoint, last as destination)
  let origin: string;
  let destination: string;
  let waypoints: string;
  
  if (userOrigin) {
    origin = userOrigin;
    destination = addresses[addresses.length - 1];
    // All addresses except the last become waypoints
    waypoints = addresses.slice(0, -1).join("|");
  } else {
    // Fallback: first visit is origin (legacy behavior)
    if (addresses.length < 2) return "";
    origin = addresses[0];
    destination = addresses[addresses.length - 1];
    waypoints = addresses.slice(1, -1).join("|");
  }
  
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ""}`;
};

// Normalize visit plan data to handle both formats
function normalizeVisitPlan(raw: VisitPlanData | null | undefined): {
  summary: VisitPlanData["summary"];
  days: VisitDay[];
  flatVisits: Visit[];
  optimizationTips: string[];
} {
  if (!raw) {
    return { summary: undefined, days: [], flatVisits: [], optimizationTips: [] };
  }

  // If we have the new format with visitPlan array
  if (raw.visitPlan && Array.isArray(raw.visitPlan) && raw.visitPlan.length > 0) {
    const flatVisits = raw.visitPlan.flatMap((day) => day.visits || []);
    return {
      summary: raw.summary,
      days: raw.visitPlan,
      flatVisits,
      optimizationTips: raw.optimizationTips || [],
    };
  }

  // If we have legacy format with flat visits array
  if (raw.visits && Array.isArray(raw.visits) && raw.visits.length > 0) {
    const convertedVisits: Visit[] = raw.visits.map((v, idx) => ({
      visitId: `visit-${idx + 1}`,
      office: v.office,
      purpose: v.purpose,
      arrivalTime: v.time,
      tips: v.tips,
      documentsToCarry: v.documentsNeeded ? { copies: v.documentsNeeded } : undefined,
    }));

    // Group into single day for display
    const day: VisitDay = {
      day: 1,
      dayType: "Weekday",
      theme: "Planned Visits",
      visits: convertedVisits,
    };

    return {
      summary: {
        totalVisitsRequired: convertedVisits.length,
        estimatedDays: 1,
        officesInvolved: convertedVisits.map((v) => v.office),
      },
      days: [day],
      flatVisits: convertedVisits,
      optimizationTips: raw.optimizationTips || [],
    };
  }

  return { summary: undefined, days: [], flatVisits: [], optimizationTips: [] };
}

// Visit Card Component
function VisitCard({ visit, index }: { visit: Visit; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const priority = visit.priority || "medium";
  const style = priorityStyles[priority];

  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${style.bg} ${style.text}`}
        >
          {index + 1}
        </div>
        <div className="w-0.5 flex-1 min-h-[20px] bg-border/50" />
      </div>

      {/* Visit Content */}
      <div className="flex-1 pb-4">
        <div className="bg-card rounded-xl p-5 transition-all hover:shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`${style.bg} ${style.text} border-0`}>{style.label}</Badge>
                {visit.arrivalTime && (
                  <span className="text-sm text-primary font-medium">{visit.arrivalTime}</span>
                )}
              </div>
              <h4 className="font-semibold text-lg text-foreground">{visit.office}</h4>
              <p className="text-sm text-muted-foreground mt-1">{visit.purpose}</p>
            </div>
            {visit.expectedDuration && (
              <Badge variant="outline" className="shrink-0 bg-muted/30 border-0">
                {visit.expectedDuration}
              </Badge>
            )}
          </div>

          {/* Timing Info */}
          {visit.timing && (
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              {visit.timing.officeOpens && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Opens: {visit.timing.officeOpens}</span>
                </div>
              )}
              {visit.timing.tokenWindow && (
                <div className="flex items-center gap-2 text-warning">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span>Token: {visit.timing.tokenWindow}</span>
                </div>
              )}
            </div>
          )}

          {/* Location */}
          {visit.location && (visit.location.address || visit.location.landmark) && (
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    {visit.location.address && (
                      <p className="text-sm font-medium">{visit.location.address}</p>
                    )}
                    {visit.location.landmark && (
                      <p className="text-xs text-muted-foreground mt-0.5">Near {visit.location.landmark}</p>
                    )}
                    {visit.location.parking && (
                      <p className="text-xs text-muted-foreground mt-0.5">{visit.location.parking}</p>
                    )}
                  </div>
                </div>
                <a
                  href={generateMapsUrl(visit.location.address || visit.office, visit.location.landmark)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 flex-shrink-0"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Maps
                </a>
              </div>
            </div>
          )}

          {/* Expandable Section */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {expanded ? "Show less" : "Show details"}
          </button>

          {expanded && (
            <div className="space-y-5 pt-5 mt-4 border-t border-border/50">
              {/* Documents to Carry */}
              {visit.documentsToCarry && (
                <div>
                  <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <svg className="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Documents to Carry
                  </h5>
                  <div className="grid gap-3 text-sm">
                    {visit.documentsToCarry.originals && visit.documentsToCarry.originals.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Originals</p>
                        <div className="flex flex-wrap gap-2">
                          {visit.documentsToCarry.originals.map((doc, i) => (
                            <span key={i} className="bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-lg">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {visit.documentsToCarry.copies && visit.documentsToCarry.copies.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Copies</p>
                        <div className="flex flex-wrap gap-2">
                          {visit.documentsToCarry.copies.map((doc, i) => (
                            <span key={i} className="bg-muted/50 text-foreground text-xs px-3 py-1.5 rounded-lg">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {visit.documentsToCarry.photos && (
                      <p className="text-xs"><span className="text-muted-foreground">Photos:</span> {visit.documentsToCarry.photos}</p>
                    )}
                    {visit.documentsToCarry.forms && (
                      <p className="text-xs"><span className="text-muted-foreground">Forms:</span> {visit.documentsToCarry.forms}</p>
                    )}
                    {visit.documentsToCarry.fees && (
                      <p className="text-sm font-medium text-warning">Fees: {visit.documentsToCarry.fees}</p>
                    )}
                  </div>
                </div>
              )}

              {/* What to Expect */}
              {visit.whatToExpect && visit.whatToExpect.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold mb-3">What to Expect</h5>
                  <ol className="text-sm space-y-2 text-muted-foreground">
                    {visit.whatToExpect.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/50 text-xs font-medium flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Tips */}
              {visit.tips && visit.tips.length > 0 && (
                <div className="bg-success/5 rounded-xl p-4">
                  <h5 className="text-sm font-semibold mb-3 flex items-center gap-2 text-success">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Pro Tips
                  </h5>
                  <ul className="text-sm space-y-2">
                    {visit.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-success">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Possible Outcomes */}
              {visit.possibleOutcomes && visit.possibleOutcomes.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold mb-3">Possible Outcomes</h5>
                  <ul className="text-sm space-y-2">
                    {visit.possibleOutcomes.map((outcome, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span>{i === 0 ? "✅" : i === 1 ? "⚠️" : "❌"}</span>
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Backup Plan */}
              {visit.backupPlan && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Backup Plan
                  </h5>
                  <p className="text-sm text-muted-foreground">{visit.backupPlan}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Day Section Component
function DaySection({ day, defaultExpanded = false }: { day: VisitDay; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      {/* Day Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
            D{day.day}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">Day {day.day}</h3>
              {day.dayType && (
                <Badge className="bg-muted/50 text-muted-foreground border-0 text-xs">{day.dayType}</Badge>
              )}
            </div>
            {day.theme && (
              <p className="text-sm text-muted-foreground">{day.theme}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/10 text-primary border-0">{day.visits.length} visit{day.visits.length !== 1 ? "s" : ""}</Badge>
          <svg
            className={`h-5 w-5 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Day Content */}
      {expanded && (
        <div className="p-5 pt-0 border-t border-border/50">
          {/* Day Goal */}
          {day.dayEndGoal && (
            <div className="mb-6 bg-primary/5 rounded-xl p-4 border-l-4 border-primary">
              <p className="text-sm">
                <span className="font-semibold text-primary">Goal: </span>
                {day.dayEndGoal}
              </p>
              {day.contingencyTime && (
                <p className="text-xs text-muted-foreground mt-1">Buffer: {day.contingencyTime}</p>
              )}
            </div>
          )}

          {/* Visits */}
          <div className="space-y-2 mt-6">
            {day.visits.map((visit, idx) => (
              <VisitCard key={visit.visitId || idx} visit={visit} index={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function VisitPlanTab({ visitPlan }: VisitPlanTabProps) {
  const { summary, days, flatVisits, optimizationTips } = normalizeVisitPlan(visitPlan);
  
  // User location state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [manualAddress, setManualAddress] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Request geolocation
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("Geolocation is not supported by your browser");
      setShowManualInput(true);
      return;
    }

    setLocationStatus("loading");
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("success");
        setShowManualInput(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus("denied");
            setLocationError("Location permission denied. Please enter your starting address manually.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationStatus("error");
            setLocationError("Location unavailable. Please enter your starting address manually.");
            break;
          case error.TIMEOUT:
            setLocationStatus("error");
            setLocationError("Location request timed out. Please try again or enter address manually.");
            break;
          default:
            setLocationStatus("error");
            setLocationError("Unable to get location. Please enter your starting address manually.");
        }
        setShowManualInput(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  }, []);

  // Request location on component mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Generate the origin string for the route URL
  const getUserOrigin = useCallback((): string | undefined => {
    if (userLocation) {
      return `${userLocation.latitude},${userLocation.longitude}`;
    }
    if (manualAddress.trim()) {
      return manualAddress.trim();
    }
    return undefined;
  }, [userLocation, manualAddress]);

  // Empty state
  if (days.length === 0 && flatVisits.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="flex h-20 w-20 mx-auto mb-6 items-center justify-center rounded-full bg-muted/30">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">No visit plan generated</h3>
        <p className="text-sm max-w-md mx-auto">
          Visit plans help you optimize your government office trips by finding the best routes, 
          timing, and document bundles for each visit.
        </p>
      </div>
    );
  }

  const userOrigin = getUserOrigin();
  const routeUrl = generateRouteUrl(flatVisits, userOrigin);

  return (
    <div className="space-y-8">
      {/* Location Status Section */}
      <div className="bg-muted/30 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Location icon with status indicator */}
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              locationStatus === "success" ? "bg-success/10" :
              locationStatus === "loading" ? "bg-info/10" :
              locationStatus === "denied" || locationStatus === "error" ? "bg-destructive/10" :
              "bg-muted/50"
            }`}>
              {locationStatus === "loading" ? (
                <svg className="h-5 w-5 text-info animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className={`h-5 w-5 ${
                  locationStatus === "success" ? "text-success" :
                  locationStatus === "denied" || locationStatus === "error" ? "text-destructive" :
                  "text-muted-foreground"
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            
            <div>
              <p className="font-medium text-sm">
                {locationStatus === "loading" && "Getting your location..."}
                {locationStatus === "success" && "Using your current location"}
                {locationStatus === "denied" && "Location access denied"}
                {locationStatus === "error" && "Couldn't get location"}
                {locationStatus === "idle" && "Location not set"}
                {manualAddress.trim() && !userLocation && " - Using manual address"}
              </p>
              {locationError && (
                <p className="text-xs text-destructive mt-0.5">{locationError}</p>
              )}
              {userLocation && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Route will start from your current position
                </p>
              )}
              {manualAddress.trim() && !userLocation && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Route will start from: {manualAddress}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {locationStatus !== "loading" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestLocation}
                  className="gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {userLocation ? "Refresh" : "Detect Location"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManualInput(!showManualInput)}
                >
                  {showManualInput ? "Hide" : "Enter Manually"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Manual Address Input */}
        {showManualInput && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <label className="text-sm font-medium mb-2 block">
              Enter your starting address
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g., 123 Main Street, Ahmedabad, Gujarat"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className="flex-1"
              />
              {manualAddress.trim() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setManualAddress("")}
                  title="Clear address"
                  className="px-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This address will be used as the starting point for your route
            </p>
          </div>
        )}
      </div>

      {/* Summary Section */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/30 rounded-xl p-5 text-center transition-all hover:bg-muted/50">
            <div className="text-3xl font-bold text-primary">{summary.totalVisitsRequired}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Visits</div>
          </div>
          <div className="bg-muted/30 rounded-xl p-5 text-center transition-all hover:bg-muted/50">
            <div className="text-3xl font-bold text-info">{summary.estimatedDays}</div>
            <div className="text-sm text-muted-foreground mt-1">Days Required</div>
          </div>
          <div className="bg-muted/30 rounded-xl p-5 text-center transition-all hover:bg-muted/50">
            <div className="text-3xl font-bold text-success">{summary.officesInvolved?.length || 0}</div>
            <div className="text-sm text-muted-foreground mt-1">Offices</div>
          </div>
          <div className="bg-muted/30 rounded-xl p-5 text-center transition-all hover:bg-muted/50">
            <div className="text-3xl font-bold text-warning">{summary.onlineOnlyItems?.length || 0}</div>
            <div className="text-sm text-muted-foreground mt-1">Online Only</div>
          </div>
        </div>
      )}

      {/* Optimization Savings Banner */}
      {summary?.optimizationSavings && (
        <div className="bg-success/5 rounded-2xl p-5 flex items-center gap-4 border-l-4 border-success">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 flex-shrink-0">
            <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-success">Time Saved!</p>
            <p className="text-sm text-foreground">{summary.optimizationSavings}</p>
          </div>
        </div>
      )}

      {/* Online Only Items */}
      {summary?.onlineOnlyItems && summary.onlineOnlyItems.length > 0 && (
        <div className="bg-info/5 rounded-2xl p-5 border-l-4 border-info">
          <div className="flex items-center gap-3 mb-3">
            <svg className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h4 className="font-semibold text-info">No Visit Needed - Apply Online</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.onlineOnlyItems.map((item, idx) => (
              <span key={idx} className="bg-info/10 text-info text-sm px-3 py-1.5 rounded-lg">{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* Day-by-Day Plan */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Your Visit Schedule</h3>
            <p className="text-sm text-muted-foreground mt-1">Optimized route for minimum travel time</p>
          </div>
          {routeUrl && (
            <a
              href={routeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              View Full Route
            </a>
          )}
        </div>

        <div className="space-y-4">
          {days.map((day, idx) => (
            <DaySection key={day.day || idx} day={day} defaultExpanded={idx === 0} />
          ))}
        </div>
      </div>

      {/* Optimization Tips */}
      {optimizationTips.length > 0 && (
        <div className="bg-warning/5 rounded-2xl p-6 border-l-4 border-warning">
          <h4 className="font-semibold text-warning mb-4 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Time-Saving Tips
          </h4>
          <ul className="space-y-3">
            {optimizationTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <svg className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-6 border-t border-border/50">
        {routeUrl && (
          <Button asChild className="gap-2">
            <a href={routeUrl} target="_blank" rel="noopener noreferrer">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Open Route in Google Maps
            </a>
          </Button>
        )}
        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Plan
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VisitPlanData, VisitDay, Visit, VisitPriority } from "@/types";

interface VisitPlanTabProps {
  visitPlan: VisitPlanData | null | undefined;
}

const priorityStyles: Record<VisitPriority, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-destructive/10", text: "text-destructive", label: "Critical" },
  high: { bg: "bg-warning/10", text: "text-warning", label: "High" },
  medium: { bg: "bg-info/10", text: "text-info", label: "Medium" },
  low: { bg: "bg-muted", text: "text-muted-foreground", label: "Low" },
};

// Helper to generate Google Maps URL
const generateMapsUrl = (address: string, landmark?: string): string => {
  const query = landmark ? `${address} near ${landmark}` : address;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

// Helper to generate multi-stop route URL
const generateRouteUrl = (visits: Visit[]): string => {
  const addresses = visits
    .filter((v) => v.location?.address || v.office)
    .map((v) => v.location?.address || v.office);
  if (addresses.length < 2) return "";
  const origin = addresses[0];
  const destination = addresses[addresses.length - 1];
  const waypoints = addresses.slice(1, -1).join("|");
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
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold ${style.bg} ${style.text} border-current`}
        >
          {index + 1}
        </div>
        <div className="w-0.5 flex-1 min-h-[20px] bg-border" />
      </div>

      {/* Visit Content */}
      <div className="flex-1 pb-4">
        <div className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`${style.bg} ${style.text} border-0`}>{style.label}</Badge>
                {visit.arrivalTime && (
                  <span className="text-sm text-primary font-medium">{visit.arrivalTime}</span>
                )}
              </div>
              <h4 className="font-semibold text-lg">{visit.office}</h4>
              <p className="text-sm text-muted-foreground">{visit.purpose}</p>
            </div>
            {visit.expectedDuration && (
              <Badge variant="outline" className="shrink-0">
                {visit.expectedDuration}
              </Badge>
            )}
          </div>

          {/* Timing Info */}
          {visit.timing && (
            <div className="flex flex-wrap gap-3 mb-3 text-sm">
              {visit.timing.officeOpens && (
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Opens: {visit.timing.officeOpens}</span>
                </div>
              )}
              {visit.timing.tokenWindow && (
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span>Token: {visit.timing.tokenWindow}</span>
                </div>
              )}
            </div>
          )}

          {/* Location */}
          {visit.location && (visit.location.address || visit.location.landmark) && (
            <div className="mb-3">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1">
                  {visit.location.address && (
                    <p className="text-sm">{visit.location.address}</p>
                  )}
                  {visit.location.landmark && (
                    <p className="text-xs text-muted-foreground">Near {visit.location.landmark}</p>
                  )}
                  {visit.location.parking && (
                    <p className="text-xs text-muted-foreground">{visit.location.parking}</p>
                  )}
                </div>
                <a
                  href={generateMapsUrl(visit.location.address || visit.office, visit.location.landmark)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
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
            <div className="space-y-4 pt-2 border-t border-border">
              {/* Documents to Carry */}
              {visit.documentsToCarry && (
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Documents to Carry
                  </h5>
                  <div className="grid gap-2 text-sm">
                    {visit.documentsToCarry.originals && visit.documentsToCarry.originals.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Originals:</p>
                        <div className="flex flex-wrap gap-1">
                          {visit.documentsToCarry.originals.map((doc, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {visit.documentsToCarry.copies && visit.documentsToCarry.copies.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Copies:</p>
                        <div className="flex flex-wrap gap-1">
                          {visit.documentsToCarry.copies.map((doc, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {doc}
                            </Badge>
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
                      <p className="text-xs font-medium text-warning"><span className="text-muted-foreground">Fees:</span> {visit.documentsToCarry.fees}</p>
                    )}
                  </div>
                </div>
              )}

              {/* What to Expect */}
              {visit.whatToExpect && visit.whatToExpect.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-2">What to Expect</h5>
                  <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                    {visit.whatToExpect.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Tips */}
              {visit.tips && visit.tips.length > 0 && (
                <div className="rounded-lg bg-success/5 border border-success/20 p-3">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1.5 text-success">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Pro Tips
                  </h5>
                  <ul className="text-sm space-y-1">
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
                  <h5 className="text-sm font-medium mb-2">Possible Outcomes</h5>
                  <ul className="text-sm space-y-1">
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
                <div className="rounded-lg bg-muted/50 p-3">
                  <h5 className="text-sm font-medium mb-1 flex items-center gap-1.5">
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
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Day Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
            D{day.day}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Day {day.day}</h3>
              {day.dayType && (
                <Badge variant="outline" className="text-xs">{day.dayType}</Badge>
              )}
            </div>
            {day.theme && (
              <p className="text-sm text-muted-foreground">{day.theme}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{day.visits.length} visit{day.visits.length !== 1 ? "s" : ""}</Badge>
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
        <div className="p-4 border-t border-border">
          {/* Day Goal */}
          {day.dayEndGoal && (
            <div className="mb-4 rounded-lg bg-primary/5 border border-primary/20 p-3">
              <p className="text-sm">
                <span className="font-medium text-primary">Goal: </span>
                {day.dayEndGoal}
              </p>
              {day.contingencyTime && (
                <p className="text-xs text-muted-foreground mt-1">Buffer: {day.contingencyTime}</p>
              )}
            </div>
          )}

          {/* Visits */}
          <div className="space-y-2">
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

  // Empty state
  if (days.length === 0 && flatVisits.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <svg className="h-16 w-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-lg font-medium mb-2">No visit plan generated</h3>
        <p className="text-sm max-w-md mx-auto">
          Visit plans help you optimize your government office trips by finding the best routes, 
          timing, and document bundles for each visit.
        </p>
      </div>
    );
  }

  const routeUrl = generateRouteUrl(flatVisits);

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <div className="text-3xl font-bold text-primary">{summary.totalVisitsRequired}</div>
            <div className="text-sm text-muted-foreground">Total Visits</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <div className="text-3xl font-bold text-info">{summary.estimatedDays}</div>
            <div className="text-sm text-muted-foreground">Days Required</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <div className="text-3xl font-bold text-success">{summary.officesInvolved?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Offices</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <div className="text-3xl font-bold text-warning">{summary.onlineOnlyItems?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Online Only</div>
          </div>
        </div>
      )}

      {/* Optimization Savings Banner */}
      {summary?.optimizationSavings && (
        <div className="rounded-lg bg-success/10 border border-success/30 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
            <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-success">Time Saved!</p>
            <p className="text-sm text-foreground">{summary.optimizationSavings}</p>
          </div>
        </div>
      )}

      {/* Online Only Items */}
      {summary?.onlineOnlyItems && summary.onlineOnlyItems.length > 0 && (
        <div className="rounded-lg border border-info/30 bg-info/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h4 className="font-medium text-info">No Visit Needed - Apply Online</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.onlineOnlyItems.map((item, idx) => (
              <Badge key={idx} variant="secondary">{item}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Day-by-Day Plan */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Your Visit Schedule</h3>
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
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <h4 className="font-medium text-warning mb-3 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Time-Saving Tips
          </h4>
          <ul className="space-y-2">
            {optimizationTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <svg className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        {routeUrl && (
          <Button asChild variant="default" className="gap-2">
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

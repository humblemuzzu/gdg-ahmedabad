"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DependencyGraph } from "@/types";

interface ProcessDependencyGraphProps {
  dependencyGraph?: DependencyGraph | null;
}

// Node type colors
const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  document: { bg: "bg-info/10", border: "border-info/30", text: "text-info" },
  license: { bg: "bg-success/10", border: "border-success/30", text: "text-success" },
  step: { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary" },
};

// Edge type colors
const EDGE_COLORS: Record<string, string> = {
  requires: "text-warning",
  enables: "text-success",
  blocks: "text-destructive",
};

export function ProcessDependencyGraph({ dependencyGraph }: ProcessDependencyGraphProps) {
  const nodes = dependencyGraph?.nodes || [];
  const edges = dependencyGraph?.edges || [];
  const criticalPath = dependencyGraph?.criticalPath || [];
  const parallelGroups = dependencyGraph?.parallelGroups || [];

  const hasData = nodes.length > 0 || edges.length > 0;

  // Create a map of node IDs to node info for quick lookup
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Dependency Graph</CardTitle>
            <CardDescription>
              {hasData 
                ? `${nodes.length} items, ${edges.length} dependencies`
                : "Prerequisites and dependencies visualization"
              }
            </CardDescription>
          </div>
          {criticalPath.length > 0 && (
            <Badge variant="warning" className="shrink-0">
              Critical Path: {criticalPath.length} steps
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-6">
            {/* Critical Path */}
            {criticalPath.length > 0 && (
              <div className="rounded-lg border-2 border-warning/30 bg-warning/5 p-4">
                <p className="text-sm font-semibold text-warning mb-2">Critical Path (Longest Chain)</p>
                <div className="flex flex-wrap items-center gap-2">
                  {criticalPath.map((nodeId, idx) => {
                    const node = nodeMap.get(nodeId);
                    return (
                      <div key={nodeId} className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-lg border ${
                          NODE_COLORS[node?.type || "step"].bg
                        } ${NODE_COLORS[node?.type || "step"].border}`}>
                          <span className="text-sm font-medium">{node?.name || nodeId}</span>
                        </div>
                        {idx < criticalPath.length - 1 && (
                          <svg className="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Parallel Groups */}
            {parallelGroups.length > 0 && (
              <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                <p className="text-sm font-semibold text-success mb-2">
                  Parallel Execution Groups (Save Time!)
                </p>
                <div className="space-y-2">
                  {parallelGroups.map((group, gidx) => (
                    <div key={gidx} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16">Group {gidx + 1}:</span>
                      <div className="flex flex-wrap gap-1">
                        {group.map((nodeId) => {
                          const node = nodeMap.get(nodeId);
                          return (
                            <Badge key={nodeId} variant="secondary" className="text-xs">
                              {node?.name || nodeId}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nodes by Type */}
            <div>
              <p className="text-sm font-semibold mb-3">All Items</p>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {nodes.map((node) => {
                  const colors = NODE_COLORS[node.type] || NODE_COLORS.step;
                  const isCritical = criticalPath.includes(node.id);
                  
                  return (
                    <div
                      key={node.id}
                      className={`rounded-lg border p-3 ${colors.bg} ${colors.border} ${
                        isCritical ? "ring-2 ring-warning ring-offset-2" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-sm font-medium ${colors.text}`}>{node.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {node.type}
                        </Badge>
                      </div>
                      {/* Show dependencies for this node */}
                      {edges.filter(e => e.to === node.id).length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Needs: {edges.filter(e => e.to === node.id).map(e => {
                            const fromNode = nodeMap.get(e.from);
                            return fromNode?.name || e.from;
                          }).join(", ")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Edges / Dependencies */}
            {edges.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-3">Dependencies</p>
                <div className="space-y-2">
                  {edges.map((edge, idx) => {
                    const fromNode = nodeMap.get(edge.from);
                    const toNode = nodeMap.get(edge.to);
                    const edgeColor = EDGE_COLORS[edge.type] || "text-muted-foreground";
                    
                    return (
                      <div
                        key={idx}
                        className="rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{fromNode?.name || edge.from}</span>
                          <svg className={`h-4 w-4 ${edgeColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                          <span className="text-sm font-medium">{toNode?.name || edge.to}</span>
                        </div>
                        <Badge variant="outline" className={`text-xs capitalize ${edgeColor}`}>
                          {edge.type}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <p className="font-medium mb-1">No Dependency Data</p>
            <p className="text-sm max-w-xs mx-auto">
              Run an analysis to see how licenses and documents depend on each other
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

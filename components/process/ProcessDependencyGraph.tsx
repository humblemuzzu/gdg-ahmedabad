"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { DependencyGraph } from "@/types";
import { DependencyFlowchart } from "./DependencyFlowchart";

interface ProcessDependencyGraphProps {
  dependencyGraph?: DependencyGraph | null;
}

// Node type colors - using subtle backgrounds
const NODE_COLORS: Record<string, { bg: string; text: string }> = {
  document: { bg: "bg-info/10", text: "text-info" },
  license: { bg: "bg-success/10", text: "text-success" },
  step: { bg: "bg-primary/10", text: "text-primary" },
};

// Edge type colors
const EDGE_COLORS: Record<string, { text: string; label: string }> = {
  requires: { text: "text-warning", label: "requires" },
  enables: { text: "text-success", label: "enables" },
  blocks: { text: "text-destructive", label: "blocks" },
};

export function ProcessDependencyGraph({ dependencyGraph }: ProcessDependencyGraphProps) {
  const [showAllItems, setShowAllItems] = useState(false);
  
  const nodes = dependencyGraph?.nodes || [];
  const edges = dependencyGraph?.edges || [];
  const criticalPath = dependencyGraph?.criticalPath || [];
  const parallelGroups = dependencyGraph?.parallelGroups || [];

  const hasData = nodes.length > 0 || edges.length > 0;

  // Create a map of node IDs to node info for quick lookup
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  if (!hasData) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="flex h-20 w-20 mx-auto mb-6 items-center justify-center rounded-full bg-muted/30">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
        </div>
        <p className="font-semibold text-foreground mb-2">No Dependency Data</p>
        <p className="text-sm max-w-xs mx-auto">
          Run an analysis to see how licenses and documents depend on each other
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Dependencies</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {nodes.length} items, {edges.length} dependencies
          </p>
        </div>
        {criticalPath.length > 0 && (
          <Badge className="bg-warning/10 text-warning border-0">
            Critical Path: {criticalPath.length} steps
          </Badge>
        )}
      </div>

      {/* ============================================ */}
      {/* 1. FLOWCHART - Interactive visualization */}
      {/* ============================================ */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Dependency Flowchart</h3>
            <p className="text-sm text-muted-foreground">Visual map of how items depend on each other</p>
          </div>
        </div>
        
        <DependencyFlowchart 
          dependencyGraph={dependencyGraph!} 
          criticalPath={criticalPath}
        />
      </section>

      {/* ============================================ */}
      {/* 2. CRITICAL PATH & PARALLEL GROUPS */}
      {/* ============================================ */}
      {(criticalPath.length > 0 || parallelGroups.length > 0) && (
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Critical Path */}
          {criticalPath.length > 0 && (
            <div className="bg-warning/5 rounded-2xl p-6 border-l-4 border-warning">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Critical Path</p>
                  <p className="text-xs text-muted-foreground">Longest dependency chain</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {criticalPath.map((nodeId, idx) => {
                  const node = nodeMap.get(nodeId);
                  const colors = NODE_COLORS[node?.type || "step"];
                  return (
                    <div key={nodeId} className="flex items-center gap-2">
                      <span className={`${colors.bg} ${colors.text} px-3 py-1.5 rounded-lg text-sm font-medium`}>
                        {node?.name || nodeId}
                      </span>
                      {idx < criticalPath.length - 1 && (
                        <svg className="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
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
            <div className="bg-success/5 rounded-2xl p-6 border-l-4 border-success">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Parallel Groups</p>
                  <p className="text-xs text-muted-foreground">Can be done simultaneously</p>
                </div>
              </div>
              <div className="space-y-3">
                {parallelGroups.map((group, gidx) => (
                  <div key={gidx} className="flex items-start gap-3">
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg flex-shrink-0">
                      {gidx + 1}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {group.map((nodeId) => {
                        const node = nodeMap.get(nodeId);
                        return (
                          <span key={nodeId} className="bg-success/10 text-success text-sm px-3 py-1 rounded-lg">
                            {node?.name || nodeId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ============================================ */}
      {/* 3. DEPENDENCY RELATIONSHIPS */}
      {/* ============================================ */}
      {edges.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Relationships</h3>
              <p className="text-sm text-muted-foreground">{edges.length} dependency connections</p>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl divide-y divide-border/50 overflow-hidden">
            {edges.map((edge, idx) => {
              const fromNode = nodeMap.get(edge.from);
              const toNode = nodeMap.get(edge.to);
              const edgeStyle = EDGE_COLORS[edge.type] || { text: "text-muted-foreground", label: edge.type };
              const fromColors = NODE_COLORS[fromNode?.type || "step"];
              const toColors = NODE_COLORS[toNode?.type || "step"];
              
              return (
                <div
                  key={idx}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-muted/20 transition-colors"
                >
                  {/* From node */}
                  <div className={`${fromColors.bg} ${fromColors.text} px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2`}>
                    {fromNode?.type === "document" ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : fromNode?.type === "license" ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                    <span>{fromNode?.name || edge.from}</span>
                  </div>
                  
                  {/* Arrow with label */}
                  <div className="flex items-center gap-2 flex-1 justify-center">
                    <div className={`h-px flex-1 max-w-[60px] ${
                      edge.type === "requires" ? "bg-warning" :
                      edge.type === "enables" ? "bg-success" :
                      edge.type === "blocks" ? "bg-destructive" : "bg-muted"
                    }`} />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      edge.type === "requires" ? "bg-warning/10 text-warning" :
                      edge.type === "enables" ? "bg-success/10 text-success" :
                      edge.type === "blocks" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                    }`}>
                      {edgeStyle.label}
                    </span>
                    <div className="flex items-center">
                      <div className={`h-px flex-1 max-w-[40px] ${
                        edge.type === "requires" ? "bg-warning" :
                        edge.type === "enables" ? "bg-success" :
                        edge.type === "blocks" ? "bg-destructive" : "bg-muted"
                      }`} />
                      <svg className={`h-3 w-3 -ml-0.5 ${edgeStyle.text}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* To node */}
                  <div className={`${toColors.bg} ${toColors.text} px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2`}>
                    {toNode?.type === "document" ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : toNode?.type === "license" ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                    <span>{toNode?.name || edge.to}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* 4. ALL ITEMS */}
      {/* ============================================ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">All Items</h3>
              <p className="text-sm text-muted-foreground">{nodes.length} documents, licenses, and steps</p>
            </div>
          </div>
          <button
            onClick={() => setShowAllItems(!showAllItems)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            {showAllItems ? "Collapse" : "Expand"}
            <svg className={`h-4 w-4 transition-transform ${showAllItems ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {showAllItems && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {nodes.map((node) => {
              const colors = NODE_COLORS[node.type] || NODE_COLORS.step;
              const isCritical = criticalPath.includes(node.id);
              const dependencies = edges.filter(e => e.to === node.id);
              const enables = edges.filter(e => e.from === node.id);
              
              return (
                <div
                  key={node.id}
                  className={`bg-card rounded-xl p-5 transition-all hover:shadow-sm ${
                    isCritical ? "ring-2 ring-warning/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg} ${colors.text} flex-shrink-0`}>
                      {node.type === "document" ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ) : node.type === "license" ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Badge className="bg-muted/50 text-muted-foreground border-0 text-xs capitalize">
                        {node.type}
                      </Badge>
                      {isCritical && (
                        <Badge className="bg-warning/10 text-warning border-0 text-xs">
                          Critical
                        </Badge>
                      )}
                    </div>
                  </div>
                  <h4 className={`font-medium ${colors.text}`}>{node.name}</h4>
                  
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                    {dependencies.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        <span className="text-warning">←</span> Needs: {dependencies.map(e => {
                          const fromNode = nodeMap.get(e.from);
                          return fromNode?.name || e.from;
                        }).join(", ")}
                      </p>
                    )}
                    {enables.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        <span className="text-success">→</span> Enables: {enables.map(e => {
                          const toNode = nodeMap.get(e.to);
                          return toNode?.name || e.to;
                        }).join(", ")}
                      </p>
                    )}
                    {dependencies.length === 0 && enables.length === 0 && (
                      <p className="text-xs text-muted-foreground">No dependencies</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {!showAllItems && (
          <div className="bg-muted/20 rounded-xl p-4 text-center text-sm text-muted-foreground">
            Click "Expand" to see all {nodes.length} items
          </div>
        )}
      </section>
    </div>
  );
}

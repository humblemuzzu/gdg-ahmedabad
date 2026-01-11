"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DependencyGraph } from "@/types";

interface DependencyFlowchartProps {
  dependencyGraph: DependencyGraph;
  criticalPath?: string[];
}

interface LayoutNode {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  level: number;
  isCritical: boolean;
}

interface LayoutEdge {
  from: string;
  to: string;
  type: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

// Node dimensions
const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;
const LEVEL_GAP_X = 280;
const NODE_GAP_Y = 100;
const PADDING = 60;

// Node type colors
const NODE_COLORS: Record<string, { bg: string; border: string; text: string; fill: string }> = {
  document: { bg: "bg-info/10", border: "border-info/30", text: "text-info", fill: "#3b82f6" },
  license: { bg: "bg-success/10", border: "border-success/30", text: "text-success", fill: "#22c55e" },
  step: { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary", fill: "#8b5cf6" },
};

// Edge type colors
const EDGE_COLORS: Record<string, string> = {
  requires: "#f59e0b",
  enables: "#22c55e",
  blocks: "#ef4444",
};

// Calculate layout using topological sort with levels
function calculateLayout(
  nodes: DependencyGraph["nodes"],
  edges: DependencyGraph["edges"],
  criticalPath: string[] = []
): { layoutNodes: LayoutNode[]; layoutEdges: LayoutEdge[]; width: number; height: number } {
  if (!nodes || nodes.length === 0) {
    return { layoutNodes: [], layoutEdges: [], width: 400, height: 300 };
  }

  // Build adjacency lists
  const inDegree = new Map<string, number>();
  const outEdges = new Map<string, string[]>();
  const inEdges = new Map<string, string[]>();
  
  nodes.forEach(n => {
    inDegree.set(n.id, 0);
    outEdges.set(n.id, []);
    inEdges.set(n.id, []);
  });
  
  edges.forEach(e => {
    inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
    outEdges.get(e.from)?.push(e.to);
    inEdges.get(e.to)?.push(e.from);
  });

  // Assign levels using BFS (Kahn's algorithm variant)
  const levels = new Map<string, number>();
  const queue: string[] = [];
  
  // Start with nodes that have no dependencies
  nodes.forEach(n => {
    if ((inDegree.get(n.id) || 0) === 0) {
      queue.push(n.id);
      levels.set(n.id, 0);
    }
  });

  // Process nodes level by level
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const currentLevel = levels.get(nodeId) || 0;
    
    outEdges.get(nodeId)?.forEach(toId => {
      const newLevel = currentLevel + 1;
      const existingLevel = levels.get(toId);
      
      if (existingLevel === undefined || newLevel > existingLevel) {
        levels.set(toId, newLevel);
      }
      
      const newInDegree = (inDegree.get(toId) || 1) - 1;
      inDegree.set(toId, newInDegree);
      
      if (newInDegree === 0) {
        queue.push(toId);
      }
    });
  }

  // Handle any remaining nodes (cycles or disconnected)
  nodes.forEach(n => {
    if (!levels.has(n.id)) {
      levels.set(n.id, 0);
    }
  });

  // Group nodes by level
  const levelGroups = new Map<number, string[]>();
  levels.forEach((level, nodeId) => {
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(nodeId);
  });

  // Calculate positions
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const criticalSet = new Set(Array.isArray(criticalPath) ? criticalPath : []);
  const layoutNodes: LayoutNode[] = [];
  
  let maxLevel = 0;
  let maxNodesInLevel = 0;
  
  levelGroups.forEach((nodeIds, level) => {
    maxLevel = Math.max(maxLevel, level);
    maxNodesInLevel = Math.max(maxNodesInLevel, nodeIds.length);
    
    nodeIds.forEach((nodeId, idx) => {
      const node = nodeMap.get(nodeId);
      if (node) {
        layoutNodes.push({
          id: node.id,
          name: node.name,
          type: node.type,
          x: PADDING + level * LEVEL_GAP_X,
          y: PADDING + idx * NODE_GAP_Y,
          level,
          isCritical: criticalSet.has(node.id),
        });
      }
    });
  });

  // Create node position map for edges
  const positionMap = new Map(layoutNodes.map(n => [n.id, { x: n.x, y: n.y }]));

  // Calculate edges
  const layoutEdges: LayoutEdge[] = edges.map(e => {
    const fromPos = positionMap.get(e.from) || { x: 0, y: 0 };
    const toPos = positionMap.get(e.to) || { x: 0, y: 0 };
    
    return {
      from: e.from,
      to: e.to,
      type: e.type,
      fromX: fromPos.x + NODE_WIDTH,
      fromY: fromPos.y + NODE_HEIGHT / 2,
      toX: toPos.x,
      toY: toPos.y + NODE_HEIGHT / 2,
    };
  });

  // Calculate canvas size
  const width = Math.max(600, PADDING * 2 + (maxLevel + 1) * LEVEL_GAP_X);
  const height = Math.max(400, PADDING * 2 + maxNodesInLevel * NODE_GAP_Y);

  return { layoutNodes, layoutEdges, width, height };
}

// Generate curved path for edges
function generateEdgePath(edge: LayoutEdge): string {
  const dx = edge.toX - edge.fromX;
  const controlOffset = Math.min(Math.abs(dx) * 0.4, 80);
  
  return `M ${edge.fromX} ${edge.fromY} 
          C ${edge.fromX + controlOffset} ${edge.fromY}, 
            ${edge.toX - controlOffset} ${edge.toY}, 
            ${edge.toX} ${edge.toY}`;
}

export function DependencyFlowchart({ dependencyGraph, criticalPath = [] }: DependencyFlowchartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Calculate layout - ensure nodes and edges are arrays
  const safeNodes = Array.isArray(dependencyGraph?.nodes) ? dependencyGraph.nodes : [];
  const safeEdges = Array.isArray(dependencyGraph?.edges) ? dependencyGraph.edges : [];
  const safeCriticalPath = Array.isArray(criticalPath) ? criticalPath : [];
  
  const { layoutNodes, layoutEdges, width, height } = useMemo(() => 
    calculateLayout(safeNodes, safeEdges, safeCriticalPath),
    [safeNodes, safeEdges, safeCriticalPath]
  );

  // Fit to container on mount
  useEffect(() => {
    if (containerRef.current && width > 0 && height > 0) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = 500; // Fixed height
      
      const scaleX = (containerWidth - 40) / width;
      const scaleY = (containerHeight - 40) / height;
      const scale = Math.min(scaleX, scaleY, 1);
      
      setZoom(scale);
      setPan({
        x: (containerWidth - width * scale) / 2,
        y: (containerHeight - height * scale) / 2,
      });
    }
  }, [width, height]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(z * 1.2, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(z => Math.max(z / 1.2, 0.3));
  }, []);

  const handleZoomReset = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = 500;
      
      const scaleX = (containerWidth - 40) / width;
      const scaleY = (containerHeight - 40) / height;
      const scale = Math.min(scaleX, scaleY, 1);
      
      setZoom(scale);
      setPan({
        x: (containerWidth - width * scale) / 2,
        y: (containerHeight - height * scale) / 2,
      });
    }
  }, [width, height]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.3, Math.min(2, z * delta)));
  }, []);

  // Get connected nodes for highlighting
  const getConnectedNodes = useCallback((nodeId: string) => {
    const connected = new Set<string>();
    layoutEdges.forEach(e => {
      if (e.from === nodeId) connected.add(e.to);
      if (e.to === nodeId) connected.add(e.from);
    });
    return connected;
  }, [layoutEdges]);

  const connectedNodes = hoveredNode ? getConnectedNodes(hoveredNode) : new Set<string>();

  if (layoutNodes.length === 0) {
    return (
      <div className="bg-muted/20 rounded-2xl p-12 text-center">
        <p className="text-muted-foreground">No dependency data to visualize</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </Button>
          <span className="text-sm text-muted-foreground w-16 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomReset} className="h-8 px-3">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Fit
          </Button>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-info/50" />
            <span className="text-muted-foreground">Document</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-success/50" />
            <span className="text-muted-foreground">License</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/50" />
            <span className="text-muted-foreground">Step</span>
          </div>
        </div>
      </div>

      {/* Flowchart Canvas */}
      <div 
        ref={containerRef}
        className="bg-muted/10 rounded-2xl overflow-hidden relative select-none"
        style={{ height: 500, cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Grid Background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Main SVG Canvas */}
        <svg 
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Arrow marker definitions */}
          <defs>
            {Object.entries(EDGE_COLORS).map(([type, color]) => (
              <marker
                key={type}
                id={`arrow-${type}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
              </marker>
            ))}
            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Edges */}
          <g className="edges">
            {layoutEdges.map((edge, idx) => {
              const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to;
              const color = EDGE_COLORS[edge.type] || "#888";
              
              return (
                <g key={idx}>
                  {/* Edge path */}
                  <path
                    d={generateEdgePath(edge)}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHighlighted ? 3 : 2}
                    strokeOpacity={hoveredNode && !isHighlighted ? 0.2 : 0.8}
                    markerEnd={`url(#arrow-${edge.type})`}
                    className="transition-all duration-200"
                    style={{
                      filter: isHighlighted ? "url(#glow)" : "none",
                    }}
                  />
                  {/* Animated dash for critical path */}
                  {Array.isArray(criticalPath) && criticalPath.includes(edge.from) && criticalPath.includes(edge.to) && (
                    <path
                      d={generateEdgePath(edge)}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="8,4"
                      strokeOpacity={0.5}
                      className="animate-dash"
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {layoutNodes.map((node) => {
              const colors = NODE_COLORS[node.type] || NODE_COLORS.step;
              const isHovered = hoveredNode === node.id;
              const isConnected = connectedNodes.has(node.id);
              const isSelected = selectedNode === node.id;
              const isDimmed = hoveredNode && !isHovered && !isConnected;
              
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    opacity: isDimmed ? 0.3 : 1,
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                >
                  {/* Critical path glow */}
                  {node.isCritical && (
                    <rect
                      x={-4}
                      y={-4}
                      width={NODE_WIDTH + 8}
                      height={NODE_HEIGHT + 8}
                      rx={16}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="6,3"
                      className="animate-pulse"
                      opacity={0.6}
                    />
                  )}
                  
                  {/* Node background */}
                  <rect
                    x={0}
                    y={0}
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx={12}
                    fill="white"
                    className="dark:fill-gray-900"
                    stroke={isHovered || isSelected ? colors.fill : "rgba(0,0,0,0.1)"}
                    strokeWidth={isHovered || isSelected ? 2 : 1}
                    filter={isHovered ? "url(#glow)" : "none"}
                  />
                  
                  {/* Colored accent */}
                  <rect
                    x={0}
                    y={0}
                    width={6}
                    height={NODE_HEIGHT}
                    rx={12}
                    fill={colors.fill}
                    clipPath="inset(0 round 12px 0 0 12px)"
                  />
                  <rect
                    x={0}
                    y={0}
                    width={6}
                    height={NODE_HEIGHT}
                    fill={colors.fill}
                  />
                  
                  {/* Node icon */}
                  <g transform={`translate(16, ${NODE_HEIGHT / 2 - 10})`} fill={colors.fill}>
                    {node.type === "document" ? (
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                            stroke={colors.fill} strokeWidth="1.5" fill="none" />
                    ) : node.type === "license" ? (
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                            stroke={colors.fill} strokeWidth="1.5" fill="none" />
                    ) : (
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                            stroke={colors.fill} strokeWidth="1.5" fill="none" />
                    )}
                  </g>
                  
                  {/* Node text */}
                  <text
                    x={44}
                    y={NODE_HEIGHT / 2 + 1}
                    fontSize={12}
                    fontWeight={500}
                    fill="currentColor"
                    className="text-foreground"
                    dominantBaseline="middle"
                  >
                    {node.name.length > 16 ? node.name.slice(0, 14) + "..." : node.name}
                  </text>
                  
                  {/* Type badge */}
                  <g transform={`translate(${NODE_WIDTH - 60}, 6)`}>
                    <rect
                      width={50}
                      height={18}
                      rx={9}
                      fill={colors.fill}
                      opacity={0.15}
                    />
                    <text
                      x={25}
                      y={12}
                      fontSize={9}
                      fill={colors.fill}
                      textAnchor="middle"
                      fontWeight={500}
                      style={{ textTransform: "capitalize" }}
                    >
                      {node.type}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Zoom hint */}
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-lg">
          Scroll to zoom • Drag to pan
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="bg-card rounded-xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {(() => {
            const node = layoutNodes.find(n => n.id === selectedNode);
            if (!node) return null;
            
            const colors = NODE_COLORS[node.type] || NODE_COLORS.step;
            const incomingEdges = layoutEdges.filter(e => e.to === selectedNode);
            const outgoingEdges = layoutEdges.filter(e => e.from === selectedNode);
            
            return (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}>
                      {node.type === "document" ? (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ) : node.type === "license" ? (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      ) : (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{node.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${colors.bg} ${colors.text} border-0 capitalize`}>{node.type}</Badge>
                        {node.isCritical && (
                          <Badge className="bg-warning/10 text-warning border-0">Critical Path</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Dependencies (incoming) */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Depends On ({incomingEdges.length})</p>
                    {incomingEdges.length > 0 ? (
                      <div className="space-y-1">
                        {incomingEdges.map((edge, idx) => {
                          const fromNode = layoutNodes.find(n => n.id === edge.from);
                          return (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className="text-warning">←</span>
                              <span>{fromNode?.name || edge.from}</span>
                              <span className="text-xs text-muted-foreground">({edge.type})</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No dependencies</p>
                    )}
                  </div>
                  
                  {/* Enables (outgoing) */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Enables ({outgoingEdges.length})</p>
                    {outgoingEdges.length > 0 ? (
                      <div className="space-y-1">
                        {outgoingEdges.map((edge, idx) => {
                          const toNode = layoutNodes.find(n => n.id === edge.to);
                          return (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className="text-success">→</span>
                              <span>{toNode?.name || edge.to}</span>
                              <span className="text-xs text-muted-foreground">({edge.type})</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No dependents</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Add CSS animation for dashed lines */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -24;
          }
        }
        .animate-dash {
          animation: dash 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DependencyGraph } from "@/types";

interface DependencyFlowchartProps {
  dependencyGraph: DependencyGraph;
  criticalPath?: string[];
}

// Layout constants
const NODE_W = 180;
const NODE_H = 60;
const GAP_X = 280;
const GAP_Y = 100;
const MARGIN = 60;

// Colors
const COLORS: Record<string, string> = {
  document: "#3b82f6",
  license: "#22c55e", 
  step: "#8b5cf6",
};

const EDGE_COLORS: Record<string, string> = {
  requires: "#f59e0b",
  enables: "#22c55e",
  blocks: "#ef4444",
};

interface NodePos {
  id: string;
  name: string;
  type: "document" | "license" | "step";
  x: number;
  y: number;
  level: number;
  isCritical: boolean;
}

interface EdgePos {
  id: string;
  from: string;
  to: string;
  type: "requires" | "enables" | "blocks";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isCritical: boolean;
}

export function DependencyFlowchart({ dependencyGraph, criticalPath = [] }: DependencyFlowchartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, w: 1200, h: 600 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, vx: 0, vy: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // Extract and validate data
  const rawNodes = useMemo(() => {
    const n = dependencyGraph?.nodes;
    if (!Array.isArray(n)) return [];
    return n.filter(x => x && typeof x.id === "string" && x.id.length > 0);
  }, [dependencyGraph?.nodes]);

  const rawEdges = useMemo(() => {
    const e = dependencyGraph?.edges;
    if (!Array.isArray(e)) return [];
    return e.filter(x => x && typeof x.from === "string" && typeof x.to === "string");
  }, [dependencyGraph?.edges]);

  const criticalSet = useMemo(() => {
    const c = Array.isArray(criticalPath) && criticalPath.length > 0 
      ? criticalPath 
      : (Array.isArray(dependencyGraph?.criticalPath) ? dependencyGraph.criticalPath : []);
    return new Set(c);
  }, [criticalPath, dependencyGraph?.criticalPath]);

  // Calculate layout
  const { nodes, edges, bounds } = useMemo(() => {
    if (rawNodes.length === 0) {
      return { nodes: [] as NodePos[], edges: [] as EdgePos[], bounds: { w: 800, h: 500 } };
    }

    const nodeSet = new Set(rawNodes.map(n => n.id));
    const nodeMap = new Map(rawNodes.map(n => [n.id, n]));
    
    // Build dependency maps
    const deps = new Map<string, string[]>();
    rawNodes.forEach(n => deps.set(n.id, []));
    
    rawEdges.forEach(e => {
      if (nodeSet.has(e.from) && nodeSet.has(e.to)) {
        deps.get(e.to)?.push(e.from);
      }
    });

    // Calculate levels using recursion with memoization
    const levels = new Map<string, number>();
    const calculating = new Set<string>();
    
    const getLevel = (id: string): number => {
      if (levels.has(id)) return levels.get(id)!;
      if (calculating.has(id)) return 0; // Cycle
      
      calculating.add(id);
      const parents = deps.get(id) || [];
      const level = parents.length === 0 ? 0 : Math.max(...parents.map(p => getLevel(p))) + 1;
      levels.set(id, level);
      calculating.delete(id);
      return level;
    };

    rawNodes.forEach(n => getLevel(n.id));

    // Group by level
    const byLevel: string[][] = [];
    let maxLevel = 0;
    
    levels.forEach((lvl, id) => {
      maxLevel = Math.max(maxLevel, lvl);
      while (byLevel.length <= lvl) byLevel.push([]);
      byLevel[lvl].push(id);
    });

    // Calculate max nodes per level for vertical centering
    const maxPerLevel = Math.max(1, ...byLevel.map(l => l.length));

    // Position all nodes
    const positioned: NodePos[] = [];
    const posMap = new Map<string, { x: number; y: number }>();

    byLevel.forEach((ids, lvl) => {
      const colH = ids.length * GAP_Y;
      const totalH = maxPerLevel * GAP_Y;
      const offsetY = (totalH - colH) / 2;

      ids.forEach((id, idx) => {
        const n = nodeMap.get(id);
        if (!n) return;

        const x = MARGIN + lvl * GAP_X;
        const y = MARGIN + offsetY + idx * GAP_Y;
        
        posMap.set(id, { x, y });
        
        const nodeType = n.type === "document" || n.type === "license" || n.type === "step" 
          ? n.type : "step";
        
        positioned.push({
          id: n.id,
          name: String(n.name || n.id),
          type: nodeType,
          x, y,
          level: lvl,
          isCritical: criticalSet.has(n.id),
        });
      });
    });

    // Create edges
    const edgeList: EdgePos[] = [];
    rawEdges.forEach((e, i) => {
      const from = posMap.get(e.from);
      const to = posMap.get(e.to);
      if (!from || !to) return;

      const edgeType = e.type === "requires" || e.type === "enables" || e.type === "blocks"
        ? e.type : "requires";

      edgeList.push({
        id: `edge-${i}`,
        from: e.from,
        to: e.to,
        type: edgeType,
        x1: from.x + NODE_W,
        y1: from.y + NODE_H / 2,
        x2: to.x,
        y2: to.y + NODE_H / 2,
        isCritical: criticalSet.has(e.from) && criticalSet.has(e.to),
      });
    });

    const w = MARGIN * 2 + (maxLevel + 1) * GAP_X;
    const h = MARGIN * 2 + maxPerLevel * GAP_Y;

    return { nodes: positioned, edges: edgeList, bounds: { w, h } };
  }, [rawNodes, rawEdges, criticalSet]);

  // Initialize view to fit content
  const resetView = useCallback(() => {
    setView({ x: -30, y: -30, w: bounds.w + 60, h: bounds.h + 60 });
  }, [bounds]);

  // Reset view when bounds change - use useEffect for side effects
  useEffect(() => {
    if (bounds.w > 0 && bounds.h > 0) {
      setView({ x: -30, y: -30, w: bounds.w + 60, h: bounds.h + 60 });
    }
  }, [bounds.w, bounds.h]);

  // Zoom
  const zoom = useCallback((factor: number) => {
    setView(v => {
      const cx = v.x + v.w / 2;
      const cy = v.y + v.h / 2;
      const nw = v.w / factor;
      const nh = v.h / factor;
      return { x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh };
    });
  }, []);

  // Pan handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 0) {
      setDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY, vx: view.x, vy: view.y });
      (e.target as Element).setPointerCapture(e.pointerId);
    }
  }, [view]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const svg = svgRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const scaleX = view.w / rect.width;
    const scaleY = view.h / rect.height;
    
    const dx = (e.clientX - dragStart.x) * scaleX;
    const dy = (e.clientY - dragStart.y) * scaleY;
    
    setView(v => ({ ...v, x: dragStart.vx - dx, y: dragStart.vy - dy }));
  }, [dragging, dragStart, view.w, view.h]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    setDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    zoom(e.deltaY > 0 ? 0.9 : 1.1);
  }, [zoom]);

  // Edge path
  const pathD = (e: EdgePos) => {
    const dx = e.x2 - e.x1;
    const cp = Math.min(Math.abs(dx) * 0.4, 100);
    return `M${e.x1},${e.y1} C${e.x1+cp},${e.y1} ${e.x2-cp},${e.y2} ${e.x2},${e.y2}`;
  };

  // Highlight connections
  const connected = useMemo(() => {
    if (!hovered) return new Set<string>();
    const s = new Set<string>();
    edges.forEach(e => {
      if (e.from === hovered) s.add(e.to);
      if (e.to === hovered) s.add(e.from);
    });
    return s;
  }, [hovered, edges]);

  // Current zoom percentage
  const zoomPct = Math.round((bounds.w / view.w) * 100);

  if (nodes.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-2xl p-12 text-center border border-slate-700">
        <p className="text-slate-400">No dependency data to visualize</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => zoom(0.8)} className="h-8 w-8 p-0">
            <span className="text-lg">-</span>
          </Button>
          <span className="text-sm text-muted-foreground w-14 text-center">{zoomPct}%</span>
          <Button variant="outline" size="sm" onClick={() => zoom(1.25)} className="h-8 w-8 p-0">
            <span className="text-lg">+</span>
          </Button>
          <Button variant="outline" size="sm" onClick={resetView} className="h-8 px-3">
            Fit
          </Button>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{background: COLORS.document}}/>
            Document
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{background: COLORS.license}}/>
            License
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{background: COLORS.step}}/>
            Step
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div 
        className="relative rounded-2xl overflow-hidden border border-slate-700"
        style={{ height: 500, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          style={{ cursor: dragging ? "grabbing" : "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
        >
          <defs>
            {Object.entries(EDGE_COLORS).map(([type, color]) => (
              <marker key={type} id={`arrow-${type}`} viewBox="0 0 10 10" refX="9" refY="5" 
                      markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill={color}/>
              </marker>
            ))}
            <marker id="arrow-crit" viewBox="0 0 10 10" refX="9" refY="5" 
                    markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#f59e0b"/>
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Grid */}
          <g opacity="0.07" stroke="white" strokeWidth="0.5">
            {Array.from({length: 60}, (_, i) => <line key={`v${i}`} x1={i*50} y1="-100" x2={i*50} y2="1500"/>)}
            {Array.from({length: 40}, (_, i) => <line key={`h${i}`} x1="-100" y1={i*50} x2="3000" y2={i*50}/>)}
          </g>

          {/* Edges */}
          <g>
            {edges.map(e => {
              const hl = hovered === e.from || hovered === e.to;
              const color = e.isCritical ? "#f59e0b" : EDGE_COLORS[e.type] || "#888";
              const dim = hovered && !hl;
              
              return (
                <g key={e.id}>
                  <path d={pathD(e)} fill="none" stroke={color} strokeWidth={hl ? 3 : 2} 
                        opacity={dim ? 0.15 : 1} markerEnd={e.isCritical ? "url(#arrow-crit)" : `url(#arrow-${e.type})`}
                        style={hl ? {filter: "url(#glow)"} : undefined}/>
                  {e.isCritical && (
                    <path d={pathD(e)} fill="none" stroke="#f59e0b" strokeWidth="2" 
                          strokeDasharray="8,5" opacity="0.6">
                      <animate attributeName="stroke-dashoffset" from="0" to="-26" dur="1s" repeatCount="indefinite"/>
                    </path>
                  )}
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {nodes.map(n => {
              const color = COLORS[n.type] || COLORS.step;
              const hl = hovered === n.id;
              const conn = connected.has(n.id);
              const sel = selected === n.id;
              const dim = hovered && !hl && !conn;
              
              return (
                <g key={n.id} transform={`translate(${n.x},${n.y})`} opacity={dim ? 0.25 : 1}
                   style={{cursor: "pointer"}}
                   onPointerEnter={() => setHovered(n.id)}
                   onPointerLeave={() => setHovered(null)}
                   onClick={() => setSelected(n.id === selected ? null : n.id)}>
                  
                  {/* Critical glow */}
                  {n.isCritical && (
                    <rect x="-5" y="-5" width={NODE_W+10} height={NODE_H+10} rx="15" 
                          fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,4">
                      <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
                    </rect>
                  )}
                  
                  {/* Shadow */}
                  <rect x="3" y="5" width={NODE_W} height={NODE_H} rx="12" fill="black" opacity="0.5"/>
                  
                  {/* Background */}
                  <rect width={NODE_W} height={NODE_H} rx="12" fill="#1e293b" 
                        stroke={hl || sel ? color : "#475569"} strokeWidth={hl || sel ? 2.5 : 1.5}/>
                  
                  {/* Accent */}
                  <rect width="6" height={NODE_H} rx="12" fill={color}/>
                  <rect x="0" y="6" width="6" height={NODE_H-12} fill={color}/>
                  
                  {/* Icon */}
                  <g transform="translate(18, 16)" fill="none" stroke={color} strokeWidth="1.5">
                    {n.type === "document" && <>
                      <rect x="1" y="0" width="16" height="20" rx="2"/>
                      <line x1="5" y1="6" x2="13" y2="6"/>
                      <line x1="5" y1="10" x2="13" y2="10"/>
                      <line x1="5" y1="14" x2="10" y2="14"/>
                    </>}
                    {n.type === "license" && <>
                      <path d="M9,0 L18,5 L18,13 C18,17 14,21 9,23 C4,21 0,17 0,13 L0,5 Z"/>
                      <path d="M5,12 L8,15 L14,9" strokeLinecap="round" strokeLinejoin="round"/>
                    </>}
                    {n.type === "step" && <>
                      <rect x="0" y="4" width="18" height="16" rx="2"/>
                      <line x1="4" y1="0" x2="4" y2="4"/>
                      <line x1="14" y1="0" x2="14" y2="4"/>
                      <line x1="0" y1="10" x2="18" y2="10"/>
                    </>}
                  </g>
                  
                  {/* Text */}
                  <text x="48" y="24" fontSize="12" fontWeight="600" fill="white">
                    {n.name.length > 15 ? n.name.slice(0,13)+"..." : n.name}
                  </text>
                  <text x="48" y="42" fontSize="10" fill={color} style={{textTransform:"capitalize"}}>
                    {n.type}
                  </text>
                  
                  {/* Critical dot */}
                  {n.isCritical && <circle cx={NODE_W-15} cy="15" r="6" fill="#f59e0b"/>}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Info badges */}
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs bg-black/70 text-white/80 backdrop-blur">
          {nodes.length} nodes &middot; {edges.length} connections
        </div>
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg text-xs bg-black/70 text-white/80 backdrop-blur">
          Scroll to zoom &middot; Drag to pan
        </div>
      </div>

      {/* Selected node details */}
      {selected && (() => {
        const node = nodes.find(n => n.id === selected);
        if (!node) return null;
        
        const color = COLORS[node.type] || COLORS.step;
        const inEdges = edges.filter(e => e.to === selected);
        const outEdges = edges.filter(e => e.from === selected);
        
        return (
          <div className="bg-card rounded-xl p-5 border animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background: `${color}20`}}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                    {node.type === "document" && <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"/>}
                    {node.type === "license" && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4"/>}
                    {node.type === "step" && <path d="M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>}
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{node.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge style={{background:`${color}20`, color}} className="border-0 capitalize">{node.type}</Badge>
                    {node.isCritical && <Badge className="bg-amber-500/10 text-amber-500 border-0">Critical Path</Badge>}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Depends On ({inEdges.length})</p>
                {inEdges.length > 0 ? (
                  <div className="space-y-1.5">
                    {inEdges.map(e => {
                      const from = nodes.find(n => n.id === e.from);
                      return (
                        <div key={e.id} className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg px-3 py-2">
                          <span style={{color: EDGE_COLORS[e.type]}}>&#8592;</span>
                          <span className="font-medium">{from?.name || e.from}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-muted-foreground/60 italic">No dependencies - can start immediately</p>}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Enables ({outEdges.length})</p>
                {outEdges.length > 0 ? (
                  <div className="space-y-1.5">
                    {outEdges.map(e => {
                      const to = nodes.find(n => n.id === e.to);
                      return (
                        <div key={e.id} className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg px-3 py-2">
                          <span style={{color: EDGE_COLORS[e.type]}}>&#8594;</span>
                          <span className="font-medium">{to?.name || e.to}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-muted-foreground/60 italic">Final step - nothing depends on this</p>}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

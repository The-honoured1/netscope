'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { Shield, Globe, Server, Lock, X, ExternalLink, MapPin } from 'lucide-react';
import { TagBadge } from '../ui/TagBadge';

const NODE_COLORS = {
  domain: '#3b82f6',
  ip: '#10b981',
  service: '#f59e0b',
  cert: '#a855f7'
};

export const IntelGraph = ({ data }: { data: any }) => {
  const graphRef = useRef<ForceGraphMethods>();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight - 64 // Adjust for header
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 64
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const color = NODE_COLORS[node.type as keyof typeof NODE_COLORS] || '#ffffff';
    const isSelected = selectedNode?.id === node.id;
    const isHovered = hoverNode?.id === node.id;
    
    const size = node.val || 10;
    
    // Draw Glow
    if (isSelected || isHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, (size / 1.5) * 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = `${color}22`;
      ctx.fill();
    }

    // Draw Main Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size / 1.5, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw Border
    ctx.strokeStyle = isSelected ? '#ffffff' : `${color}88`;
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.stroke();

    // Text Label
    if (globalScale >= 1.5 || isSelected || isHovered) {
      const label = node.label;
      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isSelected ? '#ffffff' : '#888888';
      ctx.fillText(label, node.x, node.y + size / 1.5 + 2);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden">
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#050505"
        nodeCanvasObject={paintNode}
        nodeLabel={(node: any) => node.label}
        linkColor={(link: any) => '#1a1a1a'}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        onNodeClick={(node) => setSelectedNode(node)}
        onNodeHover={(node) => setHoverNode(node)}
        cooldownTicks={100}
        onEngineStop={() => graphRef.current?.zoomToFit(400, 50)}
      />

      {/* Side Panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 w-96 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-right duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TagBadge variant={
                  selectedNode.type === 'domain' ? 'info' :
                  selectedNode.type === 'ip' ? 'success' :
                  selectedNode.type === 'service' ? 'warning' : 'default'
                }>
                  {selectedNode.type.toUpperCase()}
                </TagBadge>
              </div>
              <h2 className="text-xl font-bold text-white break-all">{selectedNode.label}</h2>
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {selectedNode.metadata && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Node Metadata</h3>
                <div className="grid gap-3">
                  {Object.entries(selectedNode.metadata).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <label className="text-[10px] text-zinc-600 block uppercase">{key}</label>
                      <div className="text-xs text-zinc-300 break-all">
                        {typeof value === 'object' ? JSON.stringify(value) : value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-3">
               {selectedNode.type === 'ip' && (
                 <a 
                   href={`/search?q=${selectedNode.label}`}
                   className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                 >
                   <Shield size={14} /> VIEW_FULL_INTEL
                 </a>
               )}
               <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all">
                  <Lock size={14} /> SCAN_NODE
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend Overlay */}
      <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md border border-zinc-900 rounded-lg p-4 z-40">
        <h4 className="text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-tighter">Network Legend</h4>
        <div className="space-y-2">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] uppercase text-zinc-400">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

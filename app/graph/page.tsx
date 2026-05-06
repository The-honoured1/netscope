import React from 'react';
import { IntelGraph } from '@/components/Graph/IntelGraph';
import { SearchBar } from '@/components/Search/SearchBar';
import { Shield, Share2, Download, Maximize2, Zap, Database } from 'lucide-react';
import Link from 'next/link';

async function getGraphData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graph`, { cache: 'no-store' });
  if (!res.ok) return { nodes: [], links: [] };
  return res.json();
}

export default async function GraphPage() {
  const graphData = await getGraphData();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-xl z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-black font-bold text-sm">NS</div>
              <span className="text-lg font-bold tracking-tighter text-white">NETSCOPE</span>
            </Link>
            <div className="h-6 w-px bg-zinc-800" />
            <nav className="flex gap-4 text-[10px] uppercase tracking-widest font-bold">
              <Link href="/search" className="text-zinc-500 hover:text-emerald-400 transition-colors">LIST_VIEW</Link>
              <span className="text-emerald-500 underline decoration-2 underline-offset-4">GRAPH_MODE</span>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-500 font-bold uppercase animate-pulse">
              <Zap size={12} /> ENGINE: LIVE_SIMULATION
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-zinc-900 rounded border border-zinc-800 text-zinc-500">
                <Share2 size={16} />
              </button>
              <button className="p-2 hover:bg-zinc-900 rounded border border-zinc-800 text-zinc-500">
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        <IntelGraph data={graphData} />
        
        {/* UI Overlays */}
        <div className="absolute top-6 left-6 z-40 space-y-4">
           <div className="bg-black/60 backdrop-blur-md border border-zinc-900 p-4 rounded-xl shadow-2xl w-64">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Database size={12} className="text-emerald-500" /> DATASET_ANALYSIS
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-[11px] text-zinc-400">TOTAL_NODES</span>
                   <span className="text-[11px] text-white font-bold">{graphData.nodes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[11px] text-zinc-400">RELATIONSHIPS</span>
                   <span className="text-[11px] text-white font-bold">{graphData.links.length}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[11px] text-zinc-400">COMPLEX_CLUSTERS</span>
                   <span className="text-[11px] text-emerald-500 font-bold">4</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-900">
                 <button className="w-full bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 py-2 rounded transition-colors uppercase font-bold tracking-widest">
                   Run_Graph_Optimization
                 </button>
              </div>
           </div>
        </div>

        {/* Global Search Bar Floating */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40">
           <SearchBar />
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer className="bg-black border-t border-zinc-900 px-6 py-2 flex justify-between items-center z-50">
        <div className="flex gap-6 text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            VULNERABILITY_INDEX: UPDATED
          </div>
          <div>GEO_LOOKUP: ENABLED</div>
          <div>SCAN_MODE: PASSIVE</div>
        </div>
        <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
          SYSTEM_TIME: {new Date().toISOString()}
        </div>
      </footer>
    </div>
  );
}

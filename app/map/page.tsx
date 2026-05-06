import React from 'react';
import { WorldMap } from '@/components/Map/WorldMap';
import { searchAssets } from '@/lib/searchEngine';
import Link from 'next/link';
import { Search, Database, Globe } from 'lucide-react';

export default async function MapPage() {
  const assets = await searchAssets();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-black font-bold">NS</div>
            <span className="text-xl font-bold tracking-tighter text-white group-hover:text-emerald-400 transition-colors">NETSCOPE</span>
          </Link>
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-zinc-500">
             <div className="flex items-center gap-2">
                <Link href="/search" className="p-1.5 hover:bg-zinc-900 rounded border border-zinc-800 text-zinc-500 hover:text-zinc-300">
                  <Database size={14} />
                </Link>
                <Link href="/map" className="p-1.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">
                  <Globe size={14} />
                </Link>
             </div>
             <div className="h-4 w-px bg-zinc-800" />
            <div className="flex flex-col items-end">
              <span className="text-emerald-500">STATUS: ACTIVE</span>
              <span>INDEX: LIVE_DISCOVERY</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <WorldMap assets={assets} />
        
        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md border border-zinc-900 rounded-lg p-4 z-40">
          <h4 className="text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-tighter">MAP LEGEND</h4>
          <div className="space-y-2">
             <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <span className="text-[10px] uppercase text-zinc-400">DISCOVERED NODE</span>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

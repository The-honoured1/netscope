import React from 'react';
import { WorldMapWrapper } from '@/components/Map/WorldMapWrapper';
import { searchAssets } from '@/lib/searchEngine';
import Link from 'next/link';
import { Search, Database, Globe } from 'lucide-react';

export default async function MapPage() {
  const assets = await searchAssets();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-black font-bold">NS</div>
            <span className="text-xl font-bold tracking-tighter text-white group-hover:text-emerald-400 transition-colors">NETSCOPE</span>
          </Link>
          <div className="flex items-center gap-4 md:gap-6 text-[10px] uppercase tracking-widest text-zinc-500 w-full sm:w-auto justify-between sm:justify-end">
             <div className="flex items-center gap-2">
                <Link href="/search" className="p-1.5 hover:bg-zinc-900 rounded border border-zinc-800 text-zinc-500 hover:text-zinc-300">
                  <Database size={14} />
                </Link>
                <Link href="/map" className="p-1.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">
                  <Globe size={14} />
                </Link>
             </div>
             <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
            <div className="flex flex-col items-end">
              <span className="text-emerald-500">STATUS: ACTIVE</span>
              <span className="hidden sm:inline">INDEX: LIVE_DISCOVERY</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <WorldMapWrapper assets={assets} />
      </main>
    </div>
  );
}

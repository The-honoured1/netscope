import React from 'react';
import { SearchBar } from '@/components/Search/SearchBar';
import { AssetCard } from '@/components/Asset/AssetCard';
import { searchAssets, getStats } from '@/lib/searchEngine';
import { Filter, Database, Globe, Shield, Activity, Share2 } from 'lucide-react';
import Link from 'next/link';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || '';
  const results = await searchAssets(query);
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-black font-bold">NS</div>
            <span className="text-xl font-bold tracking-tighter text-white group-hover:text-emerald-400 transition-colors">NETSCOPE</span>
          </Link>
          <div className="flex-1 max-w-2xl px-8">
            <SearchBar initialValue={query} />
          </div>
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-zinc-500">
            <div className="flex flex-col items-end">
              <span className="text-emerald-500">STATUS: ACTIVE</span>
              <span>INDEX: LIVE_DISCOVERY</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar Filters */}
        <aside className="w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="text-xs font-bold text-zinc-500 mb-4 flex items-center gap-2">
              <Filter size={14} /> FILTERS
            </h3>
            <div className="space-y-4">
              <section>
                <h4 className="text-[10px] text-zinc-600 mb-2">SERVER TYPE</h4>
                <div className="space-y-1">
                  {['Nginx', 'Apache', 'Cloudflare', 'LiteSpeed'].map(t => (
                    <label key={t} className="flex items-center gap-2 text-xs hover:text-emerald-400 cursor-pointer">
                      <input type="checkbox" className="rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/20" />
                      {t}
                    </label>
                  ))}
                </div>
              </section>
              <section>
                <h4 className="text-[10px] text-zinc-600 mb-2">PROTOCOL</h4>
                <div className="space-y-1">
                  {['HTTPS', 'HTTP', 'SSH', 'FTP'].map(t => (
                    <label key={t} className="flex items-center gap-2 text-xs hover:text-emerald-400 cursor-pointer">
                      <input type="checkbox" className="rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/20" />
                      {t}
                    </label>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/20">
            <h4 className="text-[10px] text-zinc-500 font-bold mb-4 uppercase flex items-center gap-2">
              <Activity size={12} className="text-emerald-500" /> RECENT_DISCOVERY
            </h4>
            <div className="space-y-4">
              {results.slice(0, 3).map((asset, i) => (
                <div key={i} className="text-[9px] border-l border-zinc-800 pl-2 py-0.5">
                  <div className="flex justify-between text-zinc-500">
                    <span>DISCOVERY</span>
                    <span>{asset.intelligence.serverType}</span>
                  </div>
                  <div className="text-emerald-500/80 truncate">{asset.ip}</div>
                </div>
              ))}
              {results.length === 0 && (
                <div className="text-[9px] text-zinc-600 italic">No recent activity</div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg border border-emerald-900/20 bg-emerald-950/5">
            <h4 className="text-[10px] text-emerald-500 font-bold mb-2">SYSTEM ANALYTICS</h4>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between">
                <span>TOTAL NODES</span>
                <span className="text-white">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span>COUNTRIES</span>
                <span className="text-white">{stats.countries}</span>
              </div>
              <div className="flex justify-between">
                <span>HIGH RISK</span>
                <span className="text-red-500">{stats.highRisk}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-zinc-500">Showing {results.length} results for <span className="text-white">"{query || 'all assets'}"</span></span>
              <div className="h-4 w-px bg-zinc-800" />
              <span className="text-emerald-500">SEARCH_TIME: 0.042s</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/graph" className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800 text-[10px] text-zinc-400 font-bold uppercase tracking-widest transition-all">
                <Share2 size={12} className="text-emerald-500" /> GRAPH_MODE
              </Link>
              <button className="p-1.5 hover:bg-zinc-900 rounded border border-zinc-800 text-zinc-500 hover:text-zinc-300">
                <Database size={14} />
              </button>
              <button className="p-1.5 hover:bg-zinc-900 rounded border border-zinc-800 text-zinc-500 hover:text-zinc-300">
                <Globe size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {results.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>

          {results.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <Shield size={48} className="mx-auto text-zinc-800" />
              <p className="text-zinc-600">No assets found matching the signature.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

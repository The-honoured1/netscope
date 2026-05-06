import React from 'react';
import { SearchBar } from '@/components/Search/SearchBar';
import { Shield, Database, Globe, Zap, Cpu, Lock } from 'lucide-react';
import { getStats } from '@/lib/searchEngine';
import Link from 'next/link';

export default async function LandingPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero.png" 
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-[0.03] mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
      </div>
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-black font-bold">NS</div>
          <span className="text-xl font-bold tracking-tighter text-white">NETSCOPE</span>
        </div>
        <nav className="flex gap-8 text-[10px] uppercase tracking-widest font-bold">
          <Link href="/search" className="text-zinc-500 hover:text-emerald-400 transition-colors">DATABASE</Link>
          <Link href="/map" className="text-zinc-500 hover:text-emerald-400 transition-colors">WORLD_MAP</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 -mt-20">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] text-emerald-500 font-bold tracking-tighter uppercase mb-4 animate-pulse">
            <Zap size={10} /> SYSTEM_STATUS: OPERATIONAL_V2.1
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
            NET<span className="text-emerald-500">SCOPE</span>
          </h1>
          <p className="max-w-xl mx-auto text-zinc-500 text-sm md:text-base leading-relaxed">
            The next-generation internet asset intelligence platform. 
            Real-time discovery, indexing, and enrichment of live global infrastructure.
          </p>
        </div>

        <SearchBar />

        <div className="mt-12 flex flex-wrap justify-center gap-4 text-[10px] text-zinc-600">
          <span>POPULAR: </span>
          {stats.tags.map(tag => (
            <Link key={tag} href={`/search?q=${tag}`} className="text-zinc-400 hover:text-emerald-500 transition-colors underline decoration-zinc-800">
              #{tag}
            </Link>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl w-full border-t border-zinc-900 pt-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-white tracking-tighter">{stats.total}</div>
            <div className="text-[10px] text-zinc-600 uppercase mt-1">Assets Indexed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-500 tracking-tighter">{stats.countries}</div>
            <div className="text-[10px] text-zinc-600 uppercase mt-1">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500 tracking-tighter">{stats.services}</div>
            <div className="text-[10px] text-zinc-600 uppercase mt-1">Services</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white tracking-tighter">LIVE</div>
            <div className="text-[10px] text-zinc-600 uppercase mt-1">Discovery</div>
          </div>
        </div>
      </main>

      {/* Footer Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-zinc-900 bg-black/50 backdrop-blur-sm z-10">
        <div className="p-8 border-r border-zinc-900 flex items-start gap-4">
          <Cpu className="text-emerald-500 shrink-0" size={24} />
          <div>
            <h4 className="text-xs font-bold text-white mb-1 uppercase">Automated Enrichment</h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed">Advanced header analysis and fingerprinting for every discovered node.</p>
          </div>
        </div>
        <div className="p-8 border-r border-zinc-900 flex items-start gap-4">
          <Globe className="text-emerald-500 shrink-0" size={24} />
          <div>
            <h4 className="text-xs font-bold text-white mb-1 uppercase">Relationship Mapping</h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed">Cluster assets based on SSL certificates, IP proximity, and DNS patterns.</p>
          </div>
        </div>
        <div className="p-8 flex items-start gap-4">
          <Shield className="text-emerald-500 shrink-0" size={24} />
          <div>
            <h4 className="text-xs font-bold text-white mb-1 uppercase">Threat Intelligence</h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed">Integrated risk scoring and malware signature detection at scale.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

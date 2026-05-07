import React from 'react';
import Link from 'next/link';
import { Database, Zap } from 'lucide-react';
import { SearchBar } from '@/components/Search/SearchBar';

async function getDomainRecords(domain: string) {
  try {
    const res = await fetch(`https://api.hackertarget.com/hostsearch/?q=${domain}`, { next: { revalidate: 3600 } });
    const text = await res.text();
    if (text.includes('error') || text.includes('API count exceeded')) {
      return [];
    }
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    return lines.map(line => {
      const [sub, ip] = line.split(',');
      return { sub, ip, type: 'A' };
    });
  } catch (e) {
    return [];
  }
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const records = await getDomainRecords(decodedName);

  // Extract unique subdomains for the sidebar
  const uniqueSubdomains = Array.from(new Set(records.map(r => r.sub)));

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <header className="relative px-4 md:px-8 py-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 z-50 border-b border-zinc-900/50 bg-black/20 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
           <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-black font-bold">NS</div>
           <span className="text-xl font-bold tracking-tighter text-white group-hover:text-emerald-400 transition-colors">NETSCOPE</span>
        </Link>
        <div className="w-full md:flex-1 md:max-w-2xl px-0 md:px-8 order-3 md:order-none">
           <SearchBar initialValue={decodedName} />
        </div>
        <nav className="flex gap-8 text-[10px] uppercase tracking-widest font-bold shrink-0">
          <Link href="/search" className="text-zinc-500 hover:text-emerald-400 transition-colors">DATABASE</Link>
          <Link href="/map" className="text-zinc-500 hover:text-emerald-400 transition-colors">WORLD_MAP</Link>
        </nav>
      </header>

      {/* Banner / Header */}
      <div className="w-full h-32 md:h-48 relative overflow-hidden flex items-end pb-0 border-b border-zinc-900/80 bg-zinc-950/50 z-10">
        <div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 relative z-10 flex items-center gap-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] text-emerald-500 font-bold tracking-tighter uppercase animate-pulse">
             <Zap size={10} /> LIVE_DATA
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none">{decodedName}</h1>
        </div>
      </div>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Domain Records */}
          <div className="flex-1 max-w-[850px] border border-zinc-900 bg-black/40 backdrop-blur-md p-6">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-900">
              <Database size={20} className="text-emerald-500" />
              <h2 className="text-lg font-bold text-white tracking-widest uppercase">DOMAIN_RECORDS</h2>
              <span className="ml-auto text-xs text-zinc-500 font-bold">COUNT: {records.length}</span>
            </div>
            
            <div className="space-y-0">
              {records.length > 0 ? records.map((rec, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap items-center py-3 border-b border-zinc-900/50 hover:bg-zinc-900/30 transition-colors px-2">
                  <div className="w-full md:flex-1 text-zinc-400 text-xs mb-2 md:mb-0 pr-4 truncate">{rec.sub}</div>
                  <div className="w-16 md:w-24 text-left md:text-center text-emerald-500 text-xs font-bold">{rec.type}</div>
                  <div className="w-auto md:w-48 text-right font-bold text-zinc-300 text-xs">{rec.ip}</div>
                </div>
              )) : (
                <div className="py-8 text-center text-zinc-500 text-xs uppercase tracking-widest">
                  No records found for {decodedName}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Subdomains */}
          <div className="w-full lg:w-80 shrink-0 border border-zinc-900 bg-black/40 backdrop-blur-md h-fit">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-900">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-500"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
                <h3 className="text-lg font-bold text-white tracking-widest uppercase">SUBDOMAINS</h3>
              </div>
              
              <ul className="space-y-3">
                {uniqueSubdomains.map((sub, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-zinc-500 text-xs hover:text-emerald-400 transition-colors cursor-pointer">
                    <span className="text-emerald-500/50 mt-0.5">•</span>
                    <span className="break-all leading-tight">{sub}</span>
                  </li>
                ))}
                {uniqueSubdomains.length === 0 && (
                  <li className="text-zinc-600 text-xs">No subdomains discovered.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

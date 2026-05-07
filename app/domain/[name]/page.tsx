import React from 'react';
import Link from 'next/link';
import { Search, Info, Database } from 'lucide-react';
import { SearchBar } from '@/components/Search/SearchBar';

// Mock data generator for the domain
const generateMockRecords = (domain: string) => {
  const prefixes = ['mail', 'vpn', 'stage', 'dev', 'test', 'www', 'api', 'auth', 'portal', 'secure', 'admin', 'git', 'ci', 'db'];
  const records = [];
  
  // For the exact screenshot look
  if (domain.toLowerCase() === 'deloitte.com') {
    return [
      { sub: '2exj7cfhl8yaywiy5rys.fts.dart', type: 'A', ip: '170.194.135.123' },
      { sub: '2exj7cfhl8yaywiy5rys.fts.dart', type: 'A', ip: '20.44.124.226' },
      { sub: '2floorsdown', type: 'A', ip: '167.219.18.101' },
      { sub: '2ndfloor', type: 'A', ip: '167.219.18.101' },
      { sub: '3di', type: 'A', ip: '34.232.226.35' },
      { sub: '3didigitaltracker', type: 'A', ip: '34.232.226.35' },
      { sub: '5glabs.pt.oneremotednet', type: 'A', ip: '148.69.121.136' },
      { sub: '7plus-pre.es', type: 'A', ip: '34.243.40.136' },
      { sub: '990capture.stage', type: 'A', ip: '167.219.19.33' },
      { sub: '990connect.stage', type: 'A', ip: '167.219.19.33' },
      { sub: 'a2c.axis', type: 'A', ip: '20.44.124.226' },
    ];
  }

  for (let i = 0; i < 20; i++) {
    const sub = prefixes[Math.floor(Math.random() * prefixes.length)] + (Math.random() > 0.5 ? Math.floor(Math.random() * 100) : '');
    records.push({
      sub: sub,
      type: 'A',
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    });
  }
  return records.sort((a, b) => a.sub.localeCompare(b.sub));
};

export default async function DomainPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const records = generateMockRecords(decodedName);

  // Extract unique subdomains for the sidebar
  const uniqueSubdomains = Array.from(new Set(records.map(r => r.sub)));

  return (
    <div className="min-h-screen bg-[#141414] text-zinc-300 font-sans selection:bg-orange-500/30">
      {/* Top Nav */}
      <header className="bg-[#222222] border-b border-[#333]">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
             <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-black font-bold">NS</div>
             <span className="text-xl font-bold tracking-tighter text-white group-hover:text-emerald-400 transition-colors">NETSCOPE</span>
          </Link>
          <div className="flex-1 max-w-2xl">
             <SearchBar initialValue={decodedName} />
          </div>
        </div>
      </header>

      {/* Banner / Header */}
      <div 
        className="w-full h-48 md:h-64 relative overflow-hidden flex items-end pb-0 border-b border-[#333]"
        style={{
          background: 'linear-gradient(135deg, #fbc531, #e1b12c, #f39c12, #e67e22)',
        }}
      >
        {/* Subtle Polygon background effect */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{
           backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 40px)'
        }}></div>
        <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
           backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 40px)'
        }}></div>
        
        <div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 relative z-10">
          <div className="bg-white inline-block px-4 py-2 md:px-6 md:py-3 mb-0 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <h1 className="text-3xl md:text-5xl font-extrabold text-black tracking-tight">{decodedName}</h1>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
        
        {/* Info Box */}
        <div className="bg-[#b3e5fc] border border-[#81d4fa] flex items-stretch mb-10 overflow-hidden max-w-[850px]">
          <div className="bg-[#29b6f6] w-16 flex items-center justify-center shrink-0">
            <Info size={32} className="text-white" />
          </div>
          <div className="p-4 md:p-5 flex items-center text-[#01579b] text-[15px] md:text-[17px]">
            <span><strong className="font-extrabold mr-1">Note:</strong> Only first 1,000 records shown. For full dataset check out our enterprise offering.</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Domain Records */}
          <div className="flex-1 max-w-[850px] border-t-2 border-orange-500 pt-6 bg-[#1a1a1a] px-6 pb-6 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <Database size={28} className="text-white opacity-90" />
              <h2 className="text-2xl font-light text-white tracking-wide"><span className="font-bold">Domain</span> Records</h2>
            </div>
            
            <div className="space-y-0">
              {records.map((rec, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap items-center py-4 border-b border-[#2a2a2a] hover:bg-[#222] transition-colors -mx-6 px-6">
                  <div className="w-full md:flex-1 text-[#aaa] font-sans text-[15px] mb-2 md:mb-0 pr-4">{rec.sub}</div>
                  <div className="w-16 md:w-24 text-left md:text-center text-[#777] font-sans text-[15px]">{rec.type}</div>
                  <div className="w-auto md:w-48 text-right font-bold text-white font-sans text-[15px]">{rec.ip}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Subdomains */}
          <div className="w-full lg:w-80 shrink-0 bg-[#222222] border-t-4 border-[#333] shadow-xl h-fit">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white opacity-90"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
                <h3 className="text-2xl font-bold text-white tracking-wide">Subdomains</h3>
              </div>
              
              <ul className="space-y-4">
                {uniqueSubdomains.map((sub, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[#aaa] text-[15px] hover:text-white transition-colors cursor-pointer">
                    <span className="text-[#555] mt-0.5 text-xs">•</span>
                    <span className="break-all leading-tight">{sub}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export const FilterControls = ({ 
  serverType, 
  protocol 
}: { 
  serverType?: string; 
  protocol?: string 
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <section>
        <h4 className="text-[10px] text-zinc-600 mb-2 uppercase tracking-tighter font-bold">Server Type</h4>
        <div className="space-y-1">
          {['Nginx', 'Apache', 'Cloudflare', 'LiteSpeed'].map(t => (
            <label key={t} className="flex items-center gap-2 text-[10px] hover:text-emerald-400 cursor-pointer transition-colors group">
              <div className="relative flex items-center justify-center w-3 h-3">
                <input 
                  type="checkbox" 
                  checked={serverType?.toLowerCase() === t.toLowerCase()}
                  onChange={() => handleFilterChange('serverType', t)}
                  className="peer appearance-none w-3 h-3 border border-zinc-800 bg-zinc-900 rounded-sm checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer" 
                />
                <svg className="absolute w-2 h-2 text-black opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="group-hover:translate-x-1 transition-transform">{t.toUpperCase()}</span>
            </label>
          ))}
        </div>
      </section>
      <section>
        <h4 className="text-[10px] text-zinc-600 mb-2 uppercase tracking-tighter font-bold">Protocol</h4>
        <div className="space-y-1">
          {['HTTPS', 'HTTP', 'SSH', 'FTP'].map(t => (
            <label key={t} className="flex items-center gap-2 text-[10px] hover:text-emerald-400 cursor-pointer transition-colors group">
              <div className="relative flex items-center justify-center w-3 h-3">
                <input 
                  type="checkbox" 
                  checked={protocol?.toLowerCase() === t.toLowerCase()}
                  onChange={() => handleFilterChange('protocol', t)}
                  className="peer appearance-none w-3 h-3 border border-zinc-800 bg-zinc-900 rounded-sm checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer" 
                />
                <svg className="absolute w-2 h-2 text-black opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="group-hover:translate-x-1 transition-transform">{t.toUpperCase()}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
};

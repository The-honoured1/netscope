import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Asset } from '@/types';
import { TagBadge } from '../ui/TagBadge';

export const AssetCard = ({ asset }: { asset: Asset }) => {
  if (!asset) return null;

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-sm flex flex-col md:flex-row overflow-hidden transition-all hover:border-zinc-700">
      {/* Left Column: Asset Info */}
      <div className="w-full md:w-64 p-4 border-b md:border-b-0 md:border-r border-zinc-800 flex-shrink-0 flex flex-col space-y-4 bg-zinc-950/50">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <Link href={`/asset/${asset.id}`} className="text-[#f44336] hover:text-red-400 text-lg font-bold font-mono transition-colors">
              {asset.ip}
            </Link>
            {asset.hostname && (
              <Link 
                href={`/search?q=hostname:${asset.hostname}`} 
                className="text-[10px] text-zinc-500 font-mono mt-1 break-words hover:text-emerald-500 hover:underline"
              >
                {asset.hostname}
              </Link>
            )}
            {asset.domain && (
              <Link 
                href={`/search?q=${asset.domain}`} 
                className="text-[10px] text-zinc-400 font-mono mt-1 break-words hover:text-emerald-500 hover:underline font-bold"
              >
                {asset.domain}
              </Link>
            )}
          </div>
          
          {asset.intelligence.riskScore !== undefined && (
            <div className="flex flex-col items-end">
              <div className={`text-xs font-black px-2 py-1 rounded-sm border ${
                asset.intelligence.riskScore > 75 ? 'bg-red-500/10 border-red-500 text-red-500' :
                asset.intelligence.riskScore > 40 ? 'bg-amber-500/10 border-amber-500 text-amber-500' :
                'bg-emerald-500/10 border-emerald-500 text-emerald-500'
              }`}>
                {asset.intelligence.riskScore}
              </div>
              <span className="text-[7px] text-zinc-600 mt-1 uppercase font-bold tracking-widest">RISK_INDEX</span>
            </div>
          )}
        </div>
        
        <div className="text-xs font-mono space-y-1 pt-2 border-t border-zinc-800/50">
          <Link href={`/search?q=org:${encodeURIComponent(asset.isp || '')}`} className="font-bold text-zinc-300 hover:text-emerald-400 block">
            {asset.isp}
          </Link>
          {asset.asn && (
            <Link href={`/search?q=asn:${asset.asn}`} className="text-zinc-500 hover:text-zinc-300 block">
              {asset.asn}
            </Link>
          )}
        </div>

        <div className="text-xs font-mono space-y-1 flex flex-col">
          <span className="text-zinc-500 text-[10px] uppercase">Location</span>
          <Link href={`/search?q=country:${asset.location.countryCode}`} className="text-zinc-300 flex items-center gap-2 hover:text-white group">
            {asset.location.countryCode && (
              <img 
                src={`https://flagcdn.com/16x12/${asset.location.countryCode.toLowerCase()}.png`} 
                alt={asset.location.countryCode}
                className="opacity-80 group-hover:opacity-100"
              />
            )}
            {asset.location.city}, {asset.location.country}
          </Link>
        </div>

        {asset.services.length > 0 && (
          <div className="pt-2 border-t border-zinc-800">
            <div className="text-zinc-500 text-[10px] uppercase font-mono mb-2">Open Ports</div>
            <div className="flex flex-wrap gap-1">
              {asset.services.map(s => (
                <span key={s.port} className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 text-[10px] font-mono rounded-sm">
                  {s.port}
                </span>
              ))}
            </div>
          </div>
        )}

        {asset.intelligence.tags.length > 0 && (
          <div className="pt-2 border-t border-zinc-800">
            <div className="flex flex-wrap gap-1.5 mt-2">
              {asset.intelligence.tags.map(tag => (
                <TagBadge key={tag} variant={
                  tag === 'malicious' ? 'danger' : 
                  tag === 'outdated' ? 'warning' : 
                  tag === 'secure' ? 'success' : 'default'
                }>
                  {tag}
                </TagBadge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Services Detail */}
      <div className="flex-1 p-0 flex flex-col divide-y divide-zinc-800/50">
        {asset.services.map((service, idx) => (
          <div key={`${service.port}-${idx}`} className="p-4 flex flex-col md:flex-row gap-4 hover:bg-zinc-800/10 transition-colors">
            {/* Port number and protocol */}
            <div className="w-24 flex-shrink-0 flex flex-col">
              <div className="text-xl font-mono text-zinc-200">{service.port}</div>
              <div className="text-[10px] font-bold font-mono text-zinc-500 uppercase">{service.protocol}</div>
              {service.name && <div className="text-[10px] font-mono text-zinc-400 mt-1">{service.name}</div>}
            </div>
            
            {/* Banner/Data */}
            <div className="flex-1 min-w-0 overflow-x-auto">
              {service.headers && Object.keys(service.headers).length > 0 && (
                <div className="mb-3 space-y-0.5">
                  {Object.entries(service.headers).map(([k, v]) => (
                    <div key={k} className="text-[11px] font-mono whitespace-nowrap">
                      <span className="text-zinc-500">{k}:</span> <span className="text-zinc-300 ml-1">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {service.banner && (
                <pre className="text-[10px] leading-relaxed font-mono text-zinc-400 bg-black/40 border border-zinc-800/50 p-3 rounded-sm overflow-x-auto whitespace-pre-wrap">
                  {service.banner}
                </pre>
              )}
              
              {/* SSL Certificate Detail */}
              {(service.port === 443 || service.protocol === 'https') && asset.certificate && (
                <div className="mt-4 text-[11px] font-mono bg-zinc-900/40 border border-zinc-800 p-3 rounded-sm">
                  <div className="font-bold text-zinc-300 mb-3 flex items-center gap-2">
                    <Shield size={12} className="text-emerald-500" /> SSL Certificate
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <div className="text-zinc-500 text-[9px] uppercase tracking-wider mb-0.5">Issuer</div>
                      <div className="text-zinc-300 truncate" title={asset.certificate.issuer}>{asset.certificate.issuer || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[9px] uppercase tracking-wider mb-0.5">Subject</div>
                      <div className="text-zinc-300 truncate" title={asset.certificate.subject}>{asset.certificate.subject || 'N/A'}</div>
                    </div>
                    {asset.certificate.validFrom && (
                      <div>
                        <div className="text-zinc-500 text-[9px] uppercase tracking-wider mb-0.5">Valid From</div>
                        <div className="text-zinc-300">{asset.certificate.validFrom}</div>
                      </div>
                    )}
                    {asset.certificate.validTo && (
                      <div>
                        <div className="text-zinc-500 text-[9px] uppercase tracking-wider mb-0.5">Valid To</div>
                        <div className="text-zinc-300">{asset.certificate.validTo}</div>
                      </div>
                    )}
                    {asset.certificate.serialNumber && (
                      <div className="sm:col-span-2">
                        <div className="text-zinc-500 text-[9px] uppercase tracking-wider mb-0.5">Serial Number</div>
                        <div className="text-zinc-300 break-all">{asset.certificate.serialNumber}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {asset.services.length === 0 && (
          <div className="p-4 text-xs font-mono text-zinc-500">
            No active services mapped.
          </div>
        )}
      </div>
    </div>
  );
};

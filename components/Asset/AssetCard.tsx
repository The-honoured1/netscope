import React from 'react';
import Link from 'next/link';
import { Shield, Globe, Server, MapPin, Activity } from 'lucide-react';
import { Asset } from '@/types';
import { TagBadge } from '../ui/TagBadge';

export const AssetCard = ({ asset }: { asset: Asset }) => {
    if (!asset) return null;

  return (
    <Link href={`/asset/${asset.id}`} className="block group">
      <div className="bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 p-4 rounded-lg transition-all hover:bg-zinc-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1 h-full bg-zinc-800 group-hover:bg-emerald-500 transition-colors" />
        
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-zinc-100 font-mono font-bold text-lg group-hover:text-emerald-400 transition-colors flex items-center gap-2">
              {asset.ip}
              <span className="text-[10px] text-zinc-600 font-normal">[{asset.id}]</span>
            </h3>
            <p className="text-zinc-500 text-xs font-mono truncate max-w-xs">
              {asset.hostname || 'no-hostname.ptr'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-zinc-400">
              CLUSTER ID
            </div>
            <div className="text-[10px] text-zinc-600 font-mono">
              {asset.asn}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-mono">
              <Globe size={12} className="text-zinc-600" />
              <span>{asset.isp}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-mono">
              <MapPin size={12} className="text-zinc-600" />
              <span>{asset.location.city}, {asset.location.countryCode}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-mono">
              <Server size={12} className="text-zinc-600" />
              <span>{asset.intelligence.serverType || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-mono">
              <Activity size={12} className="text-zinc-600" />
              <span>{asset.services.length} ports open</span>
            </div>
          </div>
        </div>

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
    </Link>
  );
};

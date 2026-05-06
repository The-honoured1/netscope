import React from 'react';
import { getAssetById, searchAssets } from '@/lib/searchEngine';
import { TagBadge } from '@/components/ui/TagBadge';
import { 
  Shield, 
  Globe, 
  Server, 
  MapPin, 
  Activity, 
  Lock, 
  Unlock, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Database,
  Search,
  Cpu,
  Hash
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) {
    notFound();
  }

  const allAssets = await searchAssets();
  const relatedAssets = asset.relatedAssetIds
    .map(id => allAssets.find(a => a.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-300 font-mono selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/search" className="text-zinc-500 hover:text-white transition-colors">
              <Search size={20} />
            </Link>
            <div className="h-6 w-px bg-zinc-800" />
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-3">
                {asset.ip}
                <TagBadge variant={asset.intelligence.riskScore > 70 ? 'danger' : 'success'}>
                  RISK: {asset.intelligence.riskScore}
                </TagBadge>
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                ASSET_INTEL_ID: {asset.id}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
             <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold rounded flex items-center gap-2 transition-all">
                <Database size={14} /> EXPORT_DATA
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Metadata & Intelligence */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                  <Globe size={14} /> NETWORK_IDENTITY
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-zinc-600 block">HOSTNAME</label>
                    <span className="text-sm text-zinc-200">{asset.hostname || 'N/A'}</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-600 block">DOMAIN</label>
                    <span className="text-sm text-zinc-200">{asset.domain || 'N/A'}</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-600 block">ISP / PROVIDER</label>
                    <span className="text-sm text-emerald-500">{asset.isp}</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-600 block">ASN</label>
                    <span className="text-sm text-zinc-200">{asset.asn}</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                  <MapPin size={14} /> GEOLOCATION
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-zinc-600 block">COUNTRY</label>
                    <span className="text-sm text-zinc-200">{asset.location.country} ({asset.location.countryCode})</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-600 block">CITY</label>
                    <span className="text-sm text-zinc-200">{asset.location.city}</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-600 block">COORDINATES</label>
                    <span className="text-sm text-zinc-200 font-mono">{asset.location.latitude}, {asset.location.longitude}</span>
                  </div>
                  <div className="pt-2">
                    <div className="w-full h-24 bg-zinc-800 rounded-lg overflow-hidden relative">
                      <div className="absolute inset-0 cyber-grid opacity-20" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Activity size={24} className="text-emerald-500 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Intelligence & Tags */}
            <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-xl">
              <h3 className="text-xs font-bold text-zinc-500 mb-6 flex items-center gap-2">
                <Shield size={14} /> INTELLIGENCE_ENRICHMENT
              </h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {asset.intelligence.tags.map(tag => (
                  <TagBadge key={tag} className="text-xs px-3 py-1" variant={
                    tag === 'malicious' ? 'danger' : 
                    tag === 'outdated' ? 'warning' : 
                    tag === 'secure' ? 'success' : 'default'
                  }>
                    {tag}
                  </TagBadge>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border border-zinc-800 rounded-lg bg-black/20">
                  <Cpu size={20} className="mx-auto mb-2 text-zinc-500" />
                  <div className="text-[10px] text-zinc-600">OS_DETECTION</div>
                  <div className="text-xs font-bold text-zinc-200">{asset.intelligence.os || 'UNKNOWN'}</div>
                </div>
                <div className="text-center p-4 border border-zinc-800 rounded-lg bg-black/20">
                  <Server size={20} className="mx-auto mb-2 text-zinc-500" />
                  <div className="text-[10px] text-zinc-600">SERVER_ENGINE</div>
                  <div className="text-xs font-bold text-zinc-200">{asset.intelligence.serverType || 'GENERIC'}</div>
                </div>
                <div className="text-center p-4 border border-zinc-800 rounded-lg bg-black/20">
                  <Hash size={20} className="mx-auto mb-2 text-zinc-500" />
                  <div className="text-[10px] text-zinc-600">CLUSTER_ID</div>
                  <div className="text-xs font-bold text-zinc-200">#{asset.intelligence.clusterId || asset.ip.split('.').slice(0, 2).join('-')}</div>
                </div>
              </div>
            </div>

            {/* Services / Ports */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                <Activity size={14} /> EXPOSED_SERVICES ({asset.services.length})
              </h3>
              <div className="space-y-4">
                {asset.services.map((service, idx) => (
                  <div key={idx} className="bg-black border border-zinc-800 rounded-lg overflow-hidden">
                    <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-500 font-bold">{service.port}/{service.protocol.toUpperCase()}</span>
                        <span className="text-[10px] text-zinc-500">{service.name}</span>
                      </div>
                      <span className="text-[10px] text-zinc-600">LAST_SCAN: {new Date(service.lastSeen).toLocaleString()}</span>
                    </div>
                    {service.headers && (
                      <div className="p-4 bg-zinc-950/50">
                        <pre className="text-[11px] text-zinc-400 overflow-x-auto">
                          {Object.entries(service.headers).map(([k, v]) => (
                            <div key={k}><span className="text-zinc-600 font-bold">{k}:</span> {v}</div>
                          ))}
                        </pre>
                      </div>
                    )}
                    {service.banner && (
                      <div className="p-4 border-t border-zinc-900 bg-zinc-950/20 font-mono text-[11px] text-emerald-500/80 italic">
                        "{service.banner}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Certificates & Relationships */}
          <div className="space-y-8">
            
            {/* SSL/TLS Details */}
            {asset.certificate ? (
              <div className="bg-emerald-950/5 border border-emerald-900/20 p-6 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-emerald-500 flex items-center gap-2">
                  <Lock size={14} /> CERTIFICATE_DATA
                </h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] text-emerald-900 block font-bold">ISSUER</label>
                    <p className="text-emerald-200">{asset.certificate.issuer}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-emerald-900 block font-bold">SUBJECT</label>
                    <p className="text-emerald-200">{asset.certificate.subject}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-emerald-900 block font-bold">VALID_FROM</label>
                      <p className="text-zinc-400">{asset.certificate.validFrom}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-emerald-900 block font-bold">VALID_TO</label>
                      <p className="text-zinc-400">{asset.certificate.validTo}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-emerald-900 block font-bold">FINGERPRINT (SHA256)</label>
                    <p className="text-[10px] text-zinc-500 break-all">{asset.certificate.fingerprint}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-950/5 border border-red-900/20 p-6 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-red-500 flex items-center gap-2">
                  <Unlock size={14} /> ENCRYPTION_WARNING
                </h3>
                <p className="text-xs text-red-300/70">No valid SSL/TLS certificates detected for this asset. Traffic may be unencrypted.</p>
              </div>
            )}

            {/* Related Assets (Graph Cluster) */}
            <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-xl">
              <h3 className="text-xs font-bold text-zinc-500 mb-4 flex items-center gap-2">
                <ChevronRight size={14} /> RELATED_INFRASTRUCTURE
              </h3>
              <div className="space-y-3">
                {relatedAssets.length > 0 ? (
                  relatedAssets.map((rel: any) => (
                    <Link key={rel.id} href={`/asset/${rel.id}`} className="block p-3 border border-zinc-800 rounded hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-300 group-hover:text-emerald-400 font-bold">{rel.ip}</span>
                        <TagBadge className="text-[8px]">{rel.intelligence.serverType}</TagBadge>
                      </div>
                      <div className="text-[10px] text-zinc-600 mt-1 truncate">{rel.hostname || 'unnamed-node'}</div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[10px] text-zinc-600">NO CORRELATED ASSETS FOUND</p>
                  </div>
                )}
              </div>
            </div>

            {/* History / Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                <Clock size={14} /> SCAN_HISTORY
              </h3>
              <div className="relative pl-4 space-y-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-zinc-800">
                <div className="relative">
                  <div className="absolute -left-[18px] top-1 w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="text-[10px] text-zinc-500">2024-05-06 14:22:11</div>
                  <div className="text-xs text-zinc-300">New service detected: Port 443</div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[18px] top-1 w-2 h-2 rounded-full bg-zinc-700" />
                  <div className="text-[10px] text-zinc-500">2024-05-01 09:00:45</div>
                  <div className="text-xs text-zinc-300">Initial index created</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

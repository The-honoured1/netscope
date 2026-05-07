'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Asset } from '@/types';
import { useRouter } from 'next/navigation';
import { Shield, Server, Activity, Search, Layers, Crosshair, Zap, AlertTriangle, Eye, Wifi, Thermometer, Globe, Cloud, Database, Cpu, MessageSquare, Terminal, Download, Flame, Map as MapIcon } from 'lucide-react';

// Custom icons for different node types
// Custom icons for different node types based on risk
const getIcon = (asset: Asset) => {
  const risk = asset.intelligence.riskScore || 0;
  let color = '#10b981'; // Stable (Green)
  if (risk > 70) color = '#ef4444'; // Critical (Red)
  else if (risk > 30) color = '#f59e0b'; // Elevated (Amber)

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class='node-marker' style='background-color: ${color}; box-shadow: 0 0 10px ${color}, inset 0 0 4px #fff;'></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const MAP_TILES = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
};

export const WorldMap = ({ assets }: { assets: Asset[] }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'scada' | 'iot' | 'malware' | 'vulnerable'>('all');
  const [tileType, setTileType] = useState<'dark' | 'satellite' | 'voyager'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [minRisk, setMinRisk] = useState(0);

  // Real-time Threat Feed State removed as per request

  const getRiskFactors = (asset: Asset) => {
    const factors = [];
    if (asset.intelligence.tags.includes('expired-ssl')) factors.push('EXPIRED_SSL_CERT');
    if (asset.intelligence.tags.includes('unencrypted-http')) factors.push('PLAIN_HTTP_EXPOSED');
    if (asset.intelligence.tags.includes('ssh-exposed')) factors.push('SSH_PORT_OPEN');
    if (asset.intelligence.tags.includes('vulnerable')) factors.push('KNOWN_CVE_DETECTED');
    return factors.length > 0 ? factors : ['NO_CRITICAL_EXPOSURE'];
  };

  const exportGeoJSON = () => {
    const data = {
      type: "FeatureCollection",
      features: filteredAssets.slice(0, 100).map(a => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [a.location.longitude, a.location.latitude] },
        properties: { ip: a.ip, tags: a.intelligence.tags }
      }))
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `netscope_export_${Date.now()}.json`;
    link.click();
  };

  // Advanced Filtering logic
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // 1. Risk Filter
      if ((asset.intelligence.riskScore || 0) < minRisk) return false;

      // 2. Tab Filter
      const matchesTab = activeTab === 'all' || asset.intelligence.tags.includes(activeTab);
      if (!matchesTab) return false;

      // 3. Advanced Search Filter
      if (!searchQuery) return true;

      const normalizedQuery = searchQuery.toLowerCase().trim();
      const tokens = normalizedQuery.split(/\s+/);
      
      // If no advanced filters, do broad search
      if (!tokens.some(t => t.includes(':'))) {
        return (
          asset.ip.includes(normalizedQuery) ||
          asset.hostname?.toLowerCase().includes(normalizedQuery) ||
          asset.domain?.toLowerCase().includes(normalizedQuery) ||
          asset.isp?.toLowerCase().includes(normalizedQuery) ||
          asset.intelligence.tags.some(t => t.toLowerCase().includes(normalizedQuery)) ||
          asset.intelligence.serverType?.toLowerCase().includes(normalizedQuery)
        );
      }

      // Advanced filters in map search
      for (const token of tokens) {
        if (token.includes(':')) {
          const [key, value] = token.split(':');
          const val = value.toLowerCase();
          switch (key) {
            case 'ip': if (!asset.ip.includes(val)) return false; break;
            case 'port': if (!asset.services.some(s => s.port.toString() === val)) return false; break;
            case 'country': if (asset.location.countryCode.toLowerCase() !== val) return false; break;
            case 'asn': if (!asset.asn?.toLowerCase().includes(val)) return false; break;
            case 'org': if (!asset.isp?.toLowerCase().includes(val)) return false; break;
            case 'product': if (!asset.intelligence.serverType?.toLowerCase().includes(val)) return false; break;
            case 'service': if (!asset.services.some(s => s.name?.toLowerCase().includes(val))) return false; break;
            case 'os': if (!asset.intelligence.os?.toLowerCase().includes(val)) return false; break;
            case 'cve': if (!asset.intelligence.cves?.some(c => c.toLowerCase().includes(val))) return false; break;
            case 'issuer': if (!asset.certificate?.issuer?.toLowerCase().includes(val)) return false; break;
            case 'tag': if (!asset.intelligence.tags.some(t => t.toLowerCase().includes(val))) return false; break;
            case 'protocol': if (!asset.services.some(s => s.protocol.toLowerCase() === val)) return false; break;
            case 'risk': if ((asset.intelligence.riskScore || 0) < parseInt(val)) return false; break;
          }
        }
      }

      return true;
    });
  }, [assets, searchQuery, activeTab, minRisk]);

  // Compute networking lines connecting related assets
  const networkLinks = useMemo(() => {
    const links: [number, number][][] = [];
    const maxLinks = 60;
    const activeAssets = filteredAssets.slice(0, 40);
    
    for (let i = 0; i < activeAssets.length; i++) {
      if (links.length >= maxLinks) break;
      const current = activeAssets[i];
      for (let j = i + 1; j < activeAssets.length; j++) {
        const target = activeAssets[j];
        if (current.asn === target.asn && current.asn !== 'Unknown') {
          links.push([
            [current.location.latitude, current.location.longitude],
            [target.location.latitude, target.location.longitude]
          ]);
        }
      }
    }
    return links;
  }, [filteredAssets]);

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-[#050505] relative z-0 flex overflow-hidden font-mono">
      
      {/* Advanced Map Sidebar */}
      <div className="w-80 h-full bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-900 z-[1000] p-4 flex flex-col gap-6 overflow-y-auto relative">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-between">
              <span className="flex items-center gap-2"><Shield size={12} /> Risk_Threshold</span>
              <span className="text-emerald-500">{minRisk}+</span>
            </h4>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5"
              value={minRisk}
              onChange={(e) => setMinRisk(parseInt(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH_MAP_INDEX..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-sm py-2 pl-9 pr-4 text-[10px] text-white focus:outline-none focus:border-emerald-500 transition-colors uppercase font-bold"
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Layers size={12} /> Visualization_Engine
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex items-center justify-center gap-2 py-2 text-[8px] border transition-all uppercase font-bold ${showHeatmap ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
              >
                <Flame size={10} /> {showHeatmap ? 'HIDE_HEATMAP' : 'SHOW_HEATMAP'}
              </button>
              <button 
                onClick={exportGeoJSON}
                className="flex items-center justify-center gap-2 py-2 text-[8px] border border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-white transition-all uppercase font-bold"
              >
                <Download size={10} /> EXPORT_GEOJSON
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <MapIcon size={12} /> Map_Tiles
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {(['dark', 'satellite', 'voyager'] as const).map(type => (
                <button 
                  key={type}
                  onClick={() => setTileType(type)}
                  className={`py-2 text-[8px] border transition-all uppercase font-bold ${tileType === type ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Crosshair size={12} /> Filter_Intelligence
            </h4>
            <div className="flex flex-col gap-1">
              {[
                { id: 'all', icon: Globe, label: 'GLOBAL_VIEW' },
                { id: 'scada', icon: Thermometer, label: 'SCADA_SYSTEMS' },
                { id: 'iot', icon: Wifi, label: 'IOT_DEVICES' },
                { id: 'malware', icon: Zap, label: 'MALWARE_C2' },
                { id: 'vulnerable', icon: AlertTriangle, label: 'EXPOSED_CVES' },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSelectedAsset(null); }}
                  className={`flex items-center gap-3 px-3 py-2 text-[9px] border rounded-sm transition-all uppercase font-bold ${activeTab === tab.id ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-black border-zinc-900 text-zinc-400 hover:border-zinc-700'}`}
                >
                  <tab.icon size={12} />
                  {tab.label}
                  <span className="ml-auto opacity-50">{assets.filter(a => tab.id === 'all' || a.intelligence.tags.includes(tab.id)).length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* Selected Host Panel */}
        {selectedAsset ? (
          <div className="mt-auto border-t border-zinc-900 pt-4 animate-in slide-in-from-bottom duration-300">
             <div className="bg-zinc-900/50 border border-emerald-500/20 p-4 rounded-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-emerald-500 font-bold text-xs">{selectedAsset.ip}</div>
                  <button onClick={() => { setSelectedAsset(null); setAiSummary(null); }} className="text-zinc-600 hover:text-white">×</button>
                </div>
                
                <div className="space-y-1 text-[9px]">
                  <div className="flex justify-between border-b border-zinc-800/30 pb-1">
                    <span className="text-zinc-600 uppercase">RISK_LEVEL</span>
                    <span className={`${selectedAsset.intelligence.riskScore! > 50 ? 'text-red-500' : 'text-emerald-500'} font-bold uppercase`}>
                      {selectedAsset.intelligence.riskScore! > 50 ? 'CRITICAL' : 'STABLE'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800/30 pb-1">
                    <span className="text-zinc-600 uppercase">LOCATION</span>
                    <span className="text-zinc-300">{selectedAsset.location.countryCode}</span>
                  </div>
                </div>

                <div className="bg-black/50 border border-zinc-800 p-3 rounded-sm space-y-4 overflow-hidden">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-black">
                    <Cpu size={12} className="text-emerald-500" /> Host_Detailed_Intel
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <div className="text-[8px] text-zinc-600 uppercase font-bold">Organization</div>
                      <div className="text-zinc-200 text-[10px] truncate">{selectedAsset.isp || 'Unknown'}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="text-[8px] text-zinc-600 uppercase font-bold">ASN</div>
                        <div className="text-emerald-500 text-[10px] font-bold">{selectedAsset.asn}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[8px] text-zinc-600 uppercase font-bold">Cloud</div>
                        <div className="text-zinc-300 text-[10px]">{selectedAsset.intelligence.cloudProvider || 'On-Prem'}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[8px] text-zinc-600 uppercase font-bold">SSL_Issuer</div>
                      <div className="text-zinc-400 text-[8px] truncate bg-zinc-900/50 p-1 border border-zinc-800/50">
                        {selectedAsset.certificate?.issuer || 'NO_SSL_CERT'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[8px] text-zinc-600 uppercase font-bold">Risk_Factors</div>
                      <div className="flex flex-wrap gap-1">
                        {getRiskFactors(selectedAsset).map(f => (
                          <span key={f} className={`px-1.5 py-0.5 rounded-sm text-[7px] font-bold border ${f === 'NO_CRITICAL_EXPOSURE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[8px] text-zinc-600 uppercase font-bold">Exposed_CVEs</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedAsset.intelligence.cves && selectedAsset.intelligence.cves.length > 0 ? (
                          selectedAsset.intelligence.cves.map(cve => (
                            <span key={cve} className="bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-sm text-[8px] font-bold border border-red-500/20">{cve}</span>
                          ))
                        ) : (
                          <span className="text-zinc-600 text-[8px]">NONE_DETECTED</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[8px] text-zinc-600 uppercase font-bold">Active_Infrastructure</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedAsset.services.map(s => (
                          <div key={s.port} className="flex flex-col bg-zinc-900 p-1.5 border border-zinc-800 rounded-sm min-w-[60px]">
                            <span className="text-amber-500 text-[9px] font-black">{s.port}/{s.protocol}</span>
                            <span className="text-zinc-500 text-[7px] uppercase truncate">{s.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => router.push(`/asset/${selectedAsset.id}`)}
                  className="w-full bg-emerald-500 py-2 text-black text-[9px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                >
                  <Terminal size={12} /> DEEP_REPORT
                </button>
             </div>
          </div>
        ) : (
          <div className="mt-auto text-center py-4 opacity-20 grayscale">
            <Eye size={24} className="mx-auto mb-2" />
            <p className="text-[8px] uppercase font-bold tracking-widest text-zinc-500">Select a node for deep forensics</p>
          </div>
        )}
      </div>

      {/* Map Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Realtime Scanning Overlay */}
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden opacity-5">
           <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500 animate-scan shadow-[0_0_20px_#10b981]" />
        </div>

        <MapContainer 
          center={[20, 0]} 
          zoom={3} 
          style={{ height: '100%', width: '100%', background: '#050505' }}
          minZoom={2}
          maxZoom={18}
        >
          <TileLayer
            url={MAP_TILES[tileType]}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Animated Networking Lines */}
          {networkLinks.map((positions, idx) => (
            <Polyline 
              key={`line-${idx}`}
              positions={positions} 
              pathOptions={{ 
                color: '#10b981', 
                weight: 1, 
                opacity: 0.15, 
                className: 'animated-data-line' 
              }} 
            />
          ))}

          {filteredAssets.slice(0, 800).map((asset) => (
            <React.Fragment key={asset.id}>
              {/* Heatmap-style effect or standard pulsing rings */}
              {(showHeatmap || asset.intelligence.riskScore! > 70 || selectedAsset?.id === asset.id) && (
                <CircleMarker
                  center={[asset.location.latitude, asset.location.longitude]}
                  pathOptions={{ 
                    color: asset.intelligence.riskScore! > 70 ? '#ef4444' : (showHeatmap ? '#f97316' : '#10b981'), 
                    fillOpacity: showHeatmap ? 0.05 : 0.1, 
                    weight: 1 
                  }}
                  radius={showHeatmap ? 40 : (selectedAsset?.id === asset.id ? 25 : 15)}
                  className="pulse-signal"
                />
              )}
              
              <Marker 
                position={[asset.location.latitude, asset.location.longitude]} 
                icon={getIcon(asset)}
                eventHandlers={{
                  click: () => { setSelectedAsset(asset); }
                }}
              >
                <Popup className="netscope-popup" minWidth={240}>
                    <div className="bg-zinc-950 p-4 text-[10px] font-mono border border-zinc-800 shadow-2xl min-w-[300px]">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-800">
                        <span className="text-emerald-500 font-black text-xs">{asset.ip}</span>
                        <span className={`px-2 py-0.5 rounded-sm font-black text-[9px] ${
                          (asset.intelligence.riskScore || 0) > 70 ? 'bg-red-500 text-black' : 
                          (asset.intelligence.riskScore || 0) > 30 ? 'bg-amber-500 text-black' : 
                          'bg-emerald-500 text-black'
                        }`}>
                          RISK_{asset.intelligence.riskScore || 0}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-zinc-400">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-zinc-600 font-black uppercase">Hostname</span>
                          <span className="truncate text-zinc-200">{asset.hostname || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-zinc-600 font-black uppercase">Country</span>
                          <span className="text-zinc-200">{asset.location.countryCode} ({asset.location.country})</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-zinc-600 font-black uppercase">ASN</span>
                          <span className="text-emerald-400 font-bold">{asset.asn || 'Unknown'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-zinc-600 font-black uppercase">Organization</span>
                          <span className="truncate text-zinc-200">{asset.isp || 'Unknown'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-zinc-600 font-black uppercase">Product</span>
                          <span className="text-zinc-200">{asset.intelligence.serverType || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-zinc-600 font-black uppercase">OS</span>
                          <span className="text-zinc-200">{asset.intelligence.os || 'Unknown'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-zinc-600 font-black uppercase">Cloud_Provider</span>
                          <span className="text-zinc-200">{asset.intelligence.cloudProvider || 'On-Prem'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-zinc-600 font-black uppercase">SSL_Issuer</span>
                          <span className="truncate text-zinc-200 text-[8px]">{asset.certificate?.issuer || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-zinc-900">
                        <div className="text-[8px] text-zinc-600 font-black uppercase mb-1">Services_&_Protocols</div>
                        <div className="flex flex-wrap gap-1">
                          {asset.services.map(s => (
                            <span key={s.port} className="bg-zinc-900 border border-zinc-800 text-amber-500 px-1.5 py-0.5 rounded-sm text-[8px]">
                              {s.port}/{s.protocol} ({s.name})
                            </span>
                          ))}
                        </div>
                      </div>

                      {asset.intelligence.cves && asset.intelligence.cves.length > 0 && (
                        <div className="mt-2">
                          <div className="text-[8px] text-zinc-600 font-black uppercase mb-1">CVE_EXPOSURE</div>
                          <div className="flex flex-wrap gap-1">
                            {asset.intelligence.cves.slice(0, 3).map(cve => (
                              <span key={cve} className="bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-sm text-[8px] font-bold border border-red-500/20">
                                {cve}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-2">
                        <div className="text-[8px] text-zinc-600 font-black uppercase mb-1">Tags</div>
                        <div className="flex flex-wrap gap-1">
                          {asset.intelligence.tags.map(tag => (
                            <span key={tag} className="text-zinc-500 text-[8px] uppercase font-bold">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

        </MapContainer>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container { background: #050505 !important; }
        .leaflet-popup-content-wrapper { background: #000; border: 1px solid #27272a; padding: 0; border-radius: 0; box-shadow: 0 10px 50px rgba(0,0,0,1); }
        .leaflet-popup-tip { background: #27272a; }
        .leaflet-control-zoom a { background: rgba(0,0,0,0.8) !important; color: #10b981 !important; border-color: #27272a !important; font-size: 10px; }
        
        .node-marker {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #050505;
          animation: pulse-ring 2.5s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
          cursor: crosshair;
          transition: all 0.3s ease;
        }

        .node-marker:hover {
          transform: scale(1.5);
          animation: none;
          z-index: 1000;
        }

        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
          70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .pulse-signal {
          animation: pulse-signal-anim 2s infinite ease-out;
        }

        @keyframes pulse-signal-anim {
          0% { r: 5; opacity: 0.8; }
          100% { r: 40; opacity: 0; }
        }

        .pulse-signal-threat {
          animation: pulse-threat-anim 1.5s infinite ease-out;
        }

        @keyframes pulse-threat-anim {
          0% { r: 2; opacity: 1; stroke-width: 4; }
          100% { r: 35; opacity: 0; stroke-width: 1; }
        }

        .threat-node {
          width: 12px;
          height: 12px;
          background: #ef4444;
          border-radius: 50%;
          box-shadow: 0 0 15px #ef4444;
          border: 2px solid #fff;
        }

        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 12s linear infinite;
        }

        .animated-data-line {
          stroke-dasharray: 8 12;
          animation: dash-flow 25s linear infinite;
        }

        @keyframes dash-flow {
          to { stroke-dashoffset: -1000; }
        }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #18181b; }
        ::-webkit-scrollbar-thumb:hover { background: #34d399; }
      `}} />
    </div>
  );
};

'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Asset } from '@/types';
import { useRouter } from 'next/navigation';
import { Shield, Server, Activity } from 'lucide-react';

const customIcon = L.divIcon({
  className: 'custom-div-icon',
  html: "<div class='node-marker'></div>",
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

export const WorldMap = ({ assets }: { assets: Asset[] }) => {
  const router = useRouter();

  // Compute networking lines connecting related assets
  const networkLinks = React.useMemo(() => {
    const links: [number, number][][] = [];
    const maxLinks = 150; // Prevent performance issues with too many lines
    
    for (let i = 0; i < assets.length; i++) {
      if (links.length >= maxLinks) break;
      const current = assets[i];
      
      // Connect to explicitly related assets
      current.relatedAssetIds?.forEach(rId => {
        const target = assets.find(a => a.id === rId);
        if (target && target.location.latitude && target.location.longitude) {
          links.push([
            [current.location.latitude, current.location.longitude],
            [target.location.latitude, target.location.longitude]
          ]);
        }
      });

      // Connect nodes with same ASN or Server Type for a "web" effect
      for (let j = i + 1; j < assets.length; j++) {
        if (links.length >= maxLinks) break;
        const target = assets[j];
        if (
          (current.asn && current.asn === target.asn && current.asn !== 'Unknown') ||
          (current.intelligence.serverType && current.intelligence.serverType === target.intelligence.serverType && current.intelligence.serverType !== 'Unknown')
        ) {
          // Avoid drawing lines that are too long (cross-world) to keep it looking clustered
          const latDiff = Math.abs(current.location.latitude - target.location.latitude);
          const lonDiff = Math.abs(current.location.longitude - target.location.longitude);
          if (latDiff < 40 && lonDiff < 40 && (latDiff > 1 || lonDiff > 1)) {
            links.push([
              [current.location.latitude, current.location.longitude],
              [target.location.latitude, target.location.longitude]
            ]);
          }
        }
      }
    }
    return links;
  }, [assets]);

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-[#050505] relative z-0">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%', background: '#050505' }}
        minZoom={2}
        maxZoom={18}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Network Connections */}
        {networkLinks.map((positions, idx) => (
          <React.Fragment key={`line-${idx}`}>
            {/* Base Line */}
            <Polyline 
              positions={positions} 
              pathOptions={{ color: '#10b981', weight: 1, opacity: 0.15, dashArray: '4 6' }} 
            />
            {/* Glowing inner line */}
            <Polyline 
              positions={positions} 
              pathOptions={{ color: '#10b981', weight: 3, opacity: 0.05 }} 
            />
          </React.Fragment>
        ))}

        {assets.map((asset) => (
          <React.Fragment key={asset.id}>
            {/* Pulsing signal ring */}
            <CircleMarker
              center={[asset.location.latitude, asset.location.longitude]}
              pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1, weight: 0 }}
              radius={15}
              className="pulse-signal"
            />
            
            <Marker 
              position={[asset.location.latitude, asset.location.longitude]} 
              icon={customIcon}
            >
              <Popup className="netscope-popup" minWidth={240}>
                <div className="bg-zinc-950 border border-emerald-500/30 p-4 rounded-sm text-xs font-mono shadow-[0_0_30px_rgba(16,185,129,0.2)] -m-5 w-full cursor-pointer hover:bg-zinc-900 transition-all border-l-4 border-l-emerald-500" onClick={() => router.push(`/asset/${asset.id}`)}>
                  <div className="flex items-center gap-2 text-emerald-500 font-bold mb-3 text-sm border-b border-zinc-800 pb-2">
                    <Activity size={14} className="animate-pulse" />
                    {asset.ip}
                    <span className="ml-auto text-[9px] text-zinc-500 font-normal uppercase">Active_Node</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">LOCATION</span>
                      <span className="text-zinc-300">{asset.location.city}, {asset.location.countryCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">INFRA</span>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Server size={10} className="text-emerald-500" /> 
                        {asset.intelligence.serverType || 'GENERIC'}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">SECURITY</span>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Shield size={10} className="text-emerald-500" />
                        {asset.services.length} PORTS_OPEN
                      </div>
                    </div>
                  </div>

                  {asset.intelligence.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4 border-t border-zinc-900 pt-3">
                      {asset.intelligence.tags.map(tag => (
                        <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 uppercase font-bold tracking-tighter">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 text-[9px] text-center text-zinc-600 group-hover:text-emerald-500 transition-colors uppercase tracking-[0.2em] font-bold">
                    [ Access_Detailed_Intelligence ]
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper { background: transparent; padding: 0; border-radius: 0; box-shadow: none; }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-container a { color: #10b981; }
        .leaflet-control-zoom a { background: rgba(0,0,0,0.8) !important; color: #10b981 !important; border-color: #27272a !important; font-family: monospace; }
        .leaflet-control-zoom a:hover { background: #10b981 !important; color: #000 !important; }
        
        /* Interactive Glowing Node Marker */
        .node-marker {
          background-color: #10b981;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #050505;
          box-shadow: 0 0 10px #10b981, inset 0 0 4px #fff;
          animation: pulse-ring 2.5s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
          cursor: crosshair;
          transition: all 0.3s ease;
        }

        .node-marker:hover {
          transform: scale(1.3);
          box-shadow: 0 0 20px #10b981, inset 0 0 8px #fff;
          background-color: #34d399;
          animation: none; /* Stop pulsing on hover so they can click clearly */
        }

        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
          70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .pulse-signal {
          animation: pulse-signal-anim 3s infinite ease-out;
        }

        @keyframes pulse-signal-anim {
          0% { r: 5; opacity: 0.8; }
          100% { r: 25; opacity: 0; }
        }
      `}} />
    </div>
  );
};

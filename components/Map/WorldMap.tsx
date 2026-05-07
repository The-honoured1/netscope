'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Asset } from '@/types';
import { useRouter } from 'next/navigation';
import { Shield, Server } from 'lucide-react';

const customIcon = L.divIcon({
  className: 'custom-div-icon',
  html: "<div style='background-color: #10b981; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #050505; box-shadow: 0 0 10px #10b981;'></div>",
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

export const WorldMap = ({ assets }: { assets: Asset[] }) => {
  const router = useRouter();

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
        {assets.map((asset) => (
          <Marker 
            key={asset.id} 
            position={[asset.location.latitude, asset.location.longitude]} 
            icon={customIcon}
          >
            <Popup className="netscope-popup" minWidth={220}>
              <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-sm text-xs font-mono shadow-2xl -m-5 w-full cursor-pointer hover:bg-zinc-900 transition-colors" onClick={() => router.push(`/asset/${asset.id}`)}>
                <div className="text-emerald-500 font-bold mb-2 text-sm border-b border-zinc-800 pb-1 flex justify-between items-center">
                  {asset.ip}
                  <span className="text-[9px] text-zinc-600 bg-zinc-900 px-1 py-0.5 rounded uppercase cursor-pointer hover:text-emerald-400">View Node &rarr;</span>
                </div>
                <div className="text-zinc-400 mb-3">{asset.location.city}, {asset.location.countryCode}</div>
                <div className="flex items-center gap-2 text-zinc-300 mb-1">
                  <Server size={12} className="text-zinc-500" /> {asset.intelligence.serverType || 'Unknown'}
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Shield size={12} className="text-zinc-500" /> {asset.services.length} Open Ports
                </div>
                {asset.intelligence.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 border-t border-zinc-800 pt-2">
                    {asset.intelligence.tags.map(tag => (
                      <span key={tag} className="text-[9px] px-1 bg-zinc-800 text-zinc-400 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper { background: transparent; padding: 0; border-radius: 0; box-shadow: none; }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-container a { color: #10b981; }
        .leaflet-control-zoom a { background: #18181b !important; color: #a1a1aa !important; border-color: #27272a !important; }
        .leaflet-control-zoom a:hover { color: #10b981 !important; }
      `}} />
    </div>
  );
};

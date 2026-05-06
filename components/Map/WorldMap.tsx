'use client';

import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { Asset } from '@/types';
import { useRouter } from 'next/navigation';

export const WorldMap = ({ assets }: { assets: Asset[] }) => {
  const globeRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const router = useRouter();

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight - 64 // Adjust for header
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 64
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Initial zoom
    if (globeRef.current) {
      globeRef.current.pointOfView({ altitude: 2 }, 1000);
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pointsData = assets.map(asset => ({
    lat: asset.location.latitude,
    lng: asset.location.longitude,
    size: 0.5,
    color: '#10b981', // emerald-500
    asset
  }));

  return (
    <div className="w-full h-full bg-[#050505]">
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          backgroundColor="#050505"
          pointsData={pointsData}
          pointAltitude="size"
          pointColor="color"
          pointRadius={0.5}
          pointsMerge={true}
          onPointClick={(point: any) => router.push(`/asset/${point.asset.id}`)}
          pointLabel={(point: any) => `
            <div style="background: rgba(0,0,0,0.8); padding: 8px; border: 1px solid #3f3f46; border-radius: 4px; font-family: monospace; font-size: 10px;">
              <div style="color: #10b981; font-weight: bold;">${point.asset.ip}</div>
              <div style="color: #a1a1aa;">${point.asset.location.city}, ${point.asset.location.countryCode}</div>
              <div style="color: #a1a1aa; margin-top: 4px;">Services: ${point.asset.services.length}</div>
            </div>
          `}
        />
      )}
    </div>
  );
};

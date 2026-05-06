'use client';

import dynamic from 'next/dynamic';

const DynamicWorldMap = dynamic(() => import('./WorldMap').then(mod => mod.WorldMap), {
  ssr: false,
  loading: () => <div className="w-full h-[800px] flex items-center justify-center text-zinc-500 font-mono text-sm">INITIALIZING_GLOBE_RENDERER...</div>
});

export const WorldMapWrapper = (props: any) => {
  return <DynamicWorldMap {...props} />;
};

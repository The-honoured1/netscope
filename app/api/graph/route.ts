import { NextResponse } from 'next/server';
import { searchAssets } from '@/lib/searchEngine';
import { buildGraphData } from '@/lib/graphBuilder';

export async function GET() {
  try {
    // Fetch all assets (unfiltered for full graph)
    const assets = await searchAssets('');
    const graphData = buildGraphData(assets);
    
    return NextResponse.json(graphData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to build graph' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { searchAssets } from '@/lib/searchEngine';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const serverType = searchParams.get('serverType') || undefined;
  const country = searchParams.get('country') || undefined;
  
  try {
    const results = await searchAssets(query, { serverType, country });
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

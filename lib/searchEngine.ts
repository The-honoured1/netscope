import { Asset } from '../types';
import { mockAssets } from './mockData';
import { enrichAsset } from './enrichment';

export async function searchAssets(query: string = '', filters: { serverType?: string; country?: string } = {}): Promise<Asset[]> {
  const normalizedQuery = query.toLowerCase().trim();
  
  let results = mockAssets.filter(asset => {
    if (!normalizedQuery) return true;
    
    return (
      asset.ip.includes(normalizedQuery) ||
      asset.hostname?.toLowerCase().includes(normalizedQuery) ||
      asset.domain?.toLowerCase().includes(normalizedQuery) ||
      asset.isp?.toLowerCase().includes(normalizedQuery) ||
      asset.intelligence.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
      asset.intelligence.serverType?.toLowerCase().includes(normalizedQuery)
    );
  });

  if (filters.serverType) {
    results = results.filter(a => a.intelligence.serverType?.toLowerCase() === filters.serverType?.toLowerCase());
  }

  // Enrich results before returning
  return results.map(asset => enrichAsset(asset, mockAssets));
}

export async function getAssetById(id: string): Promise<Asset | null> {
  const asset = mockAssets.find(a => a.id === id);
  if (!asset) return null;
  
  return enrichAsset(asset, mockAssets);
}

export async function getStats() {
  const enriched = mockAssets.map(a => enrichAsset(a, mockAssets));
  return {
    total: enriched.length,
    highRisk: enriched.filter(a => a.intelligence.riskScore > 70).length,
    countries: [...new Set(enriched.map(a => a.location.countryCode))].length,
    tags: Array.from(new Set(enriched.flatMap(a => a.intelligence.tags))).slice(0, 10)
  };
}

import { Asset } from '../types';
import { enrichAsset } from './enrichment';
import { discoverAsset } from './discovery';

// Live Session Index (Replaces mockData.ts)
// In production, this would be Elasticsearch or PostgreSQL
let sessionIndex: Asset[] = [];

// Seed the index with some real verified assets to start
const SEED_TARGETS = ['google.com', 'cloudflare.com', 'github.com', '8.8.8.8'];

async function seed() {
  if (sessionIndex.length > 0) return;
  for (const target of SEED_TARGETS) {
    const asset = await discoverAsset(target);
    if (asset) sessionIndex.push(asset);
  }
}

export async function searchAssets(query: string = '', filters: { serverType?: string; country?: string } = {}): Promise<Asset[]> {
  await seed();
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // If the query is a new domain/IP, discover it live!
  if (normalizedQuery && !sessionIndex.some(a => a.ip === normalizedQuery || a.domain === normalizedQuery)) {
    if (normalizedQuery.includes('.') || normalizedQuery.match(/^\d/)) {
      const liveAsset = await discoverAsset(normalizedQuery);
      if (liveAsset) {
        sessionIndex.push(liveAsset);
      }
    }
  }

  let results = sessionIndex.filter(asset => {
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
    results = results.filter(a => a.intelligence.serverType?.toLowerCase().includes(filters.serverType!.toLowerCase()));
  }

  // Enrich results (build relationships between discovered nodes)
  return results.map(asset => enrichAsset(asset, sessionIndex));
}

export async function getAssetById(id: string): Promise<Asset | null> {
  await seed();
  let asset = sessionIndex.find(a => a.id === id);
  
  if (!asset && id.startsWith('live-')) {
    const ip = id.replace('live-', '').replace(/-/g, '.');
    if (ip.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      asset = await discoverAsset(ip);
      if (asset) {
        sessionIndex.push(asset);
      }
    }
  }

  if (!asset) return null;
  return enrichAsset(asset, sessionIndex);
}

export async function getStats() {
  await seed();
  const enriched = sessionIndex.map(a => enrichAsset(a, sessionIndex));
  const countries = [...new Set(enriched.map(a => a.location.countryCode))];
  
  return {
    total: sessionIndex.length,
    liveCount: enriched.length,
    services: enriched.reduce((acc, a) => acc + a.services.length, 0),
    countries: countries.length,
    tags: Array.from(new Set(enriched.flatMap(a => a.intelligence.tags))).slice(0, 10)
  };
}

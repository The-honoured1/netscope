import { Asset, Service } from '../types';

export function detectTags(asset: Asset): string[] {
  const tags = new Set<string>(asset.intelligence.tags || []);
  
  asset.services.forEach(service => {
    const serverHeader = service.headers?.['server']?.toLowerCase() || '';
    const banner = service.banner?.toLowerCase() || '';
    
    // Server Type Tags
    if (serverHeader.includes('nginx')) tags.add('nginx');
    if (serverHeader.includes('apache')) tags.add('apache');
    if (serverHeader.includes('cloudflare')) tags.add('cloudflare');
    if (serverHeader.includes('github')) tags.add('github-pages');
    
    // Tech Stack Tags
    if (banner.includes('wordpress') || serverHeader.includes('wp-')) tags.add('wordpress');
    if (banner.includes('mysql')) tags.add('mysql');
    if (banner.includes('ssh')) tags.add('ssh-enabled');
    
    // Security Tags
    if (service.port === 80) tags.add('unencrypted-http');
    if (service.port === 443 && !asset.certificate) tags.add('missing-ssl');
    if (asset.certificate) {
      const validTo = new Date(asset.certificate.validTo);
      if (validTo < new Date()) tags.add('expired-ssl');
    }
  });

  // Risk based tags
  if (asset.intelligence.riskScore > 70) tags.add('high-risk');
  if (asset.intelligence.riskScore < 10) tags.add('secure');

  return Array.from(tags);
}

export function detectServerType(asset: Asset): string | undefined {
  for (const service of asset.services) {
    const serverHeader = service.headers?.['server'];
    if (serverHeader) return serverHeader;
  }
  return asset.intelligence.serverType;
}

export function buildRelationships(asset: Asset, allAssets: Asset[]): string[] {
  const relatedIds = new Set<string>(asset.relatedAssetIds || []);
  
  allAssets.forEach(other => {
    if (other.id === asset.id) return;

    // Same Subnet (simplified check)
    const assetSubnet = asset.ip.split('.').slice(0, 3).join('.');
    const otherSubnet = other.ip.split('.').slice(0, 3).join('.');
    if (assetSubnet === otherSubnet) relatedIds.add(other.id);

    // Same Certificate
    if (asset.certificate && other.certificate && 
        asset.certificate.fingerprint === other.certificate.fingerprint) {
      relatedIds.add(other.id);
    }

    // Same Domain
    if (asset.domain && other.domain && asset.domain === other.domain) {
      relatedIds.add(other.id);
    }
  });

  return Array.from(relatedIds);
}

export function enrichAsset(asset: Asset, allAssets: Asset[]): Asset {
  const serverType = detectServerType(asset);
  const tags = detectTags(asset);
  const relatedAssetIds = buildRelationships(asset, allAssets);
  
  // Calculate a dynamic risk score if not strictly set
  let riskScore = asset.intelligence.riskScore;
  if (tags.includes('expired-ssl')) riskScore += 20;
  if (tags.includes('unencrypted-http')) riskScore += 10;
  if (tags.includes('outdated')) riskScore += 15;
  
  return {
    ...asset,
    intelligence: {
      ...asset.intelligence,
      serverType,
      tags,
      riskScore: Math.min(riskScore, 100)
    },
    relatedAssetIds
  };
}

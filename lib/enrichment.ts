import { Asset, Service } from '../types';

/**
 * OS Detection patterns based on SSH banners and HTTP headers
 */
const OS_PATTERNS = [
  { name: 'Ubuntu', patterns: ['ubuntu'] },
  { name: 'Debian', patterns: ['debian'] },
  { name: 'CentOS', patterns: ['centos'] },
  { name: 'FreeBSD', patterns: ['freebsd'] },
  { name: 'Windows Server', patterns: ['microsoft-iis', 'win64', 'win32'] },
  { name: 'Amazon Linux', patterns: ['amzn'] },
  { name: 'Red Hat', patterns: ['rhel', 'red hat'] }
];

/**
 * Infrastructure patterns based on hostnames and certificates
 */
const INFRA_PATTERNS = [
  { isp: 'GitHub, Inc.', asn: 'AS36459', patterns: ['github.com', 'github.net'] },
  { isp: 'Cloudflare, Inc.', asn: 'AS13335', patterns: ['cloudflare.com', 'cloudflare.net', 'clouflare.com'] },
  { isp: 'Google LLC', asn: 'AS15169', patterns: ['google.com', 'googleusercontent.com', 'gstatic.com'] },
  { isp: 'Amazon Data Services', asn: 'AS16509', patterns: ['amazonaws.com', 'aws.com'] },
  { isp: 'DigitalOcean, LLC', asn: 'AS14061', patterns: ['digitalocean.com', 'do.co'] },
  { isp: 'Microsoft Corporation', asn: 'AS8075', patterns: ['azure.com', 'microsoft.com', 'windows.net'] }
];

export function detectOS(asset: Asset): string {
  const data = (asset.hostname || '' + asset.services.map(s => s.banner || '').join(' ')).toLowerCase();
  for (const os of OS_PATTERNS) {
    if (os.patterns.some(p => data.includes(p))) return os.name;
  }
  return 'Linux (Generic)'; // Default for most servers if unknown
}

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
      tags.add('ssl-enabled');
      if (asset.certificate.validTo) {
        const validTo = new Date(asset.certificate.validTo);
        if (validTo < new Date()) tags.add('expired-ssl');
      }
    }
  });

  // Infrastructure Tags
  if (asset.hostname?.includes('github')) tags.add('github-infra');
  if (asset.hostname?.includes('google')) tags.add('google-infra');
  if (asset.hostname?.includes('aws') || asset.hostname?.includes('amazon')) tags.add('aws-infra');

  // Risk based tags
  const riskScore = asset.intelligence.riskScore ?? 0;
  if (riskScore > 70) tags.add('high-risk');
  if (riskScore < 10) tags.add('secure');

  return Array.from(tags);
}

export function detectServerType(asset: Asset): string {
  for (const service of asset.services) {
    const serverHeader = service.headers?.['server'];
    if (serverHeader) return serverHeader;
  }
  return asset.intelligence.serverType || 'Generic Web Server';
}

export function buildRelationships(asset: Asset, allAssets: Asset[]): string[] {
  const relatedIds = new Set<string>(asset.relatedAssetIds || []);
  
  allAssets.forEach(other => {
    if (other.id === asset.id) return;

    // Same Subnet
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

export function enrichAsset(asset: Asset, allAssets: Asset[] = []): Asset {
  let { isp, asn, location, hostname } = asset;
  
  // Fill missing ISP/ASN from hostname patterns
  if (isp === 'Unknown' || asn === 'Unknown') {
    const hostLower = (hostname || '').toLowerCase();
    for (const infra of INFRA_PATTERNS) {
      if (infra.patterns.some(p => hostLower.includes(p))) {
        if (isp === 'Unknown') isp = infra.isp;
        if (asn === 'Unknown') asn = infra.asn;
        break;
      }
    }
  }

  // Guess location from common hostname clues if Unknown
  if (location.city === 'Unknown') {
    if (hostname?.includes('-fra')) { location.city = 'Frankfurt'; location.country = 'Germany'; location.countryCode = 'DE'; location.latitude = 50.1109; location.longitude = 8.6821; }
    else if (hostname?.includes('-ams')) { location.city = 'Amsterdam'; location.country = 'Netherlands'; location.countryCode = 'NL'; location.latitude = 52.3676; location.longitude = 4.9041; }
    else if (hostname?.includes('-lon')) { location.city = 'London'; location.country = 'United Kingdom'; location.countryCode = 'GB'; location.latitude = 51.5074; location.longitude = -0.1278; }
    else if (hostname?.includes('-iad') || hostname?.includes('-va')) { location.city = 'Ashburn'; location.country = 'United States'; location.countryCode = 'US'; location.latitude = 39.0438; location.longitude = -77.4874; }
    else if (hostname?.includes('-sfo')) { location.city = 'San Francisco'; location.country = 'United States'; location.countryCode = 'US'; location.latitude = 37.7749; location.longitude = -122.4194; }
  }

  const serverType = detectServerType(asset);
  const tags = detectTags({ ...asset, hostname, isp, asn, location });
  const os = detectOS({ ...asset, hostname });
  const relatedAssetIds = buildRelationships(asset, allAssets);
  
  // Calculate a dynamic risk score
  let riskScore = asset.intelligence.riskScore || 0;
  if (tags.includes('expired-ssl')) riskScore += 30;
  if (tags.includes('unencrypted-http')) riskScore += 10;
  if (tags.includes('ssh-exposed')) riskScore += 5;
  if (location.countryCode === '??') riskScore += 5; // Anonymous/Unknown origins are slightly higher risk
  
  return {
    ...asset,
    isp,
    asn,
    location,
    intelligence: {
      ...asset.intelligence,
      serverType,
      tags,
      riskScore: Math.min(riskScore, 100),
      os
    },
    relatedAssetIds
  };
}


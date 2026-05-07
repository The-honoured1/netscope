import { Asset } from '../types';
import { enrichAsset } from './enrichment';
import { discoverAsset } from './discovery';

// Live Session Index
let sessionIndex: Asset[] = [];

// Seed the index with prominent global nodes
const SEED_TARGETS = [
  'google.com', 'cloudflare.com', 'github.com', '8.8.8.8',
  'bbc.co.uk', 'baidu.com', 'amazon.co.jp', 'sydney.edu.au',
  'digitalocean.com', 'linode.com', 'microsoft.com', 'apple.com',
  'netflix.com', 'disney.com', 'tesla.com', 'nasa.gov',
  'cern.ch', 'mit.edu', 'stanford.edu', 'ox.ac.uk',
  '1.1.1.1', '9.9.9.9', '4.2.2.2', '208.67.222.222',
  'akamai.com', 'fastly.com', 'vercel.com', 'heroku.com',
  'slack.com', 'zoom.us', 'spotify.com', 'adobe.com',
  'intel.com', 'cisco.com', 'ibm.com', 'oracle.com',
  'comcast.net', 'att.com', 'verizon.com', 't-mobile.com',
  'ovhcloud.com', 'hetzner.com', 'bluehost.com', 'godaddy.com',
  'fbi.gov', 'cia.gov', 'dod.gov', 'whitehouse.gov',
  'un.org', 'who.int', 'worldbank.org', 'imf.org',
  'samsung.com', 'sony.com', 'toyota.co.jp', 'siemens.com',
  'telegram.org', 'signal.org', 'proton.me', 'torproject.org'
];

// Specialized Intelligence Categories
const INTEL_CATEGORIES = [
  { tag: 'scada', type: 'Industrial Controller', products: ['Siemens S7', 'Modbus', 'Rockwell Automation'] },
  { tag: 'iot', type: 'Embedded Device', products: ['Raspberry Pi', 'Zigbee Hub', 'Smart Lighting'] },
  { tag: 'cctv', type: 'IP Camera', products: ['Hikvision', 'Dahua', 'Axis Communications'] },
  { tag: 'honeypot', type: 'Deception System', products: ['Cowrie', 'Dionaea', 'HoneyTrap'] },
  { tag: 'malware', type: 'C2 Infrastructure', products: ['Cobalt Strike', 'Metasploit', 'Empire'] },
  { tag: 'tor', type: 'Exit Node', products: ['Tor Relay', 'Onion Service'] },
  { tag: 'k8s', type: 'Container Orchestration', products: ['Kubernetes Dashboard', 'etcd'] },
  { tag: 'database', type: 'Database Server', products: ['MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch'] }
];

const COMMON_CVES = ['CVE-2021-44228', 'CVE-2024-3094', 'CVE-2023-44487', 'CVE-2020-1472'];

// Note: Synthetic generator removed to maintain data integrity.
// Use discoverAsset(target) to populate the index with real data.

async function seed() {
  if (sessionIndex.length > 0) return;
  
  // Discover real core nodes to provide a starting point
  for (const target of SEED_TARGETS) {
    const asset = await discoverAsset(target);
    if (asset) sessionIndex.push(asset);
  }
}

export async function searchAssets(query: string = '', filters: { serverType?: string; country?: string; protocol?: string; tag?: string } = {}): Promise<Asset[]> {
  await seed();
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Advanced Query Parser (Shodan-style)
  // Example: "port:443 country:US nginx"
  const tokens = normalizedQuery.split(/\s+/);
  const searchFilters: any = { ...filters };
  let searchTerms: string[] = [];

  tokens.forEach(token => {
    if (token.includes(':')) {
      const [key, value] = token.split(':');
      switch (key) {
        case 'ip': searchFilters.ip = value; break;
        case 'port': searchFilters.port = parseInt(value); break;
        case 'country': searchFilters.countryCode = value.toUpperCase(); break;
        case 'asn': searchFilters.asn = value.toUpperCase(); break;
        case 'org': 
        case 'organization': searchFilters.isp = value; break;
        case 'product': searchFilters.serverType = value; break;
        case 'service': searchFilters.serviceName = value; break;
        case 'os': searchFilters.os = value; break;
        case 'cve': searchFilters.cve = value.toUpperCase(); break;
        case 'issuer': searchFilters.issuer = value; break;
        case 'hostname': searchFilters.hostname = value; break;
        case 'tag': searchFilters.tag = value; break;
        case 'protocol': searchFilters.protocol = value; break;
        case 'cloud': searchFilters.cloud = value; break;
        case 'risk': searchFilters.minRisk = parseInt(value); break;
        default: searchTerms.push(token);
      }
    } else {
      searchTerms.push(token);
    }
  });

  const finalSearchTerm = searchTerms.join(' ');
  
  // Live discovery for new targets
  if (finalSearchTerm && !sessionIndex.some(a => a.ip === finalSearchTerm || a.domain === finalSearchTerm)) {
    if (finalSearchTerm.includes('.') || finalSearchTerm.match(/^\d/)) {
      const liveAsset = await discoverAsset(finalSearchTerm);
      if (liveAsset) {
        sessionIndex.push(liveAsset);
      }
    }
  }

  let results = sessionIndex.filter(asset => {
    // 1. Filter by specific advanced keys
    if (searchFilters.ip && !asset.ip.includes(searchFilters.ip)) return false;
    if (searchFilters.port && !asset.services.some(s => s.port === searchFilters.port)) return false;
    if (searchFilters.countryCode && asset.location.countryCode !== searchFilters.countryCode) return false;
    if (searchFilters.asn && !asset.asn?.includes(searchFilters.asn)) return false;
    if (searchFilters.isp && !asset.isp?.toLowerCase().includes(searchFilters.isp.toLowerCase())) return false;
    if (searchFilters.cloud && !asset.isp?.toLowerCase().includes(searchFilters.cloud.toLowerCase())) return false;
    if (searchFilters.serverType && !asset.intelligence.serverType?.toLowerCase().includes(searchFilters.serverType.toLowerCase())) return false;
    if (searchFilters.serviceName && !asset.services.some(s => s.name?.toLowerCase().includes(searchFilters.serviceName!.toLowerCase()))) return false;
    if (searchFilters.os && !asset.intelligence.os?.toLowerCase().includes(searchFilters.os.toLowerCase())) return false;
    if (searchFilters.cve && !asset.intelligence.cves?.some(c => c.includes(searchFilters.cve))) return false;
    if (searchFilters.issuer && !asset.certificate?.issuer?.toLowerCase().includes(searchFilters.issuer.toLowerCase())) return false;
    if (searchFilters.hostname && !asset.hostname?.toLowerCase().includes(searchFilters.hostname.toLowerCase())) return false;
    if (searchFilters.tag && !asset.intelligence.tags.some(t => t.toLowerCase() === searchFilters.tag.toLowerCase())) return false;
    if (searchFilters.protocol && !asset.services.some(s => s.protocol.toLowerCase() === searchFilters.protocol.toLowerCase())) return false;
    if (searchFilters.minRisk && (asset.intelligence.riskScore || 0) < searchFilters.minRisk) return false;

    // 2. Filter by general search term
    if (!finalSearchTerm) return true;
    
    return (
      asset.ip.includes(finalSearchTerm) ||
      asset.hostname?.toLowerCase().includes(finalSearchTerm) ||
      asset.domain?.toLowerCase().includes(finalSearchTerm) ||
      asset.isp?.toLowerCase().includes(finalSearchTerm) ||
      asset.intelligence.tags.some(tag => tag.toLowerCase().includes(finalSearchTerm)) ||
      asset.intelligence.serverType?.toLowerCase().includes(finalSearchTerm)
    );
  });

  return results.map(asset => enrichAsset(asset, sessionIndex));
}

export async function getAssetById(id: string): Promise<Asset | null> {
  await seed();
  let asset = sessionIndex.find(a => a.id === id);
  
  if (!asset && id.startsWith('live-')) {
    const ip = id.replace('live-', '').replace(/-/g, '.');
    if (ip.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      const discovered = await discoverAsset(ip);
      if (discovered) {
        asset = discovered;
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
  const serviceCount = enriched.reduce((acc, a) => acc + a.services.length, 0);
  
  return {
    total: enriched.length.toLocaleString(),
    liveCount: enriched.length,
    services: serviceCount.toLocaleString(),
    countries: countries.length,
    activeDiscovery: sessionIndex.length,
    tags: Array.from(new Set(enriched.flatMap(a => a.intelligence.tags))).slice(0, 15)
  };
}

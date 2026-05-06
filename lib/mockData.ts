import { Asset } from '../types';

export const mockAssets: Asset[] = [
  // --- CLUSTER: CLOUDFLARE EDGE (NETSCOPE CORP) ---
  {
    id: 'ns-edge-1',
    ip: '104.21.32.144',
    hostname: 'edge-01.netscope.io',
    domain: 'netscope.io',
    asn: 'AS13335',
    isp: 'Cloudflare, Inc.',
    location: { city: 'San Francisco', country: 'USA', countryCode: 'US', latitude: 37.77, longitude: -122.41 },
    services: [
      { port: 443, protocol: 'https', name: 'https', headers: { server: 'cloudflare' }, lastSeen: '2024-05-01T10:00:00Z' }
    ],
    certificate: {
      issuer: 'Cloudflare Inc ECC CA-3',
      subject: 'netscope.io',
      validFrom: '2024-01-01',
      validTo: '2025-01-01',
      serialNumber: 'CF-001',
      fingerprint: 'SHA256:CF-NETSCOPE-FINGERPRINT'
    },
    intelligence: { serverType: 'Cloudflare', tags: ['cdn', 'waf', 'managed'], riskScore: 5 },
    relatedAssetIds: ['ns-edge-2', 'ns-api-1']
  },
  {
    id: 'ns-edge-2',
    ip: '104.21.32.145',
    hostname: 'edge-02.netscope.io',
    domain: 'netscope.io',
    asn: 'AS13335',
    isp: 'Cloudflare, Inc.',
    location: { city: 'San Francisco', country: 'USA', countryCode: 'US', latitude: 37.77, longitude: -122.41 },
    services: [
      { port: 443, protocol: 'https', name: 'https', headers: { server: 'cloudflare' }, lastSeen: '2024-05-01T10:00:00Z' }
    ],
    certificate: {
      issuer: 'Cloudflare Inc ECC CA-3',
      subject: 'netscope.io',
      validFrom: '2024-01-01',
      validTo: '2025-01-01',
      serialNumber: 'CF-001',
      fingerprint: 'SHA256:CF-NETSCOPE-FINGERPRINT'
    },
    intelligence: { serverType: 'Cloudflare', tags: ['cdn', 'waf'], riskScore: 5 },
    relatedAssetIds: ['ns-edge-1']
  },
  {
    id: 'ns-api-1',
    ip: '172.67.13.44',
    hostname: 'api.netscope.io',
    domain: 'netscope.io',
    asn: 'AS13335',
    isp: 'Cloudflare, Inc.',
    location: { city: 'London', country: 'UK', countryCode: 'GB', latitude: 51.5, longitude: -0.1 },
    services: [
      { port: 443, protocol: 'https', name: 'https', headers: { server: 'cloudflare' }, lastSeen: '2024-05-01T10:00:00Z' }
    ],
    certificate: {
      issuer: 'Cloudflare Inc ECC CA-3',
      subject: 'netscope.io',
      validFrom: '2024-01-01',
      validTo: '2025-01-01',
      serialNumber: 'CF-001',
      fingerprint: 'SHA256:CF-NETSCOPE-FINGERPRINT'
    },
    intelligence: { serverType: 'Cloudflare', tags: ['api', 'managed'], riskScore: 8 },
    relatedAssetIds: ['ns-edge-1']
  },

  // --- CLUSTER: COMPROMISED INFRA (MALICIOUS) ---
  {
    id: 'mal-node-1',
    ip: '45.33.2.11',
    hostname: 'update.threat-intel.net',
    domain: 'threat-intel.net',
    asn: 'AS63949',
    isp: 'Linode',
    location: { city: 'Frankfurt', country: 'Germany', countryCode: 'DE', latitude: 50.11, longitude: 8.68 },
    services: [
      { port: 80, protocol: 'http', name: 'http', banner: 'Apache/2.4.41 (Ubuntu)', headers: { server: 'Apache/2.4.41' }, lastSeen: '2024-04-28T15:30:00Z' },
      { port: 22, protocol: 'ssh', name: 'ssh', banner: 'SSH-2.0-OpenSSH_8.2p1', lastSeen: '2024-04-28T15:30:00Z' }
    ],
    intelligence: { serverType: 'Apache', os: 'Ubuntu 20.04', tags: ['malicious', 'c2-server', 'exposed-ssh'], riskScore: 92 },
    relatedAssetIds: ['mal-node-2', 'mal-node-3']
  },
  {
    id: 'mal-node-2',
    ip: '45.33.2.12',
    hostname: 'cdn.threat-intel.net',
    domain: 'threat-intel.net',
    asn: 'AS63949',
    isp: 'Linode',
    location: { city: 'Frankfurt', country: 'Germany', countryCode: 'DE', latitude: 50.11, longitude: 8.68 },
    services: [
      { port: 443, protocol: 'https', name: 'https', headers: { server: 'nginx/1.14.0' }, lastSeen: '2024-04-28T15:30:00Z' }
    ],
    certificate: {
      issuer: 'Let\'s Encrypt Authority X3',
      subject: 'threat-intel.net',
      validFrom: '2024-03-01',
      validTo: '2024-06-01',
      serialNumber: 'LE-666',
      fingerprint: 'SHA256:LE-MAL-FINGERPRINT'
    },
    intelligence: { serverType: 'Nginx', tags: ['malicious', 'outdated'], riskScore: 85 },
    relatedAssetIds: ['mal-node-1']
  },
  {
    id: 'mal-node-3',
    ip: '45.33.2.13',
    hostname: 'panel.threat-intel.net',
    domain: 'threat-intel.net',
    asn: 'AS63949',
    isp: 'Linode',
    location: { city: 'Frankfurt', country: 'Germany', countryCode: 'DE', latitude: 50.11, longitude: 8.68 },
    services: [
      { port: 8080, protocol: 'http', name: 'http-alt', banner: 'Nginx/1.14.0', lastSeen: '2024-04-28T15:30:00Z' }
    ],
    intelligence: { serverType: 'Nginx', tags: ['malicious', 'panel'], riskScore: 88 },
    relatedAssetIds: ['mal-node-1']
  },

  // --- CLUSTER: MISCONFIGURED DB (INTERNAL) ---
  {
    id: 'db-node-1',
    ip: '192.168.1.50',
    hostname: 'dev-db.internal.cloud',
    domain: 'internal.cloud',
    asn: 'AS15169',
    isp: 'Google LLC',
    location: { city: 'Mountain View', country: 'USA', countryCode: 'US', latitude: 37.38, longitude: -122.08 },
    services: [
      { port: 3306, protocol: 'http', name: 'mysql', banner: '5.7.33', lastSeen: '2024-04-30T12:00:00Z' }
    ],
    intelligence: { serverType: 'MySQL', tags: ['database', 'misconfigured', 'internal'], riskScore: 75 },
    relatedAssetIds: ['web-node-1']
  },
  {
    id: 'web-node-1',
    ip: '192.168.1.51',
    hostname: 'web-front.internal.cloud',
    domain: 'internal.cloud',
    asn: 'AS15169',
    isp: 'Google LLC',
    location: { city: 'Mountain View', country: 'USA', countryCode: 'US', latitude: 37.38, longitude: -122.08 },
    services: [
      { port: 80, protocol: 'http', name: 'http', headers: { server: 'Apache/2.4.41' }, lastSeen: '2024-04-30T12:00:00Z' }
    ],
    intelligence: { serverType: 'Apache', tags: ['internal', 'web'], riskScore: 20 },
    relatedAssetIds: ['db-node-1']
  },

  // --- OTHER INDIVIDUAL ASSETS ---
  {
    id: 'github-pages-1',
    ip: '185.199.108.153',
    hostname: 'pages.github.com',
    domain: 'github.io',
    asn: 'AS36459',
    isp: 'GitHub, Inc.',
    location: { city: 'Seattle', country: 'USA', countryCode: 'US', latitude: 47.60, longitude: -122.33 },
    services: [
      { port: 443, protocol: 'https', name: 'https', headers: { server: 'GitHub.com' }, lastSeen: '2024-05-02T08:00:00Z' }
    ],
    intelligence: { serverType: 'GitHub Pages', tags: ['static-hosting', 'verified'], riskScore: 2 },
    relatedAssetIds: []
  },
  {
    id: 'vuln-vpn-1',
    ip: '203.0.113.5',
    hostname: 'vpn.corporate-access.net',
    domain: 'corporate-access.net',
    asn: 'AS1234',
    isp: 'Global ISP',
    location: { city: 'Singapore', country: 'Singapore', countryCode: 'SG', latitude: 1.35, longitude: 103.81 },
    services: [
      { port: 1194, protocol: 'http', name: 'openvpn', banner: 'OpenVPN 2.4.7', lastSeen: '2024-05-01T20:00:00Z' }
    ],
    intelligence: { serverType: 'OpenVPN', tags: ['vpn', 'outdated', 'vulnerable'], riskScore: 65 },
    relatedAssetIds: []
  }
];

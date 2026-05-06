import { Asset } from '../types';

export const mockAssets: Asset[] = [
  {
    id: 'asset-001',
    ip: '104.21.32.144',
    hostname: 'cloud-edge-01.netscope.io',
    domain: 'netscope.io',
    asn: 'AS13335',
    isp: 'Cloudflare, Inc.',
    location: {
      city: 'San Francisco',
      country: 'United States',
      countryCode: 'US',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    services: [
      {
        port: 443,
        protocol: 'https',
        name: 'https',
        headers: {
          'server': 'cloudflare',
          'content-type': 'text/html',
          'x-frame-options': 'SAMEORIGIN'
        },
        lastSeen: '2024-05-01T10:00:00Z'
      },
      {
        port: 80,
        protocol: 'http',
        name: 'http',
        headers: {
          'server': 'cloudflare',
          'location': 'https://netscope.io'
        },
        lastSeen: '2024-05-01T10:00:00Z'
      }
    ],
    certificate: {
      issuer: 'Cloudflare Inc ECC CA-3',
      subject: 'netscope.io',
      validFrom: '2024-01-01',
      validTo: '2025-01-01',
      serialNumber: '0f:1a:2b:3c',
      fingerprint: 'SHA256:abc123def456'
    },
    intelligence: {
      serverType: 'Cloudflare',
      tags: ['cdn', 'waf', 'hsts', 'managed'],
      riskScore: 5
    },
    relatedAssetIds: ['asset-002', 'asset-005']
  },
  {
    id: 'asset-002',
    ip: '104.21.32.145',
    hostname: 'cloud-edge-02.netscope.io',
    domain: 'netscope.io',
    asn: 'AS13335',
    isp: 'Cloudflare, Inc.',
    location: {
      city: 'San Francisco',
      country: 'United States',
      countryCode: 'US',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    services: [
      {
        port: 443,
        protocol: 'https',
        name: 'https',
        headers: { 'server': 'cloudflare' },
        lastSeen: '2024-05-01T11:00:00Z'
      }
    ],
    certificate: {
      issuer: 'Cloudflare Inc ECC CA-3',
      subject: 'netscope.io',
      validFrom: '2024-01-01',
      validTo: '2025-01-01',
      serialNumber: '0f:1a:2b:3c',
      fingerprint: 'SHA256:abc123def456'
    },
    intelligence: {
      serverType: 'Cloudflare',
      tags: ['cdn', 'waf'],
      riskScore: 5
    },
    relatedAssetIds: ['asset-001']
  },
  {
    id: 'asset-003',
    ip: '45.33.2.11',
    hostname: 'api.threat-intel.net',
    domain: 'threat-intel.net',
    asn: 'AS63949',
    isp: 'Linode',
    location: {
      city: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
      latitude: 51.5074,
      longitude: -0.1278,
    },
    services: [
      {
        port: 8080,
        protocol: 'http',
        name: 'http-alt',
        banner: 'HTTP/1.1 200 OK\r\nServer: nginx/1.18.0\r\nContent-Type: application/json',
        headers: { 'server': 'nginx/1.18.0' },
        lastSeen: '2024-04-28T15:30:00Z'
      },
      {
        port: 22,
        protocol: 'ssh',
        name: 'ssh',
        banner: 'SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5',
        lastSeen: '2024-04-28T15:30:00Z'
      }
    ],
    intelligence: {
      serverType: 'Nginx',
      os: 'Ubuntu 20.04',
      tags: ['api', 'exposed-ssh', 'linux', 'unprotected'],
      riskScore: 45
    },
    relatedAssetIds: []
  },
  {
    id: 'asset-004',
    ip: '185.199.108.153',
    hostname: 'pages.github.com',
    domain: 'github.io',
    asn: 'AS36459',
    isp: 'GitHub, Inc.',
    location: {
      city: 'Seattle',
      country: 'United States',
      countryCode: 'US',
      latitude: 47.6062,
      longitude: -122.3321,
    },
    services: [
      {
        port: 443,
        protocol: 'https',
        name: 'https',
        headers: { 'server': 'GitHub.com' },
        lastSeen: '2024-05-02T08:00:00Z'
      }
    ],
    intelligence: {
      serverType: 'GitHub Pages',
      tags: ['static-hosting', 'verified'],
      riskScore: 2
    },
    relatedAssetIds: []
  },
  {
    id: 'asset-005',
    ip: '192.168.1.50',
    hostname: 'dev-db-internal.local',
    asn: 'AS15169',
    isp: 'Google LLC',
    location: {
      city: 'Mountain View',
      country: 'United States',
      countryCode: 'US',
      latitude: 37.3861,
      longitude: -122.0839,
    },
    services: [
      {
        port: 3306,
        protocol: 'http',
        name: 'mysql',
        banner: '5.7.33-0ubuntu0.18.04.1',
        lastSeen: '2024-04-30T12:00:00Z'
      }
    ],
    intelligence: {
      serverType: 'MySQL',
      os: 'Ubuntu 18.04',
      tags: ['database', 'outdated', 'misconfigured'],
      riskScore: 85
    },
    relatedAssetIds: ['asset-001']
  }
];

// Generate more mock data to reach ~20 entries
for (let i = 6; i <= 25; i++) {
  const isMalicious = i % 7 === 0;
  mockAssets.push({
    id: `asset-0${i}`,
    ip: `192.168.1.${100 + i}`,
    hostname: `node-${i}.internal.net`,
    domain: i % 3 === 0 ? 'internal.net' : undefined,
    asn: 'AS15169',
    isp: 'Internal Network',
    location: {
      city: 'Berlin',
      country: 'Germany',
      countryCode: 'DE',
      latitude: 52.5200,
      longitude: 13.4050,
    },
    services: [
      {
        port: i % 2 === 0 ? 80 : 443,
        protocol: i % 2 === 0 ? 'http' : 'https',
        name: i % 2 === 0 ? 'http' : 'https',
        headers: { 'server': i % 5 === 0 ? 'Apache/2.4.41' : 'nginx/1.14.0' },
        lastSeen: '2024-05-01T12:00:00Z'
      }
    ],
    intelligence: {
      serverType: i % 5 === 0 ? 'Apache' : 'Nginx',
      tags: isMalicious ? ['malicious', 'botnet-node'] : ['internal', 'server'],
      riskScore: isMalicious ? 95 : 10
    },
    relatedAssetIds: []
  });
}

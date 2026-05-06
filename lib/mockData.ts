import { Asset } from '../types';

/**
 * NetScope Real-World High-Fidelity Dataset
 * This data is modeled after actual internet infrastructure to ensure 
 * intelligence analysis and graph clustering are technically accurate.
 */
export const mockAssets: Asset[] = [
  // --- INFRASTRUCTURE CLUSTER: CLOUDFLARE EDGE (NETSCOPE.IO) ---
  {
    id: 'ns-edge-usa-01',
    ip: '104.21.32.144',
    hostname: 'edge-01.netscope.io',
    domain: 'netscope.io',
    asn: 'AS13335',
    isp: 'Cloudflare, Inc.',
    location: { city: 'San Francisco', country: 'United States', countryCode: 'US', latitude: 37.7749, longitude: -122.4194 },
    services: [
      { 
        port: 443, 
        protocol: 'https', 
        name: 'https', 
        headers: { 
          'server': 'cloudflare',
          'cf-ray': '87f1a2b3c4d5e6f7-SJC',
          'cf-cache-status': 'HIT',
          'x-content-type-options': 'nosniff',
          'strict-transport-security': 'max-age=31536000; includeSubDomains; preload'
        }, 
        lastSeen: '2024-05-06T14:20:00Z' 
      },
      { 
        port: 80, 
        protocol: 'http', 
        name: 'http', 
        headers: { 'server': 'cloudflare', 'location': 'https://netscope.io/' }, 
        lastSeen: '2024-05-06T14:20:00Z' 
      }
    ],
    certificate: {
      issuer: 'Cloudflare Inc ECC CA-3',
      subject: 'netscope.io',
      validFrom: '2024-01-15',
      validTo: '2025-01-15',
      serialNumber: '0f:a1:b2:c3:d4:e5',
      fingerprint: 'SHA256:4d7a8b9c0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b'
    },
    intelligence: { serverType: 'Cloudflare', tags: ['cdn', 'waf', 'hsts', 'managed-infra'], riskScore: 5 },
    relatedAssetIds: ['ns-edge-eur-01', 'ns-api-01']
  },
  {
    id: 'ns-edge-eur-01',
    ip: '172.67.13.44',
    hostname: 'edge-02.netscope.io',
    domain: 'netscope.io',
    asn: 'AS13335',
    isp: 'Cloudflare, Inc.',
    location: { city: 'London', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278 },
    services: [
      { 
        port: 443, 
        protocol: 'https', 
        name: 'https', 
        headers: { 'server': 'cloudflare', 'cf-ray': '87f1a2b3c4d5e6f7-LHR' }, 
        lastSeen: '2024-05-06T14:21:00Z' 
      }
    ],
    certificate: {
      issuer: 'Cloudflare Inc ECC CA-3',
      subject: 'netscope.io',
      validFrom: '2024-01-15',
      validTo: '2025-01-15',
      serialNumber: '0f:a1:b2:c3:d4:e5',
      fingerprint: 'SHA256:4d7a8b9c0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b'
    },
    intelligence: { serverType: 'Cloudflare', tags: ['cdn', 'waf', 'europe-edge'], riskScore: 5 },
    relatedAssetIds: ['ns-edge-usa-01']
  },

  // --- INFRASTRUCTURE CLUSTER: THREAT-INTEL.NET (SUSPICIOUS) ---
  {
    id: 'threat-c2-01',
    ip: '45.33.2.11',
    hostname: 'mx-01.threat-intel.net',
    domain: 'threat-intel.net',
    asn: 'AS63949',
    isp: 'Linode, LLC',
    location: { city: 'Frankfurt', country: 'Germany', countryCode: 'DE', latitude: 50.1109, longitude: 8.6821 },
    services: [
      { 
        port: 80, 
        protocol: 'http', 
        name: 'http', 
        banner: 'HTTP/1.1 200 OK\r\nServer: nginx/1.14.0 (Ubuntu)\r\nContent-Type: text/html',
        headers: { 'server': 'nginx/1.14.0 (Ubuntu)', 'x-powered-by': 'PHP/7.2.24' }, 
        lastSeen: '2024-05-04T10:30:00Z' 
      },
      { 
        port: 22, 
        protocol: 'ssh', 
        name: 'ssh', 
        banner: 'SSH-2.0-OpenSSH_7.6p1 Ubuntu-4ubuntu0.3', 
        lastSeen: '2024-05-04T10:30:00Z' 
      },
      {
        port: 25,
        protocol: 'smtp',
        name: 'smtp',
        banner: '220 mx-01.threat-intel.net ESMTP Postfix (Ubuntu)',
        lastSeen: '2024-05-04T10:30:00Z'
      }
    ],
    intelligence: { 
      serverType: 'Nginx', 
      os: 'Ubuntu 18.04', 
      tags: ['malicious', 'c2-infrastructure', 'outdated-software', 'vulnerable-ssh'], 
      riskScore: 94 
    },
    relatedAssetIds: ['threat-api-01', 'threat-db-01']
  },
  {
    id: 'threat-api-01',
    ip: '45.33.2.12',
    hostname: 'api.threat-intel.net',
    domain: 'threat-intel.net',
    asn: 'AS63949',
    isp: 'Linode, LLC',
    location: { city: 'Frankfurt', country: 'Germany', countryCode: 'DE', latitude: 50.1109, longitude: 8.6821 },
    services: [
      { 
        port: 443, 
        protocol: 'https', 
        name: 'https', 
        headers: { 'server': 'nginx/1.14.0 (Ubuntu)' }, 
        lastSeen: '2024-05-04T11:00:00Z' 
      }
    ],
    certificate: {
      issuer: 'Let\'s Encrypt Authority X3',
      subject: 'threat-intel.net',
      validFrom: '2024-03-01',
      validTo: '2024-06-01',
      serialNumber: '03:f1:a2:b3',
      fingerprint: 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    intelligence: { serverType: 'Nginx', tags: ['malicious', 'api-endpoint'], riskScore: 88 },
    relatedAssetIds: ['threat-c2-01']
  },

  // --- INTERNAL MISCONFIGURED INFRA ---
  {
    id: 'internal-dev-01',
    ip: '192.168.10.50',
    hostname: 'staging-db.corp.internal',
    asn: 'AS15169',
    isp: 'Google Cloud Platform',
    location: { city: 'Council Bluffs', country: 'United States', countryCode: 'US', latitude: 41.2619, longitude: -95.8608 },
    services: [
      { 
        port: 3306, 
        protocol: 'http', 
        name: 'mysql', 
        banner: '5.7.33-0ubuntu0.18.04.1', 
        lastSeen: '2024-05-05T22:00:00Z' 
      },
      {
        port: 6379,
        protocol: 'http',
        name: 'redis',
        banner: 'Redis server v=5.0.7 sha=00000000:0 malloc=jemalloc-5.2.1 bits=64',
        lastSeen: '2024-05-05T22:00:00Z'
      }
    ],
    intelligence: { 
      serverType: 'MySQL', 
      os: 'Ubuntu 18.04', 
      tags: ['internal', 'database', 'misconfigured', 'exposed-service'], 
      riskScore: 78 
    },
    relatedAssetIds: []
  },

  // --- PUBLIC GOOGLE ASSETS ---
  {
    id: 'google-dns-01',
    ip: '8.8.8.8',
    hostname: 'dns.google',
    asn: 'AS15169',
    isp: 'Google LLC',
    location: { city: 'Mountain View', country: 'United States', countryCode: 'US', latitude: 37.3861, longitude: -122.0839 },
    services: [
      { port: 53, protocol: 'dns', name: 'dns', banner: 'Google DNS', lastSeen: '2024-05-06T15:00:00Z' },
      { port: 443, protocol: 'https', name: 'https', headers: { 'server': 'gws' }, lastSeen: '2024-05-06T15:00:00Z' }
    ],
    intelligence: { serverType: 'Google Web Server', tags: ['dns', 'anycast', 'reliable'], riskScore: 2 },
    relatedAssetIds: ['google-search-01']
  },
  {
    id: 'google-search-01',
    ip: '172.217.16.142',
    hostname: 'www.google.com',
    domain: 'google.com',
    asn: 'AS15169',
    isp: 'Google LLC',
    location: { city: 'Mountain View', country: 'United States', countryCode: 'US', latitude: 37.3861, longitude: -122.0839 },
    services: [
      { port: 443, protocol: 'https', name: 'https', headers: { 'server': 'gws', 'x-xss-protection': '0' }, lastSeen: '2024-05-06T15:05:00Z' }
    ],
    certificate: {
      issuer: 'GTS CA 1C3',
      subject: 'google.com',
      validFrom: '2024-04-01',
      validTo: '2024-06-24',
      serialNumber: '3c:d2:e1:a5',
      fingerprint: 'SHA256:f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2'
    },
    intelligence: { serverType: 'Google Web Server', tags: ['search-engine', 'primary'], riskScore: 2 },
    relatedAssetIds: ['google-dns-01']
  },

  // --- VULNERABLE CORPORATE VPN ---
  {
    id: 'corp-vpn-01',
    ip: '203.0.113.88',
    hostname: 'vpn.global-corp.net',
    domain: 'global-corp.net',
    asn: 'AS701',
    isp: 'Verizon Business',
    location: { city: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.0060 },
    services: [
      { 
        port: 443, 
        protocol: 'https', 
        name: 'fortinet-vpn', 
        banner: 'FortiGate SSL-VPN',
        headers: { 'server': 'FortiWeb' }, 
        lastSeen: '2024-05-06T10:00:00Z' 
      }
    ],
    intelligence: { 
      serverType: 'FortiGate', 
      tags: ['vpn', 'corporate-gateway', 'critical-infrastructure'], 
      riskScore: 45 
    },
    relatedAssetIds: []
  },

  // --- MICROSOFT AZURE INSTANCE ---
  {
    id: 'azure-app-01',
    ip: '20.112.250.133',
    hostname: 'app-svc-prd.azurewebsites.net',
    asn: 'AS8075',
    isp: 'Microsoft Corporation',
    location: { city: 'Des Moines', country: 'United States', countryCode: 'US', latitude: 41.5868, longitude: -93.6250 },
    services: [
      { 
        port: 443, 
        protocol: 'https', 
        name: 'https', 
        headers: { 'server': 'Microsoft-IIS/10.0', 'x-powered-by': 'ASP.NET' }, 
        lastSeen: '2024-05-06T12:00:00Z' 
      }
    ],
    intelligence: { serverType: 'IIS', tags: ['cloud-app', 'azure-websites'], riskScore: 12 },
    relatedAssetIds: []
  },

  // --- AWS EC2 INSTANCE (WP) ---
  {
    id: 'aws-ec2-wp-01',
    ip: '3.120.45.22',
    hostname: 'ec2-3-120-45-22.eu-central-1.compute.amazonaws.com',
    asn: 'AS16509',
    isp: 'Amazon.com, Inc.',
    location: { city: 'Frankfurt', country: 'Germany', countryCode: 'DE', latitude: 50.1109, longitude: 8.6821 },
    services: [
      { 
        port: 80, 
        protocol: 'http', 
        name: 'http', 
        banner: 'Apache/2.4.41 (Ubuntu)',
        headers: { 'server': 'Apache/2.4.41 (Ubuntu)', 'link': '<https://site.com/wp-json/>; rel="https://api.w.org/"' }, 
        lastSeen: '2024-05-06T09:00:00Z' 
      }
    ],
    intelligence: { serverType: 'Apache', tags: ['wordpress', 'aws-ec2', 'outdated-wp'], riskScore: 35 },
    relatedAssetIds: []
  }
];

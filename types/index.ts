export type Protocol = 'http' | 'https' | 'ssh' | 'ftp' | 'smtp' | 'dns';

export interface Service {
  port: number;
  protocol: Protocol;
  name: string;
  banner?: string;
  headers?: Record<string, string>;
  lastSeen: string;
}

export interface Certificate {
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  fingerprint: string;
}

export interface IntelligenceMetadata {
  serverType?: string;
  os?: string;
  tags: string[];
  riskScore: number; // 0-100
  clusterId?: string;
}

export interface Asset {
  id: string;
  ip: string;
  hostname?: string;
  domain?: string;
  asn?: string;
  isp?: string;
  location: {
    city: string;
    country: string;
    countryCode: string;
    latitude: number;
    longitude: number;
  };
  services: Service[];
  certificate?: Certificate;
  intelligence: IntelligenceMetadata;
  relatedAssetIds: string[];
}

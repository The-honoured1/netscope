import dns from 'dns/promises';
import { Asset, Service, Protocol } from '../types';

export async function discoverAsset(target: string): Promise<Asset | null> {
  try {
    let ip = '';
    let hostname = '';
    let domain = '';

    // 1. Resolve Target
    if (target.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      ip = target;
      try {
        const names = await dns.reverse(ip);
        hostname = names[0] || '';
      } catch (e) {}
    } else {
      domain = target;
      const addresses = await dns.resolve4(domain);
      ip = addresses[0];
      hostname = domain;
    }

    if (!ip) return null;

    // 2. Geolocation (REAL DATA)
    let geoData: any = {};
    try {
      const geoRes = await fetch(`https://ipwho.is/${ip}`, {
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      if (geoRes.ok) {
        const data = await geoRes.json();
        if (data.success) {
          geoData = {
            as: `AS${data.connection.asn}`,
            isp: data.connection.isp,
            city: data.city,
            country: data.country,
            countryCode: data.country_code,
            lat: data.latitude,
            lon: data.longitude
          };
        }
      }
    } catch (e) {
      console.warn(`Geolocation failed for ${ip}, continuing without location data.`);
    }

    // 3. Service Discovery (Real-time HTTP Check)
    const services: Service[] = [];
    
    // Check Port 443
    try {
      const httpsRes = await fetch(`https://${ip}`, { 
        method: 'HEAD', 
        signal: AbortSignal.timeout(3000),
        headers: { 'User-Agent': 'NetScope/1.0 (Asset Intelligence)' }
      });
      
      const headers: Record<string, string> = {};
      httpsRes.headers.forEach((v, k) => { headers[k] = v; });

      services.push({
        port: 443,
        protocol: 'https',
        name: 'https',
        headers,
        lastSeen: new Date().toISOString()
      });
    } catch (e) {}

    // Check Port 80
    if (services.length === 0) {
      try {
        const httpRes = await fetch(`http://${ip}`, { 
          method: 'HEAD', 
          signal: AbortSignal.timeout(2000) 
        });
        const headers: Record<string, string> = {};
        httpRes.headers.forEach((v, k) => { headers[k] = v; });

        services.push({
          port: 80,
          protocol: 'http',
          name: 'http',
          headers,
          lastSeen: new Date().toISOString()
        });
      } catch (e) {}
    }

    // 4. Intelligence Analysis
    const serverType = services[0]?.headers?.['server'] || 'Unknown';
    const tags = [];
    if (serverType.toLowerCase().includes('cloudflare')) tags.push('cloudflare', 'waf');
    if (serverType.toLowerCase().includes('nginx')) tags.push('nginx');
    if (serverType.toLowerCase().includes('apache')) tags.push('apache');
    if (services.some(s => s.port === 443)) tags.push('ssl-enabled');

    const asset: Asset = {
      id: `live-${ip.replace(/\./g, '-')}`,
      ip,
      hostname: hostname || undefined,
      domain: domain || undefined,
      asn: geoData.as || 'Unknown',
      isp: geoData.isp || 'Unknown',
      location: {
        city: geoData.city || 'Unknown',
        country: geoData.country || 'Unknown',
        countryCode: geoData.countryCode || '??',
        latitude: geoData.lat || 0,
        longitude: geoData.lon || 0,
      },
      services,
      intelligence: {
        serverType,
        tags
      },
      relatedAssetIds: []
    };

    return asset;
  } catch (error) {
    console.error('Discovery failed:', error);
    return null;
  }
}

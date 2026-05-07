import dns from 'dns/promises';
import tls from 'tls';
import { Asset, Service, Protocol, Certificate } from '../types';

async function getCertificate(hostname: string, ip: string): Promise<Certificate | undefined> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect({
        host: ip,
        port: 443,
        servername: hostname || ip,
        rejectUnauthorized: false,
      }, () => {
        const cert = socket.getPeerCertificate(false);
        socket.end();
        if (cert && cert.subject) {
          resolve({
            issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown Issuer',
            subject: cert.subject?.O || cert.subject?.CN || 'Unknown Subject',
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            serialNumber: cert.serialNumber,
            fingerprint: cert.fingerprint
          });
        } else {
          resolve(undefined);
        }
      });

      socket.on('error', () => {
        resolve(undefined);
      });
      
      socket.setTimeout(3000, () => {
        socket.destroy();
        resolve(undefined);
      });
    } catch (e) {
      resolve(undefined);
    }
  });
}

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
      try {
        const addresses = await dns.resolve4(domain);
        ip = addresses[0];
        hostname = domain;
      } catch(e) {
        return null;
      }
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
    let certificate: Certificate | undefined = undefined;
    
    // Check Port 443
    try {
      const httpsRes = await fetch(`https://${ip}`, { 
        method: 'GET', 
        signal: AbortSignal.timeout(3000),
        headers: { 
          'User-Agent': 'NetScope/1.0 (Asset Intelligence)',
          'Host': hostname || ip
        }
      });
      
      const headers: Record<string, string> = {};
      let banner = `HTTP/1.1 ${httpsRes.status} ${httpsRes.statusText}\r\n`;
      httpsRes.headers.forEach((v, k) => { 
        headers[k] = v; 
        banner += `${k}: ${v}\r\n`;
      });
      banner += '\r\n';
      const text = await httpsRes.text();
      banner += text.substring(0, 1000);

      services.push({
        port: 443,
        protocol: 'https',
        name: 'https',
        headers,
        banner,
        lastSeen: new Date().toISOString()
      });

      certificate = await getCertificate(hostname, ip);
    } catch (e) {
      // If full GET fails, maybe just the TLS connection works
      certificate = await getCertificate(hostname, ip);
      if (certificate) {
        services.push({
          port: 443,
          protocol: 'https',
          name: 'https',
          lastSeen: new Date().toISOString()
        });
      }
    }

    // Check Port 80
    try {
      const httpRes = await fetch(`http://${ip}`, { 
        method: 'GET', 
        signal: AbortSignal.timeout(2000),
        headers: {
          'User-Agent': 'NetScope/1.0 (Asset Intelligence)',
          'Host': hostname || ip
        }
      });
      const headers: Record<string, string> = {};
      let banner = `HTTP/1.1 ${httpRes.status} ${httpRes.statusText}\r\n`;
      httpRes.headers.forEach((v, k) => { 
        headers[k] = v; 
        banner += `${k}: ${v}\r\n`;
      });
      banner += '\r\n';
      const text = await httpRes.text();
      banner += text.substring(0, 1000);

      services.push({
        port: 80,
        protocol: 'http',
        name: 'http',
        headers,
        banner,
        lastSeen: new Date().toISOString()
      });
    } catch (e) {}

    // Check Port 22 (SSH) Simulated/Basic check
    try {
      const net = await import('net');
      const sshPromise = new Promise<string>((resolve, reject) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);
        socket.on('data', (data) => {
          resolve(data.toString());
          socket.destroy();
        });
        socket.on('timeout', () => {
          socket.destroy();
          reject();
        });
        socket.on('error', () => reject());
        socket.connect(22, ip);
      });
      
      const sshBanner = await sshPromise;
      if (sshBanner) {
        services.push({
          port: 22,
          protocol: 'ssh',
          name: 'ssh',
          banner: sshBanner.trim(),
          lastSeen: new Date().toISOString()
        });
      }
    } catch (e) {}

    // 4. Intelligence Analysis
    const serverType = services.find(s => s.headers?.['server'])?.headers?.['server'] || 'Unknown';
    const tags = [];
    if (serverType.toLowerCase().includes('cloudflare')) tags.push('cloudflare', 'waf');
    if (serverType.toLowerCase().includes('nginx')) tags.push('nginx');
    if (serverType.toLowerCase().includes('apache')) tags.push('apache');
    if (services.some(s => s.port === 443)) tags.push('ssl-enabled');
    if (services.some(s => s.port === 22)) tags.push('ssh-exposed');

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
      certificate,
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


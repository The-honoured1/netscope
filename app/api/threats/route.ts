import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Fetch from ThreatFox (recent IOCs)
    const response = await fetch('https://threatfox-api.abuse.ch/api/v1/', {
      method: 'POST',
      body: JSON.stringify({ query: 'get_recent', days: 1 }),
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 } // Cache for 5 mins
    });

    const data = await response.json();

    if (data.query_status !== 'ok') {
      throw new Error('ThreatFox API error');
    }

    // 2. Filter for IP-based indicators
    const rawThreats = data.data
      .filter((item: any) => item.ioc_type.includes('ip'))
      .slice(0, 15);

    // 3. Geolocate them
    const threatsWithGeo = await Promise.all(rawThreats.map(async (item: any) => {
      const ip = item.ioc.split(':')[0];
      try {
        const geoRes = await fetch(`https://ipwho.is/${ip}`, { signal: AbortSignal.timeout(2000) });
        const geo = await geoRes.json();
        
        return {
          id: item.id,
          ip: ip,
          type: item.threat_type_desc || item.threat_type,
          msg: `${item.threat_type_desc || item.threat_type}`,
          location: geo.success ? {
            latitude: geo.latitude,
            longitude: geo.longitude,
            countryCode: geo.country_code,
            city: geo.city
          } : null,
          severity: item.confidence_level > 75 ? 'CRITICAL' : 'HIGH',
          source: 'ThreatFox'
        };
      } catch (e) {
        return null;
      }
    }));

    return NextResponse.json(threatsWithGeo.filter(t => t !== null));
  } catch (error) {
    console.error('Threat fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch real threats' }, { status: 500 });
  }
}

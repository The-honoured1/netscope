import { Asset } from '../types';

export interface GraphNode {
  id: string;
  type: 'domain' | 'ip' | 'service' | 'cert';
  label: string;
  metadata?: any;
  val: number; // size for force graph
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphEdge[];
}

export function buildGraphData(assets: Asset[]): GraphData {
  const nodesMap = new Map<string, GraphNode>();
  const links: GraphEdge[] = [];

  assets.forEach(asset => {
    // 1. Create IP Node
    const ipId = `ip-${asset.ip}`;
    if (!nodesMap.has(ipId)) {
      nodesMap.set(ipId, {
        id: ipId,
        type: 'ip',
        label: asset.ip,
        metadata: { isp: asset.isp, asn: asset.asn, location: asset.location },
        val: 10
      });
    }

    // 2. Create Domain Node (if exists)
    if (asset.domain) {
      const domainId = `domain-${asset.domain}`;
      if (!nodesMap.has(domainId)) {
        nodesMap.set(domainId, {
          id: domainId,
          type: 'domain',
          label: asset.domain,
          val: 12
        });
      }
      
      // Edge: Domain -> IP
      links.push({ source: domainId, target: ipId, type: 'resolves_to' });

      // Handle Hostname if specific
      if (asset.hostname && asset.hostname !== asset.domain) {
        const hostId = `host-${asset.hostname}`;
        if (!nodesMap.has(hostId)) {
          nodesMap.set(hostId, {
            id: hostId,
            type: 'domain',
            label: asset.hostname,
            val: 8
          });
        }
        links.push({ source: hostId, target: domainId, type: 'subdomain' });
        links.push({ source: hostId, target: ipId, type: 'resolves_to' });
      }
    }

    // 3. Create Service Nodes
    asset.services.forEach(service => {
      const serviceId = `service-${asset.ip}-${service.port}`;
      const serviceLabel = `${service.name}:${service.port}`;
      
      if (!nodesMap.has(serviceId)) {
        nodesMap.set(serviceId, {
          id: serviceId,
          type: 'service',
          label: serviceLabel,
          metadata: { banner: service.banner, protocol: service.protocol },
          val: 6
        });
      }

      // Edge: IP -> Service
      links.push({ source: ipId, target: serviceId, type: 'hosts' });
    });

    // 4. Create Certificate Node
    if (asset.certificate) {
      const certId = `cert-${asset.certificate.fingerprint}`;
      if (!nodesMap.has(certId)) {
        nodesMap.set(certId, {
          id: certId,
          type: 'cert',
          label: `Cert: ${asset.certificate.issuer?.split(' ')[0] || 'Unknown'}`,
          metadata: asset.certificate,
          val: 10
        });
      }

      // Edge: IP -> Certificate (or Domain -> Certificate)
      links.push({ source: ipId, target: certId, type: 'presents' });
      if (asset.domain) {
        links.push({ source: `domain-${asset.domain}`, target: certId, type: 'issued_for' });
      }
    }

    // 5. Relationship / Cluster Edges
    asset.relatedAssetIds.forEach(relatedId => {
      const relatedAsset = assets.find(a => a.id === relatedId);
      if (relatedAsset) {
        links.push({ 
          source: ipId, 
          target: `ip-${relatedAsset.ip}`, 
          type: 'cluster_relation',
          label: 'correlated'
        });
      }
    });
  });

  // Deduplicate links
  const linkMap = new Map<string, GraphEdge>();
  links.forEach(l => {
    const key = `${l.source}-${l.target}-${l.type}`;
    if (!linkMap.has(key)) {
      linkMap.set(key, l);
    }
  });
  const uniqueLinks = Array.from(linkMap.values());

  return {
    nodes: Array.from(nodesMap.values()),
    links: uniqueLinks
  };
}

# NetScope | Internet Asset Intelligence

NetScope is a high-performance internet asset intelligence platform designed to discover, enrich, and map global infrastructure. It provides a structured search engine for exposed services, certificates, and IPs, with an advanced intelligence layer for relationship mapping.

## Core Features

- **Global Search Engine**: Command-style search across IPs, domains, server types, and tags.
- **Intelligence Enrichment**: Automatic detection of server types, OS, and security risks from raw banners and headers.
- **Infrastructure Clustering**: Automatically connects related assets based on SSL certificates, IP proximity, and shared domains.
- **Cyber Intelligence Dashboard**: Data-dense UI for deep technical analysis of internet-exposed infrastructure.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Real-Time Discovery Engine (No Mock Data)

NetScope is powered by a live discovery engine that performs real-world intelligence gathering:
- **DNS Resolution**: Live resolution of domains to IP addresses.
- **HTTP Fingerprinting**: Real-time header analysis from actual web servers.
- **Live Geolocation**: Precise location data using real-world IP mapping APIs.
- **Dynamic Indexing**: Discovered assets are indexed in real-time and correlated for graph visualization.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Enrichment Logic

NetScope doesn't just show raw data. It processes every asset through:
1. **Signature Detection**: Identifies software (Nginx, Apache, WordPress) from headers.
2. **Risk Scoring**: Calculates a dynamic risk score based on open ports, expired SSLs, and outdated software.
3. **Graphing**: Builds a relationship list by correlating certificate fingerprints and network subnets.

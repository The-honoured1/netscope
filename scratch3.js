const dns = require('dns').promises;

const targets = [
  'google.com', 'cloudflare.com', 'github.com', '8.8.8.8'
];

async function test() {
  for (const target of targets) {
    try {
      let ip = target;
      if (!target.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
        const addresses = await dns.resolve4(target);
        ip = addresses[0];
      }
      console.log('fetching', ip);
      const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
      console.log('geoRes status', geoRes.status);
      const data = await geoRes.json();
      console.log(target, data.status);
    } catch (e) {
      console.error(target, 'error', e.message);
    }
  }
}

test();

const dns = require('dns').promises;

const targets = [
  'google.com', 'cloudflare.com', 'github.com', '8.8.8.8',
  'bbc.co.uk', 'baidu.com', 'amazon.co.jp', 'spiegel.de'
];

async function test() {
  for (const target of targets) {
    try {
      let ip = target;
      if (!target.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
        const addresses = await dns.resolve4(target);
        ip = addresses[0];
      }
      const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
      const data = await geoRes.json();
      console.log(target, data.status);
    } catch (e) {
      console.error(target, 'error');
    }
  }
}

test();

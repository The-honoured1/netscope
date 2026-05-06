const dns = require('dns').promises;

async function test() {
  try {
    const addresses = await dns.resolve4('google.com');
    const ip = addresses[0];
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await geoRes.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

test();

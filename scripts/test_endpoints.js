const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    const key = trimmed.substring(0, idx).trim();
    let val = trimmed.substring(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[key] = val;
  }
}

async function testEndpoints() {
  const endpoints = [
    '/pg/query',
    '/database/query',
    '/rest/v1/rpc',
    '/rest/v1/rpc/exec',
    '/api/query'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}${ep}`, {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: 'SELECT 1;' })
      });
      console.log(ep, res.status, await res.text());
    } catch (e) {
      console.log(ep, 'Error:', e.message);
    }
  }
}
testEndpoints();

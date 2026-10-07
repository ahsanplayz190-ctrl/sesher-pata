const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testRpc() {
  const rpcTests = ['exec_sql', 'execute_sql', 'sql', 'run_sql'];
  for (const r of rpcTests) {
    const res = await supabase.rpc(r, { query: 'SELECT 1' });
    console.log(r, res.error ? res.error.message : 'SUCCESS: ' + JSON.stringify(res.data));
  }
}
testRpc();

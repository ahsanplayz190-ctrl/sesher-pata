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
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  console.log('--- CATEGORIES ---');
  const catRes = await supabase.from('categories').select('*');
  console.log('categories error:', catRes.error);
  console.log('categories count:', catRes.data?.length);
  if (catRes.data?.length) {
    console.log('sample category:', catRes.data[0]);
  }

  console.log('--- AUTHORS ---');
  const authRes = await supabase.from('authors').select('*');
  console.log('authors error:', authRes.error);
  console.log('authors count:', authRes.data?.length);
  if (authRes.data?.length) {
    console.log('sample author:', authRes.data[0]);
  }
}

inspect();

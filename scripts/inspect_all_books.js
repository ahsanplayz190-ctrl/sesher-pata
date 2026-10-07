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
  const { data: books, error } = await supabase.from('books').select('id, title, author, category, created_at').order('created_at', { ascending: false });
  console.log('Total books in DB:', books?.length, 'error:', error);
  books?.forEach(b => {
    console.log(`[${b.id}] "${b.title}" | Author: "${b.author}" | Category: "${b.category}"`);
  });
}

inspect();

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
  console.log('=== AUTHORS IN DB ===');
  const { data: authors, error: authErr } = await supabase.from('authors').select('*');
  console.log('Authors count:', authors?.length, 'error:', authErr);
  authors?.forEach(a => console.log(`  ID: ${a.id} | Name: "${a.name}"`));

  console.log('\n=== CATEGORIES IN DB ===');
  const { data: categories, error: catErr } = await supabase.from('categories').select('*');
  console.log('Categories count:', categories?.length, 'error:', catErr);
  categories?.forEach(c => console.log(`  ID: ${c.id} | Name: "${c.name}" | English: "${c.english_name}"`));

  console.log('\n=== BOOKS IN DB ===');
  const { data: books, error: bookErr } = await supabase.from('books').select('*').order('created_at', { ascending: false }).limit(10);
  console.log('Books count:', books?.length, 'error:', bookErr);
  if (books && books.length > 0) {
    console.log('Books table columns:', Object.keys(books[0]));
    books.forEach(b => {
      console.log(`  Book ID: ${b.id} | Title: "${b.title}" | Author: "${b.author}" | Category: "${b.category}"`);
    });
  }
}

inspect();

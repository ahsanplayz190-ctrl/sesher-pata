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

async function run() {
  console.log('--- CHECKING BOOKS TABLE FOR UNNORMALIZED STRINGS ---');
  const { data: books, error: bookErr } = await supabase.from('books').select('id, title, author, category');
  if (bookErr) {
    console.error('Book error:', bookErr);
    return;
  }

  let booksUpdated = 0;
  for (const b of (books || [])) {
    const nAuthor = (b.author || '').normalize('NFC').trim();
    const nCat = (b.category || '').normalize('NFC').trim();
    const nTitle = (b.title || '').normalize('NFC').trim();
    if (nAuthor !== b.author || nCat !== b.category || nTitle !== b.title) {
      console.log(`Normalizing book [${b.id}]:`);
      if (nAuthor !== b.author) console.log(`  author: "${b.author}" -> "${nAuthor}"`);
      if (nCat !== b.category) console.log(`  category: "${b.category}" -> "${nCat}"`);
      await supabase.from('books').update({ author: nAuthor, category: nCat, title: nTitle }).eq('id', b.id);
      booksUpdated++;
    }
  }
  console.log(`Books normalized: ${booksUpdated} / ${books.length}`);

  console.log('\n--- CHECKING AUTHORS TABLE ---');
  const { data: authors, error: authErr } = await supabase.from('authors').select('id, name');
  if (authErr) {
    console.error('Author error:', authErr);
    return;
  }
  let authorsUpdated = 0;
  for (const a of (authors || [])) {
    const nName = (a.name || '').normalize('NFC').trim();
    if (nName !== a.name) {
      console.log(`Normalizing author [${a.id}]: "${a.name}" -> "${nName}"`);
      await supabase.from('authors').update({ name: nName }).eq('id', a.id);
      authorsUpdated++;
    }
  }
  console.log(`Authors normalized: ${authorsUpdated} / ${authors.length}`);

  console.log('\n--- CHECKING CATEGORIES TABLE ---');
  const { data: categories, error: catErr } = await supabase.from('categories').select('id, name');
  if (catErr) {
    console.error('Category error:', catErr);
    return;
  }
  let catsUpdated = 0;
  for (const c of (categories || [])) {
    const nName = (c.name || '').normalize('NFC').trim();
    if (nName !== c.name) {
      console.log(`Normalizing category [${c.id}]: "${c.name}" -> "${nName}"`);
      await supabase.from('categories').update({ name: nName }).eq('id', c.id);
      catsUpdated++;
    }
  }
  console.log(`Categories normalized: ${catsUpdated} / ${categories.length}`);
}

run();

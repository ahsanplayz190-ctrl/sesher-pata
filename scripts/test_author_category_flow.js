const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env
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

function normalizeBengali(str) {
  if (!str) return '';
  return String(str).normalize('NFC').trim();
}

const CANONICAL_CATEGORIES = [
  { id: 'novel', name: 'উপন্যাস', englishName: 'Novels', aliases: ['উপন্যাস', 'novel', 'novels'] },
  { id: 'thriller', name: 'থ্রিলার ও রহস্য', englishName: 'Thriller & Mystery', aliases: ['থ্রিলার ও রহস্য', 'গোয়েন্দা ও থ্রিলার', 'থ্রিলার', 'গোয়েন্দা', 'রহস্য', 'thriller'] },
  { id: 'islamic', name: 'ইসলামিক সাহিত্য', englishName: 'Islamic Literature', aliases: ['ইসলামিক সাহিত্য', 'ইসলামিক বই', 'ইসলামিক', 'islamic'] },
  { id: 'children', name: 'শিশু-কিশোর', englishName: 'Children & Teens', aliases: ['শিশু-কিশোর', 'কিশোর সাহিত্য', 'শিশু কিশোর', 'কিশোর', 'children'] },
  { id: 'poetry', name: 'কবিতা', englishName: 'Poetry', aliases: ['কবিতা', 'কবিতা ও সাহিত্য', 'poetry'] },
  { id: 'story', name: 'গল্প ও সাহিত্য', englishName: 'Short Stories', aliases: ['গল্প ও সাহিত্য', 'ছোটগল্প', 'story'] },
  { id: 'self-help', name: 'আত্মউন্নয়ন', englishName: 'Self Help & Motivation', aliases: ['আত্মউন্নয়ন', 'self-help'] },
  { id: 'history', name: 'ইতিহাস ও ঐতিহ্য', englishName: 'History & Culture', aliases: ['ইতিহাস ও ঐতিহ্য', 'ইতিহাস', 'history'] },
  { id: 'scifi', name: 'সায়েন্স ফিকশন', englishName: 'Sci-Fi & Fantasy', aliases: ['সায়েন্স ফিকশন', 'সায়েন্স ফিকশন', 'scifi'] },
  { id: 'english', name: 'ইংরেজি ও অনুবাদ', englishName: 'English & Translations', aliases: ['ইংরেজি ও অনুবাদ', 'বিদেশি বই', 'অনুবাদ সাহিত্য', 'অনুবাদ', 'english'] },
];

function matchesCategory(bookCategory, bookTags, filterCategory) {
  if (!filterCategory || filterCategory === 'all') return true;
  const normFilter = normalizeBengali(filterCategory).toLowerCase();
  const normBookCat = normalizeBengali(bookCategory).toLowerCase();
  const normTags = (bookTags || []).map((t) => normalizeBengali(t).toLowerCase());

  if (normBookCat && (normBookCat === normFilter || normBookCat.includes(normFilter) || normFilter.includes(normBookCat))) {
    return true;
  }
  if (normTags.some((t) => t === normFilter || t.includes(normFilter) || normFilter.includes(t))) {
    return true;
  }

  const foundDef = CANONICAL_CATEGORIES.find((def) => {
    if (def.id.toLowerCase() === normFilter) return true;
    if (normalizeBengali(def.name).toLowerCase() === normFilter) return true;
    if (def.englishName.toLowerCase() === normFilter) return true;
    return def.aliases.some((alias) => normalizeBengali(alias).toLowerCase() === normFilter);
  });

  if (foundDef) {
    const candidateNames = new Set();
    candidateNames.add(normalizeBengali(foundDef.name).toLowerCase());
    foundDef.aliases.forEach((a) => candidateNames.add(normalizeBengali(a).toLowerCase()));
    for (const name of candidateNames) {
      if (normBookCat && (normBookCat === name || normBookCat.includes(name) || name.includes(normBookCat))) return true;
      if (normTags.some((t) => t === name || t.includes(name) || name.includes(t))) return true;
    }
  }
  return false;
}

function matchesAuthor(bookAuthor, filterAuthor) {
  if (!filterAuthor || filterAuthor === 'all') return true;
  if (!bookAuthor) return false;

  const normBook = normalizeBengali(bookAuthor).toLowerCase();
  const normFilter = normalizeBengali(filterAuthor).toLowerCase();

  if (!normBook || !normFilter) return false;
  if (normBook === normFilter) return true;
  if (normBook.includes(normFilter) || normFilter.includes(normBook)) return true;

  const authorIdMap = {
    'author-humayun': 'হুমায়ূন আহমেদ',
    'author-rabindranath': 'রবীন্দ্রনাথ ঠাকুর',
    'author-nazrul': 'কাজী নজরুল ইসলাম',
    'author-satyajit': 'সত্যজিৎ রায়',
    'author-sunil': 'সুনীল গঙ্গোপাধ্যায়',
    'author-sharat': 'শরৎচন্দ্র চট্টোপাধ্যায়',
  };

  if (authorIdMap[filterAuthor]) {
    const canonicalName = normalizeBengali(authorIdMap[filterAuthor]).toLowerCase();
    if (normBook === canonicalName || normBook.includes(canonicalName)) {
      return true;
    }
  }

  return false;
}

async function runTests() {
  console.log('=== STARTING END-TO-END AUTHOR & CATEGORY TESTS ===\n');

  const testBookIdA = `test-book-a-${Date.now()}`;
  const testBookIdB = `test-book-b-${Date.now()}`;

  try {
    // -------------------------------------------------------------
    // TEST A: CREATE BOOK A (Author: হুমায়ূন আহমেদ, Category: উপন্যাস)
    // -------------------------------------------------------------
    console.log('[TEST A] Creating Book A (Author: হুমায়ূন আহমেদ, Category: উপন্যাস)...');
    const { data: bookA, error: errA } = await supabase.from('books').insert({
      id: testBookIdA,
      title: 'টেস্ট বই ক (Test Book A)',
      title_bn: 'টেস্ট বই ক',
      author: normalizeBengali('হুমায়ূন আহমেদ'),
      category: normalizeBengali('উপন্যাস'),
      price: 250,
      original_price: 300,
      stock: 10,
      image: 'https://example.com/cover-a.jpg',
      cover_image: 'https://example.com/cover-a.jpg',
      tags: ['উপন্যাস', 'হুমায়ূন আহমেদ'],
      section_ids: ['new-arrivals'],
    }).select('*').single();

    if (errA) throw new Error('Failed to insert Book A: ' + errA.message);
    console.log('✓ Book A inserted successfully in Supabase:', bookA.id);

    // Verify filter finds Book A under Author and Category
    const matchA_Author = matchesAuthor(bookA.author, 'হুমায়ূন আহমেদ');
    const matchA_AuthorDecomposed = matchesAuthor(bookA.author, 'হুমায়ূন আহমেদ'); // precomposed য়
    const matchA_AuthorId = matchesAuthor(bookA.author, 'author-humayun');
    const matchA_CategoryName = matchesCategory(bookA.category, bookA.tags, 'উপন্যাস');
    const matchA_CategoryId = matchesCategory(bookA.category, bookA.tags, 'novel');

    console.log('  Author filter match (exact):', matchA_Author);
    console.log('  Author filter match (alt unicode য়):', matchA_AuthorDecomposed);
    console.log('  Author filter match (author id):', matchA_AuthorId);
    console.log('  Category filter match (name "উপন্যাস"):', matchA_CategoryName);
    console.log('  Category filter match (id "novel"):', matchA_CategoryId);

    if (!matchA_Author || !matchA_AuthorDecomposed || !matchA_AuthorId || !matchA_CategoryName || !matchA_CategoryId) {
      throw new Error('TEST A failed: Book A was not found by author or category filter!');
    }
    console.log('✓ TEST A PASSED!\n');

    // -------------------------------------------------------------
    // TEST B: CREATE BOOK B (Author: সুনীল গঙ্গোপাধ্যায়, Category: থ্রিলার ও রহস্য)
    // -------------------------------------------------------------
    console.log('[TEST B] Creating Book B (Author: সুনীল গঙ্গোপাধ্যায়, Category: থ্রিলার ও রহস্য)...');
    const { data: bookB, error: errB } = await supabase.from('books').insert({
      id: testBookIdB,
      title: 'টেস্ট বই খ (Test Book B)',
      title_bn: 'টেস্ট বই খ',
      author: normalizeBengali('সুনীল গঙ্গোপাধ্যায়'),
      category: normalizeBengali('থ্রিলার ও রহস্য'),
      price: 350,
      original_price: 400,
      stock: 5,
      image: 'https://example.com/cover-b.jpg',
      cover_image: 'https://example.com/cover-b.jpg',
      tags: ['থ্রিলার ও রহস্য', 'সুনীল গঙ্গোপাধ্যায়'],
      section_ids: ['new-arrivals'],
    }).select('*').single();

    if (errB) throw new Error('Failed to insert Book B: ' + errB.message);
    console.log('✓ Book B inserted successfully in Supabase:', bookB.id);

    // Cross verification:
    // Book B must match Sunil and Thriller
    // Book B must NOT match Humayun or Novel
    const matchB_Sunil = matchesAuthor(bookB.author, 'সুনীল গঙ্গোপাধ্যায়');
    const matchB_Thriller = matchesCategory(bookB.category, bookB.tags, 'থ্রিলার ও রহস্য');
    const matchB_ThrillerId = matchesCategory(bookB.category, bookB.tags, 'thriller');
    const matchB_ThrillerAlias = matchesCategory(bookB.category, bookB.tags, 'গোয়েন্দা ও থ্রিলার');
    const matchB_Humayun = matchesAuthor(bookB.author, 'হুমায়ূন আহমেদ');
    const matchB_Novel = matchesCategory(bookB.category, bookB.tags, 'উপন্যাস');

    console.log('  Book B under Author Sunil:', matchB_Sunil);
    console.log('  Book B under Category "থ্রিলার ও রহস্য":', matchB_Thriller);
    console.log('  Book B under Category ID "thriller":', matchB_ThrillerId);
    console.log('  Book B under Category Alias "গোয়েন্দা ও থ্রিলার":', matchB_ThrillerAlias);
    console.log('  Book B under Author Humayun (should be false):', matchB_Humayun);
    console.log('  Book B under Category Novel (should be false):', matchB_Novel);

    if (!matchB_Sunil || !matchB_Thriller || !matchB_ThrillerId || !matchB_ThrillerAlias || matchB_Humayun || matchB_Novel) {
      throw new Error('TEST B failed: Cross-isolation failure for Book B!');
    }
    console.log('✓ TEST B PASSED!\n');

    // -------------------------------------------------------------
    // TEST C: EDIT AUTHOR (Book A: Humayun -> Sunil)
    // -------------------------------------------------------------
    console.log('[TEST C] Editing Book A: Author "হুমায়ূন আহমেদ" -> "সুনীল গঙ্গোপাধ্যায়"...');
    const { data: updatedBookA, error: errUpdateA } = await supabase.from('books').update({
      author: normalizeBengali('সুনীল গঙ্গোপাধ্যায়')
    }).eq('id', testBookIdA).select('*').single();

    if (errUpdateA) throw new Error('Failed to update Book A author: ' + errUpdateA.message);

    const bookA_nowHumayun = matchesAuthor(updatedBookA.author, 'হুমায়ূন আহমেদ');
    const bookA_nowSunil = matchesAuthor(updatedBookA.author, 'সুনীল গঙ্গোপাধ্যায়');

    console.log('  Book A still matches Humayun (should be false):', bookA_nowHumayun);
    console.log('  Book A now matches Sunil (should be true):', bookA_nowSunil);

    if (bookA_nowHumayun || !bookA_nowSunil) {
      throw new Error('TEST C failed: Edit author relationship did not update correctly!');
    }
    console.log('✓ TEST C PASSED!\n');

    // -------------------------------------------------------------
    // TEST D: EDIT CATEGORY (Book A: উপন্যাস -> ইংরেজি ও অনুবাদ)
    // -------------------------------------------------------------
    console.log('[TEST D] Editing Book A: Category "উপন্যাস" -> "ইংরেজি ও অনুবাদ"...');
    const { data: updatedCatA, error: errCatA } = await supabase.from('books').update({
      category: normalizeBengali('ইংরেজি ও অনুবাদ'),
      tags: ['ইংরেজি ও অনুবাদ', 'সুনীল গঙ্গোপাধ্যায়']
    }).eq('id', testBookIdA).select('*').single();

    if (errCatA) throw new Error('Failed to update Book A category: ' + errCatA.message);

    const bookA_nowNovel = matchesCategory(updatedCatA.category, updatedCatA.tags, 'উপন্যাস');
    const bookA_nowEnglishName = matchesCategory(updatedCatA.category, updatedCatA.tags, 'ইংরেজি ও অনুবাদ');
    const bookA_nowEnglishId = matchesCategory(updatedCatA.category, updatedCatA.tags, 'english');
    const bookA_nowEnglishAlias = matchesCategory(updatedCatA.category, updatedCatA.tags, 'বিদেশি বই');

    console.log('  Book A still matches Novel (should be false):', bookA_nowNovel);
    console.log('  Book A matches "ইংরেজি ও অনুবাদ" (should be true):', bookA_nowEnglishName);
    console.log('  Book A matches ID "english" (should be true):', bookA_nowEnglishId);
    console.log('  Book A matches alias "বিদেশি বই" (should be true):', bookA_nowEnglishAlias);

    if (bookA_nowNovel || !bookA_nowEnglishName || !bookA_nowEnglishId || !bookA_nowEnglishAlias) {
      throw new Error('TEST D failed: Edit category relationship did not update correctly!');
    }
    console.log('✓ TEST D PASSED!\n');

    // -------------------------------------------------------------
    // TEST E: REFRESH / DATA PERSISTENCE & IMAGE INTEGRITY
    // -------------------------------------------------------------
    console.log('[TEST E] Testing fresh fetch from database & image integrity...');
    const { data: freshList, error: errFresh } = await supabase.from('books').select('*').in('id', [testBookIdA, testBookIdB]);
    if (errFresh) throw new Error('Failed to re-fetch books: ' + errFresh.message);

    const freshA = freshList.find(b => b.id === testBookIdA);
    const freshB = freshList.find(b => b.id === testBookIdB);

    console.log('  Fresh Book A Image:', freshA.image, '| Cover Image:', freshA.cover_image);
    console.log('  Fresh Book B Image:', freshB.image, '| Cover Image:', freshB.cover_image);

    if (freshA.image !== 'https://example.com/cover-a.jpg' || freshB.image !== 'https://example.com/cover-b.jpg') {
      throw new Error('TEST E failed: Image data was corrupted or shared!');
    }
    console.log('✓ TEST E PASSED!\n');

    // -------------------------------------------------------------
    // TEST F: DELETE
    // -------------------------------------------------------------
    console.log('[TEST F] Deleting test books...');
    await supabase.from('books').delete().in('id', [testBookIdA, testBookIdB]);

    const { data: afterDelete } = await supabase.from('books').select('id').in('id', [testBookIdA, testBookIdB]);
    console.log('  Remaining test books in DB after delete:', afterDelete?.length);

    if (afterDelete && afterDelete.length > 0) {
      throw new Error('TEST F failed: Books still exist after delete!');
    }
    console.log('✓ TEST F PASSED!\n');

    console.log('==================================================');
    console.log('🎉 ALL END-TO-END TESTS (A through F) PASSED 100%!');
    console.log('==================================================');
  } catch (err) {
    console.error('❌ Test failure:', err.message);
    // Cleanup if necessary
    await supabase.from('books').delete().in('id', [testBookIdA, testBookIdB]);
    process.exit(1);
  }
}

runTests();

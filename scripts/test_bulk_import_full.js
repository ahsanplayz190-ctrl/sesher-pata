const fs = require('fs');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// 1. Load environment variables
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

function createAdminCookie() {
  const secret = env.ADMIN_SESSION_SECRET;
  const maxAgeSeconds = 3600;
  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: expiresAt })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `seshadmin_token=${payload}.${signature}`;
}

async function apiRequest(body, authorized = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (authorized) {
    headers['Cookie'] = createAdminCookie();
  }

  const res = await fetch('http://localhost:3000/api/admin/books/import', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 RUNNING BULK BOOK IMPORT FULL TEST SUITE');
  console.log('================================================================\n');

  // Check initial state
  const { count: initialCount } = await supabase.from('books').select('*', { count: 'exact', head: true });
  console.log(`[Initial Database State] Books in DB: ${initialCount}\n`);

  const createdTestIds = new Set();

  try {
    // -------------------------------------------------------------
    // Test 0: Security & Validation
    // -------------------------------------------------------------
    console.log('--- TEST 0: Security & Validation ---');
    const unauthRes = await apiRequest([{ title: 'Hack' }], false);
    if (unauthRes.status === 401) {
      console.log('✓ Unauthorized request correctly rejected (401)');
    } else {
      throw new Error(`Expected 401 for unauthorized request, got ${unauthRes.status}`);
    }

    const emptyRes = await apiRequest([]);
    if (emptyRes.status === 400) {
      console.log('✓ Empty array correctly rejected (400)');
    } else {
      throw new Error(`Expected 400 for empty array, got ${emptyRes.status}`);
    }

    const invalidRecRes = await apiRequest([
      { title: '' }, // missing title
      { title: 'বৈধ বই টেস্ট ০', price: 250, stock: 10, author: 'টেস্ট লেখক' }
    ]);
    if (invalidRecRes.ok && invalidRecRes.data.failed === 1 && invalidRecRes.data.imported === 1) {
      console.log('✓ Invalid record identified & reported; valid record successfully imported');
      if (invalidRecRes.data.failedRecords?.[0]?.reason) {
        console.log(`  Reported Reason: ${invalidRecRes.data.failedRecords[0].reason}`);
      }
    } else {
      throw new Error(`Invalid record handling failed: ${JSON.stringify(invalidRecRes.data)}`);
    }

    // -------------------------------------------------------------
    // Test A: Import 1 new book
    // -------------------------------------------------------------
    console.log('\n--- TEST A: Import 1 New Book ---');
    const bookAId = `test-import-1-${Date.now()}`;
    createdTestIds.add(bookAId);
    const testABook = {
      id: bookAId,
      title: 'টেস্ট বই এ (Test Book A)',
      author: 'লেখক এ',
      price: 350,
      original_price: 500,
      stock: 12,
      isbn: '978-984-TEST-01',
      image: 'https://example.com/cover-a.jpg',
      cover_image: 'https://example.com/cover-a.jpg',
      category: 'উপন্যাস',
      description: 'টেস্ট এ বিবরণ'
    };

    const resA = await apiRequest([testABook]);
    if (resA.ok && resA.data.imported === 1 && resA.data.failed === 0) {
      console.log('✓ API successfully reported 1 new book imported');
    } else {
      throw new Error(`Test A failed: ${JSON.stringify(resA.data)}`);
    }

    // Verify in database
    const { data: dbBookA } = await supabase.from('books').select('*').eq('id', bookAId).single();
    if (dbBookA && dbBookA.title === testABook.title && dbBookA.price === 350 && dbBookA.image === testABook.image) {
      console.log('✓ Supabase database verification confirmed: Book A saved accurately');
    } else {
      throw new Error(`Test A DB verification failed: ${JSON.stringify(dbBookA)}`);
    }

    // -------------------------------------------------------------
    // Test B: Import 5 new books
    // -------------------------------------------------------------
    console.log('\n--- TEST B: Import 5 New Books ---');
    const booksB = [];
    for (let i = 1; i <= 5; i++) {
      const id = `test-import-5-${i}-${Date.now()}`;
      createdTestIds.add(id);
      booksB.push({
        id,
        title: `টেস্ট বই বি-${i} (Test Book B-${i})`,
        author: `লেখক বি-${i}`,
        price: 200 + i * 20,
        stock: 5 + i,
        isbn: `978-984-TEST-B${i}`,
        image: `https://example.com/covers/b-${i}.jpg`,
        cover_image: `https://example.com/covers/b-${i}.jpg`,
        category: 'গল্পগ্রন্থ',
      });
    }

    const resB = await apiRequest(booksB);
    if (resB.ok && resB.data.imported === 5 && resB.data.failed === 0) {
      console.log('✓ API successfully reported 5 new books imported');
    } else {
      throw new Error(`Test B failed: ${JSON.stringify(resB.data)}`);
    }

    const { data: dbBooksB } = await supabase.from('books').select('id, title').in('id', booksB.map(b => b.id));
    if (dbBooksB && dbBooksB.length === 5) {
      console.log('✓ Supabase database verification confirmed: All 5 books saved in database');
    } else {
      throw new Error(`Test B DB verification failed. Found ${dbBooksB?.length} rows`);
    }

    // -------------------------------------------------------------
    // Test C: Import 50 new books
    // -------------------------------------------------------------
    console.log('\n--- TEST C: Import 50 New Books ---');
    const booksC = [];
    for (let i = 1; i <= 50; i++) {
      const id = `test-import-50-${i}-${Date.now()}`;
      createdTestIds.add(id);
      booksC.push({
        id,
        title: `৫০টি বই টেস্ট #${i}`,
        author: `লেখক সি-${i}`,
        price: 300 + (i % 10) * 15,
        stock: 10 + (i % 5),
        isbn: `978-984-50-${i}-${Date.now()}`,
        image: `https://example.com/covers/c-${i}.jpg`,
        cover_image: `https://example.com/covers/c-${i}.jpg`,
        category: 'কবিতা',
      });
    }

    const resC = await apiRequest(booksC);
    if (resC.ok && resC.data.imported === 50 && resC.data.failed === 0) {
      console.log(`✓ API successfully processed 50 books in bulk (${resC.data.imported} imported, ${resC.data.failed} failed)`);
    } else {
      throw new Error(`Test C failed: ${JSON.stringify(resC.data)}`);
    }

    const { data: dbBooksC } = await supabase.from('books').select('id').in('id', booksC.map(b => b.id));
    if (dbBooksC && dbBooksC.length === 50) {
      console.log('✓ Supabase database verification confirmed: Exactly 50 new books persisted');
    } else {
      throw new Error(`Test C DB verification failed. Expected 50 rows, found ${dbBooksC?.length}`);
    }

    // -------------------------------------------------------------
    // Test D: Import 100 new books
    // -------------------------------------------------------------
    console.log('\n--- TEST D: Import 100 New Books ---');
    const booksD = [];
    for (let i = 1; i <= 100; i++) {
      const id = `test-import-100-${i}-${Date.now()}`;
      createdTestIds.add(id);
      booksD.push({
        id,
        title: `১০০টি বই মেগা টেস্ট #${i}`,
        author: `লেখক ডি-${i}`,
        price: 250 + (i % 20) * 10,
        original_price: 400 + (i % 20) * 10,
        discount: 20,
        stock: 15,
        isbn: `978-984-100-${i}-${Date.now()}`,
        image: `https://example.com/covers/d-${i}.jpg`,
        cover_image: `https://example.com/covers/d-${i}.jpg`,
        category: 'উপন্যাস',
      });
    }

    const resD = await apiRequest(booksD);
    if (resD.ok && resD.data.imported === 100 && resD.data.failed === 0) {
      console.log(`✓ API successfully processed 100 books in bulk (${resD.data.imported} imported, ${resD.data.failed} failed)`);
    } else {
      throw new Error(`Test D failed: ${JSON.stringify(resD.data)}`);
    }

    const { data: dbBooksD } = await supabase.from('books').select('id').in('id', booksD.map(b => b.id));
    if (dbBooksD && dbBooksD.length === 100) {
      console.log('✓ Supabase database verification confirmed: Exactly 100 new books persisted');
    } else {
      throw new Error(`Test D DB verification failed. Expected 100 rows, found ${dbBooksD?.length}`);
    }

    // -------------------------------------------------------------
    // Test E: Duplicate Test (Re-importing the same 100 books)
    // -------------------------------------------------------------
    console.log('\n--- TEST E: Duplicate Protection (Re-importing same 100 books) ---');
    const { count: countBeforeE } = await supabase.from('books').select('*', { count: 'exact', head: true });

    // Modify the books with updated prices to verify updates
    const modifiedBooksD = booksD.map(b => ({
      ...b,
      price: 888, // updated price
    }));

    const resE = await apiRequest(modifiedBooksD);
    if (resE.ok && resE.data.imported === 0 && resE.data.updated === 100) {
      console.log(`✓ Duplicate Protection Confirmed: 0 new books, 100 updated books`);
    } else {
      throw new Error(`Test E failed: ${JSON.stringify(resE.data)}`);
    }

    const { count: countAfterE } = await supabase.from('books').select('*', { count: 'exact', head: true });
    if (countBeforeE === countAfterE) {
      console.log(`✓ Supabase row count before (${countBeforeE}) == after (${countAfterE}). No unwanted duplicates!`);
    } else {
      throw new Error(`Duplicate rows created! Before: ${countBeforeE}, After: ${countAfterE}`);
    }

    // Verify price updated
    const { data: sampleUpdated } = await supabase.from('books').select('price').eq('id', booksD[0].id).single();
    if (sampleUpdated && Number(sampleUpdated.price) === 888) {
      console.log('✓ Supabase records successfully updated with new price (৳888)');
    } else {
      throw new Error(`Test E update check failed: ${JSON.stringify(sampleUpdated)}`);
    }

    // -------------------------------------------------------------
    // Test F: Mixed Import (Existing + New Books)
    // -------------------------------------------------------------
    console.log('\n--- TEST F: Mixed Import (10 Existing + 10 New Books) ---');
    const existing10 = booksD.slice(0, 10).map(b => ({ ...b, price: 999 }));
    const new10 = [];
    for (let i = 1; i <= 10; i++) {
      const id = `test-import-mixed-new-${i}-${Date.now()}`;
      createdTestIds.add(id);
      new10.push({
        id,
        title: `নতুন বই মিক্সড #${i}`,
        price: 450,
        stock: 8,
        author: 'মিক্সড লেখক',
      });
    }

    const mixedPayload = [...existing10, ...new10];
    const resF = await apiRequest(mixedPayload);
    if (resF.ok && resF.data.imported === 10 && resF.data.updated === 10) {
      console.log('✓ Mixed import processed accurately: 10 new inserted, 10 existing updated');
    } else {
      throw new Error(`Test F failed: ${JSON.stringify(resF.data)}`);
    }

    // -------------------------------------------------------------
    // Test G: Individual Images Integrity (No Sharing)
    // -------------------------------------------------------------
    console.log('\n--- TEST G: Individual Image & Cover Retention ---');
    const imgId1 = `test-img-alpha-${Date.now()}`;
    const imgId2 = `test-img-beta-${Date.now()}`;
    const imgId3 = `test-img-gamma-${Date.now()}`;
    createdTestIds.add(imgId1);
    createdTestIds.add(imgId2);
    createdTestIds.add(imgId3);

    const imgBooks = [
      {
        id: imgId1,
        title: 'বই আলফা (Alpha)',
        image: 'book-covers/cover-alpha-unique.jpg',
        cover_image: 'book-covers/cover-alpha-unique.jpg',
        price: 300,
        stock: 5,
      },
      {
        id: imgId2,
        title: 'বই বিটা (Beta)',
        image: 'book-covers/cover-beta-unique.jpg',
        cover_image: 'book-covers/cover-beta-unique.jpg',
        price: 310,
        stock: 5,
      },
      {
        id: imgId3,
        title: 'বই গামা (Gamma)',
        image: 'book-covers/cover-gamma-unique.jpg',
        cover_image: 'book-covers/cover-gamma-unique.jpg',
        price: 320,
        stock: 5,
      }
    ];

    const resG = await apiRequest(imgBooks);
    if (!resG.ok) throw new Error(`Test G failed: ${JSON.stringify(resG.data)}`);

    const { data: dbImgRows } = await supabase
      .from('books')
      .select('id, title, image, cover_image')
      .in('id', [imgId1, imgId2, imgId3]);

    const row1 = dbImgRows.find(r => r.id === imgId1);
    const row2 = dbImgRows.find(r => r.id === imgId2);
    const row3 = dbImgRows.find(r => r.id === imgId3);

    console.log(`- Book 1 Image: ${row1.image}`);
    console.log(`- Book 2 Image: ${row2.image}`);
    console.log(`- Book 3 Image: ${row3.image}`);

    if (
      row1.image === 'book-covers/cover-alpha-unique.jpg' &&
      row2.image === 'book-covers/cover-beta-unique.jpg' &&
      row3.image === 'book-covers/cover-gamma-unique.jpg' &&
      row1.image !== row2.image &&
      row2.image !== row3.image
    ) {
      console.log('✓ Images are 100% individual and distinct! No image-sharing or mutation bug detected.');
    } else {
      throw new Error(`Image isolation failed: ${JSON.stringify(dbImgRows)}`);
    }

    console.log('\n================================================================');
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
    console.log('================================================================\n');

  } finally {
    // -------------------------------------------------------------
    // Cleanup Test Data to leave database clean
    // -------------------------------------------------------------
    console.log(`[Database Cleanup] Removing ${createdTestIds.size} temporary test books...`);
    const idList = Array.from(createdTestIds);
    // Delete in batches of 50
    for (let i = 0; i < idList.length; i += 50) {
      const slice = idList.slice(i, i + 50);
      await supabase.from('books').delete().in('id', slice);
    }
    // Also remove the test 0 book if created
    await supabase.from('books').delete().like('title', '%টেস্ট বই%');

    const { count: finalCount } = await supabase.from('books').select('*', { count: 'exact', head: true });
    console.log(`[Final Clean State] Books count restored to: ${finalCount} (Initial: ${initialCount})`);
  }
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED WITH EXCEPTION:', err);
  process.exit(1);
});

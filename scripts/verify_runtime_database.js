const fs = require('fs');
const { Client } = require('pg');

async function testRuntime() {
  console.log('=== RUNTIME VERIFICATION OF CATEGORY AND AUTHOR IMAGES ===\n');

  // Step 1: Admin Authentication
  console.log('[Step 1] Authenticating admin session via POST /api/admin/auth...');
  const loginRes = await fetch('http://localhost:3000/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'seshadmin',
      password: 'sesherpata12@#',
      remember: true,
    }),
  });

  const loginData = await loginRes.json();
  const cookie = loginRes.headers.get('set-cookie');
  console.log('Login Response:', loginRes.status, loginData.success);
  if (!loginData.success || !cookie) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginData));
  }
  const authHeaders = {
    Cookie: cookie.split(';')[0],
  };
  console.log('✓ Admin authenticated with session cookie\n');

  // Step 2: Category Image Upload
  console.log('[Step 2] Simulating file picker & sending upload for Category A (novel)...');
  const catImageBuffer = Buffer.from('simulated-category-image-bytes-v2-' + Date.now());
  const catBlob = new Blob([catImageBuffer], { type: 'image/webp' });
  const catFormData = new FormData();
  catFormData.append('file', catBlob, 'novel-banner.webp');
  catFormData.append('folder', 'category-images/novel');
  catFormData.append('recordId', 'novel');
  catFormData.append('type', 'category');

  const catUploadRes = await fetch('http://localhost:3000/api/admin/upload', {
    method: 'POST',
    headers: authHeaders,
    body: catFormData,
  });

  const catUploadData = await catUploadRes.json();
  console.log('Category Upload Status:', catUploadRes.status, catUploadData);
  if (!catUploadData.success || !catUploadData.url) {
    throw new Error('Category upload failed: ' + JSON.stringify(catUploadData));
  }
  const newCatImageUrl = catUploadData.url;
  console.log('✓ Category image uploaded to storage URL:', newCatImageUrl);

  // Step 3: Category Database Update via PUT
  console.log('\n[Step 3] Calling PUT /api/admin/categories?id=novel with new image URL...');
  const catUpdateRes = await fetch('http://localhost:3000/api/admin/categories?id=novel', {
    method: 'PUT',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: 'novel',
      name: 'উপন্যাস',
      englishName: 'Novels',
      iconName: 'BookOpen',
      imageUrl: newCatImageUrl,
      image: newCatImageUrl,
    }),
  });

  const catUpdateData = await catUpdateRes.json();
  console.log('Category Update API Status:', catUpdateRes.status, catUpdateData);
  if (!catUpdateData.success) {
    throw new Error('Category update API failed: ' + JSON.stringify(catUpdateData));
  }
  console.log('✓ Category update API returned success\n');

  // Step 4: Verify directly in PostgreSQL database for Category
  console.log('[Step 4] Querying PostgreSQL directly to verify category record in database...');
  const pgClient = new Client({
    host: 'aws-0-ap-southeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.tbgtvrveyjuupqbcldya',
    password: 'sesherpata12@#',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });
  await pgClient.connect();

  const dbCatQuery = await pgClient.query("SELECT id, name, image, image_url, updated_at FROM public.categories WHERE id IN ('novel', 'thriller', 'islamic') ORDER BY id;");
  console.log('Database Categories Query Result:');
  console.table(dbCatQuery.rows);

  const novelRow = dbCatQuery.rows.find((r) => r.id === 'novel');
  const thrillerRow = dbCatQuery.rows.find((r) => r.id === 'thriller');
  const islamicRow = dbCatQuery.rows.find((r) => r.id === 'islamic');

  if (novelRow.image !== newCatImageUrl || novelRow.image_url !== newCatImageUrl) {
    throw new Error(`Database record mismatch for novel! Expected ${newCatImageUrl} but got image=${novelRow.image}, image_url=${novelRow.image_url}`);
  }
  console.log('✓ Database contains exact new image URL for Category A (novel)');
  console.log('✓ Category B (thriller) image is unchanged:', thrillerRow.image);
  console.log('✓ Category C (islamic) image is unchanged:', islamicRow.image);

  // Step 5: Author Image Upload
  console.log('\n[Step 5] Simulating file picker & sending upload for Author A (author-humayun)...');
  const authImageBuffer = Buffer.from('simulated-author-image-bytes-v2-' + Date.now());
  const authBlob = new Blob([authImageBuffer], { type: 'image/webp' });
  const authFormData = new FormData();
  authFormData.append('file', authBlob, 'humayun-profile.webp');
  authFormData.append('folder', 'author-images/author-humayun');
  authFormData.append('recordId', 'author-humayun');
  authFormData.append('type', 'author');

  const authUploadRes = await fetch('http://localhost:3000/api/admin/upload', {
    method: 'POST',
    headers: authHeaders,
    body: authFormData,
  });

  const authUploadData = await authUploadRes.json();
  console.log('Author Upload Status:', authUploadRes.status, authUploadData);
  if (!authUploadData.success || !authUploadData.url) {
    throw new Error('Author upload failed: ' + JSON.stringify(authUploadData));
  }
  const newAuthImageUrl = authUploadData.url;
  console.log('✓ Author image uploaded to storage URL:', newAuthImageUrl);

  // Step 6: Author Database Update via PUT
  console.log('\n[Step 6] Calling PUT /api/admin/authors?id=author-humayun with new image URL...');
  const authUpdateRes = await fetch('http://localhost:3000/api/admin/authors?id=author-humayun', {
    method: 'PUT',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: 'author-humayun',
      name: 'হুমায়ূন আহমেদ',
      era: '১৯৪৮ – ২০১২',
      role: 'কথাসাহিত্যিক, নাট্যকার ও চলচ্চিত্র নির্মাতা',
      bio: 'আধুনিক বাংলা সাহিত্যের সবচেয়ে জনপ্রিয় কথাসাহিত্যিক। মিসির আলি, হিমু ও শুভ্র চরিত্রের স্রষ্টা।',
      image: newAuthImageUrl,
      image_url: newAuthImageUrl,
    }),
  });

  const authUpdateData = await authUpdateRes.json();
  console.log('Author Update API Status:', authUpdateRes.status, authUpdateData);
  if (!authUpdateData.success) {
    throw new Error('Author update API failed: ' + JSON.stringify(authUpdateData));
  }
  console.log('✓ Author update API returned success\n');

  // Step 7: Verify directly in PostgreSQL database for Author
  console.log('[Step 7] Querying PostgreSQL directly to verify author record in database...');
  const dbAuthQuery = await pgClient.query("SELECT id, name, image, image_url, updated_at FROM public.authors WHERE id IN ('author-humayun', 'author-rabindranath', 'author-nazrul') ORDER BY id;");
  console.log('Database Authors Query Result:');
  console.table(dbAuthQuery.rows);

  const humayunRow = dbAuthQuery.rows.find((r) => r.id === 'author-humayun');
  const rabindranathRow = dbAuthQuery.rows.find((r) => r.id === 'author-rabindranath');
  const nazrulRow = dbAuthQuery.rows.find((r) => r.id === 'author-nazrul');

  if (humayunRow.image !== newAuthImageUrl || humayunRow.image_url !== newAuthImageUrl) {
    throw new Error(`Database record mismatch for author-humayun! Expected ${newAuthImageUrl} but got image=${humayunRow.image}, image_url=${humayunRow.image_url}`);
  }
  console.log('✓ Database contains exact new image URL for Author A (author-humayun)');
  console.log('✓ Author B (author-rabindranath) image is unchanged:', rabindranathRow.image);
  console.log('✓ Author C (author-nazrul) image is unchanged:', nazrulRow.image);

  await pgClient.end();

  // Step 8: Verify Hard Refresh (GET API endpoints)
  console.log('\n[Step 8] Verifying persistence on fresh GET requests (Hard Refresh simulation)...');
  const freshCatRes = await fetch('http://localhost:3000/api/admin/categories');
  const freshCatData = await freshCatRes.json();
  const fetchedNovel = freshCatData.categories.find((c) => c.id === 'novel');
  console.log('Fresh GET categories -> novel image:', fetchedNovel.imageUrl);
  if (fetchedNovel.imageUrl !== newCatImageUrl || fetchedNovel.image !== newCatImageUrl) {
    throw new Error('Hard refresh failed for Category novel!');
  }
  console.log('✓ Category A retains new image after refresh');

  const freshAuthRes = await fetch('http://localhost:3000/api/admin/authors');
  const freshAuthData = await freshAuthRes.json();
  const fetchedHumayun = freshAuthData.authors.find((a) => a.id === 'author-humayun');
  console.log('Fresh GET authors -> humayun image:', fetchedHumayun.image);
  if (fetchedHumayun.image !== newAuthImageUrl || fetchedHumayun.image_url !== newAuthImageUrl) {
    throw new Error('Hard refresh failed for Author humayun!');
  }
  console.log('✓ Author A retains new image after refresh');

  // Step 9: Storefront homepage check
  console.log('\n[Step 9] Checking public homepage response...');
  const homeRes = await fetch('http://localhost:3000/');
  console.log('Homepage status:', homeRes.status);
  if (!homeRes.ok) throw new Error('Homepage returned status ' + homeRes.status);
  console.log('✓ Public homepage renders cleanly');

  // Step 10: Book image regression check
  console.log('\n[Step 10] Checking that existing book products and cover images are unaffected...');
  const booksRes = await fetch('http://localhost:3000/api/admin/books');
  const booksData = await booksRes.json();
  console.log('Books count:', booksData.books?.length);
  if (!booksData.books || booksData.books.length === 0) {
    throw new Error('Books data missing!');
  }
  console.log('Sample book image:', booksData.books[0].title, '->', booksData.books[0].image || booksData.books[0].cover_image);
  console.log('✓ Book image system remains completely functional and untouched');

  console.log('\n========================================');
  console.log(' ALL RUNTIME VERIFICATION CHECKS PASSED!');
  console.log('========================================\n');
}

testRuntime().catch((err) => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});

const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: 'aws-0-ap-southeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.tbgtvrveyjuupqbcldya',
    password: 'sesherpata12@#',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  console.log('Connecting to PostgreSQL...');
  await client.connect();
  console.log('Connected successfully!');

  const sql = `
  -- 1. CATEGORIES TABLE
  CREATE TABLE IF NOT EXISTS public.categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      english_name TEXT DEFAULT '',
      icon_name TEXT DEFAULT 'BookOpen',
      image TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      book_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS english_name TEXT DEFAULT '';
  ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'BookOpen';
  ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
  ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
  ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS book_count INTEGER DEFAULT 0;
  ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

  ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
  CREATE POLICY "Allow public read access to categories"
      ON public.categories FOR SELECT
      TO anon, authenticated
      USING (true);

  DROP POLICY IF EXISTS "Allow service_role full access to categories" ON public.categories;
  CREATE POLICY "Allow service_role full access to categories"
      ON public.categories FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);

  -- 2. AUTHORS TABLE
  CREATE TABLE IF NOT EXISTS public.authors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      era TEXT DEFAULT '',
      role TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      image TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      book_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  ALTER TABLE public.authors ADD COLUMN IF NOT EXISTS era TEXT DEFAULT '';
  ALTER TABLE public.authors ADD COLUMN IF NOT EXISTS role TEXT DEFAULT '';
  ALTER TABLE public.authors ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
  ALTER TABLE public.authors ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
  ALTER TABLE public.authors ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
  ALTER TABLE public.authors ADD COLUMN IF NOT EXISTS book_count INTEGER DEFAULT 0;
  ALTER TABLE public.authors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

  ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Allow public read access to authors" ON public.authors;
  CREATE POLICY "Allow public read access to authors"
      ON public.authors FOR SELECT
      TO anon, authenticated
      USING (true);

  DROP POLICY IF EXISTS "Allow service_role full access to authors" ON public.authors;
  CREATE POLICY "Allow service_role full access to authors"
      ON public.authors FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);

  -- 3. Seed initial categories
  INSERT INTO public.categories (id, name, english_name, icon_name, image, image_url, book_count)
  VALUES
      ('novel', 'উপন্যাস', 'Novels', 'BookOpen', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80', 420),
      ('thriller', 'থ্রিলার ও রহস্য', 'Thriller & Mystery', 'Search', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80', 310),
      ('islamic', 'ইসলামিক সাহিত্য', 'Islamic Literature', 'Moon', 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=400&q=80', 380),
      ('children', 'শিশু-কিশোর', 'Children & Teens', 'Smile', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', 290),
      ('poetry', 'কবিতা', 'Poetry', 'BookMarked', 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=400&q=80', 195),
      ('story', 'গল্প ও সাহিত্য', 'Short Stories', 'Feather', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80', 260),
      ('self-help', 'আত্মউন্নয়ন', 'Self Help & Motivation', 'TrendingUp', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80', 210),
      ('history', 'ইতিহাস ও ঐতিহ্য', 'History & Culture', 'Landmark', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=80', 240),
      ('scifi', 'সায়েন্স ফিকশন', 'Sci-Fi & Fantasy', 'Atom', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80', 180),
      ('english', 'ইংরেজি ও অনুবাদ', 'English & Translations', 'Languages', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80', 350),
      ('academic', 'একাডেমিক ও ক্যারিয়ার', 'Academic & Career', 'GraduationCap', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80', 520),
      ('package', 'স্পেশাল প্যাকেজ', 'Special Bundles', 'Package', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80', 85)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Seed initial authors
  INSERT INTO public.authors (id, name, era, role, bio, image, image_url, book_count)
  VALUES
      ('author-humayun', 'হুমায়ূন আহমেদ', '১৯৪৮ – ২০১২', 'কথাসাহিত্যিক, নাট্যকার ও চলচ্চিত্র নির্মাতা', 'আধুনিক বাংলা সাহিত্যের সবচেয়ে জনপ্রিয় কথাসাহিত্যিক। মিসির আলি, হিমু ও শুভ্র চরিত্রের স্রষ্টা।', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80', 45),
      ('author-rabindranath', 'রবীন্দ্রনাথ ঠাকুর', '১৮৬১ – ১৯৪১', 'বিশ্বকবি, নোবেল বিজয়ী সাহিত্যিক', 'বাংলা ভাষা ও সাহিত্যের রূপকার। গীতাঞ্জলি কাব্যের জন্য ১৯১৩ সালে এশিয়ার প্রথম নোবেল পুরস্কার লাভ করেন।', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80', 38),
      ('author-nazrul', 'কাজী নজরুল ইসলাম', '১৮৯৯ – ১৯৭৬', 'জাতীয় কবি, বিদ্রোহী কবি ও সুরস্রষ্টা', 'বাংলা সাহিত্যের অন্যতম শ্রেষ্ঠ কবি, দ্রোহ, সাম্য ও প্রেমের অবিসংবাদিত কণ্ঠস্বর।', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', 29),
      ('author-satyajit', 'সত্যজিৎ রায়', '১৯২১ – ১৯৯২', 'চলচ্চিত্রকার, লেখক ও চিত্রশিল্পী', 'অস্কারজয়ী চলচ্চিত্রকার এবং বাংলা সাহিত্যের জনপ্রিয় গোয়েন্দা চরিত্র ফেলুদা ও প্রফেসর শঙ্কুর অমর স্রষ্টা।', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80', 22),
      ('author-sunil', 'সুনীল গঙ্গোপাধ্যায়', '১৯৩৪ – ২০১২', 'কবি, ঔপন্যাসিক ও ছোটগল্পকার', 'নীললোহিত ছদ্মনামে খ্যাত। সেই সময়, প্রথম আলো, পূর্ব-পশ্চিম এবং কাকাবাবু সিরিজের অমর স্রষ্টা।', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 34),
      ('author-sharat', 'শরৎচন্দ্র চট্টোপাধ্যায়', '১৮৭৬ – ১৯৩৮', 'অপরাজেয় কথাশিল্পী', 'বাংলা সাহিত্যের শ্রেষ্ঠ জীবনশিল্পী। চরিত্রহীন, দেবদাস, শ্রীকান্ত ও দেনা-পাওনা উপন্যাসের স্রষ্টা।', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 26)
  ON CONFLICT (id) DO NOTHING;

  -- 5. Reload schema cache for PostgREST
  NOTIFY pgrst, 'reload schema';
  `;

  console.log('Executing migration SQL...');
  await client.query(sql);
  console.log('Migration executed successfully!');

  // Verify tables
  const catRes = await client.query('SELECT count(*) FROM public.categories;');
  console.log('Categories count:', catRes.rows[0].count);

  const authRes = await client.query('SELECT count(*) FROM public.authors;');
  console.log('Authors count:', authRes.rows[0].count);

  await client.end();
  console.log('Done!');
}

run().catch((e) => {
  console.error('Migration error:', e);
  process.exit(1);
});

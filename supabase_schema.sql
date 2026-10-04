-- ==============================================================================
-- শেষের পাতা (Sesher Pata) — Complete & Final Supabase SQL Migration
-- ==============================================================================
-- Run this in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- 
-- Safe, non-destructive, and 100% idempotent:
-- 1. Creates/Updates `public.books` table without dropping any existing data.
-- 2. Creates/Updates `public.profiles` table with foreign key to `auth.users(id)`.
-- 3. Creates/Updates `public.site_settings` table and seeds default store configuration.
-- 4. Establishes secure Row Level Security (RLS) policies for books, profiles, and settings.
-- 5. Configures Supabase Realtime publication for multi-client book synchronization.
-- 6. Configures Supabase Storage buckets (book-covers, book-banners, book-files) & policies.
-- 7. Configures automated PostgreSQL triggers for updated_at timestamps & user signups.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. BOOKS TABLE & PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.books (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    title_bn TEXT,
    bangla_name TEXT,
    english_name TEXT,
    author TEXT,
    publisher TEXT DEFAULT 'বাতিঘর',
    category TEXT DEFAULT 'উপন্যাস',
    description TEXT DEFAULT '',
    description_bn TEXT DEFAULT '',
    image TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    banner_image TEXT DEFAULT '',
    pdf_url TEXT DEFAULT '',
    gallery JSONB DEFAULT '[]'::jsonb,
    price NUMERIC NOT NULL DEFAULT 0,
    original_price NUMERIC DEFAULT 0,
    old_price NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    isbn TEXT DEFAULT '',
    pages INTEGER DEFAULT 0,
    edition TEXT DEFAULT '১ম সংস্করণ',
    language TEXT DEFAULT 'বাংলা',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_bestseller BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    is_new_release BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    is_international BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'published',
    section_ids TEXT[] DEFAULT ARRAY['new-arrivals']::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all required columns exist safely if table already existed prior to migration
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS title_bn TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS bangla_name TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS english_name TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS publisher TEXT DEFAULT 'বাতিঘর';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'উপন্যাস';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS description_bn TEXT DEFAULT '';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT '';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS banner_image TEXT DEFAULT '';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS pdf_url TEXT DEFAULT '';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT 0;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS old_price NUMERIC DEFAULT 0;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 5.0;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS isbn TEXT DEFAULT '';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS pages INTEGER DEFAULT 0;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS edition TEXT DEFAULT '১ম সংস্করণ';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'বাংলা';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_new_release BOOLEAN DEFAULT false;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_international BOOLEAN DEFAULT false;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS section_ids TEXT[] DEFAULT ARRAY['new-arrivals']::TEXT[];
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Performance Indexes for books catalog filtering and sorting
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_books_is_active ON public.books(is_active);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_price ON public.books(price);
CREATE INDEX IF NOT EXISTS idx_books_featured ON public.books(is_featured);
CREATE INDEX IF NOT EXISTS idx_books_bestseller ON public.books(is_bestseller);

-- Automatic updated_at trigger for books
CREATE OR REPLACE FUNCTION public.update_books_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_books_updated_at ON public.books;
CREATE TRIGGER trigger_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW
    EXECUTE FUNCTION public.update_books_updated_at();

-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) FOR BOOKS
-- ------------------------------------------------------------------------------

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Public users (anonymous visitors and customers) can read published active books
DROP POLICY IF EXISTS "Allow public read access to books" ON public.books;
CREATE POLICY "Allow public read access to books"
    ON public.books
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR is_active IS NULL);

-- Service role has full control for backend admin operations (Add/Edit/Delete)
DROP POLICY IF EXISTS "Allow service_role full access to books" ON public.books;
CREATE POLICY "Allow service_role full access to books"
    ON public.books
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. SUPABASE REALTIME CONFIGURATION FOR BOOKS
-- ------------------------------------------------------------------------------

-- Ensure full row representation is provided on UPDATE and DELETE payloads
ALTER TABLE public.books REPLICA IDENTITY FULL;

-- Register public.books table into the supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'books'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.books;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. USER PROFILES TABLE & SIGNUP TRIGGER
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all profile columns exist safely
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Performance index for profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view ONLY their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Policy: Authenticated users can update ONLY their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Authenticated users can insert their own profile record if missing
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy: Service role has administrative access for backend management
DROP POLICY IF EXISTS "Service role manage profiles" ON public.profiles;
CREATE POLICY "Service role manage profiles"
    ON public.profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Automatic updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_profiles_updated_at();

-- Secure trigger function to automatically populate public.profiles upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO UPDATE SET
        name = CASE 
            WHEN EXCLUDED.name IS NOT NULL AND EXCLUDED.name <> '' THEN EXCLUDED.name 
            ELSE public.profiles.name 
        END,
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 5. SITE SETTINGS TABLE (STORE CONFIGURATION)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default_settings',
    meta_pixel_id TEXT DEFAULT '',
    meta_pixel_enabled BOOLEAN DEFAULT FALSE,
    phone TEXT DEFAULT '০১৭০০-০০০০০০',
    alt_phone TEXT DEFAULT '০১৯০০-০০০০০০',
    email TEXT DEFAULT 'support@shesherpata.com',
    address TEXT DEFAULT 'কাঁটাবন বইয়ের মার্কেট, নিউ এলিফ্যান্ট রোড, ঢাকা-১২০৫',
    support_hours TEXT DEFAULT 'প্রতিদিন সকাল ৯টা হতে রাত ১০টা পর্যন্ত',
    announcement_badge TEXT DEFAULT 'অফার',
    announcement_text TEXT DEFAULT 'বইমেলা বিশেষ ছাড় — SHESHER10 কুপনে অতিরিক্ত ১০% ছাড়!',
    about_text TEXT DEFAULT '"শেষের পাতা" কেবল একটি অনলাইন বইয়ের দোকান নয়, এটি প্রতিটি বইপ্রেমীর মনের একটি শান্তির আঙিনা। আমরা বিশ্বাস করি একটি ভালো বই একজন মানুষের জীবন বদলে দিতে পারে।',
    facebook_url TEXT DEFAULT 'https://facebook.com',
    instagram_url TEXT DEFAULT 'https://instagram.com',
    whatsapp_number TEXT DEFAULT '',
    steadfast_enabled BOOLEAN DEFAULT FALSE,
    delivery_charge_inside NUMERIC DEFAULT 60,
    delivery_charge_outside NUMERIC DEFAULT 120,
    free_delivery_threshold NUMERIC DEFAULT 1500,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure newly added settings columns exist safely
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '০১৭০০-০০০০০০';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS alt_phone TEXT DEFAULT '০১৯০০-০০০০০০';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS email TEXT DEFAULT 'support@shesherpata.com';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS address TEXT DEFAULT 'কাঁটাবন বইয়ের মার্কেট, নিউ এলিফ্যান্ট রোড, ঢাকা-১২০৫';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS support_hours TEXT DEFAULT 'প্রতিদিন সকাল ৯টা হতে রাত ১০টা পর্যন্ত';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS announcement_badge TEXT DEFAULT 'অফার';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS announcement_text TEXT DEFAULT 'বইমেলা বিশেষ ছাড় — SHESHER10 কুপনে অতিরিক্ত ১০% ছাড়!';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS about_text TEXT DEFAULT '"শেষের পাতা" কেবল একটি অনলাইন বইয়ের দোকান নয়, এটি প্রতিটি বইপ্রেমীর মনের একটি শান্তির আঙিনা। আমরা বিশ্বাস করি একটি ভালো বই একজন মানুষের জীবন বদলে দিতে পারে।';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facebook_url TEXT DEFAULT 'https://facebook.com';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT DEFAULT 'https://instagram.com';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS steadfast_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS delivery_charge_inside NUMERIC DEFAULT 60;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS delivery_charge_outside NUMERIC DEFAULT 120;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS free_delivery_threshold NUMERIC DEFAULT 1500;

-- Insert initial default settings row if it doesn't exist
INSERT INTO public.site_settings (
    id, meta_pixel_id, meta_pixel_enabled,
    phone, alt_phone, email, address, support_hours,
    announcement_badge, announcement_text, about_text,
    facebook_url, instagram_url, whatsapp_number,
    updated_at
)
VALUES (
    'default_settings', '', false,
    '০১৭০০-০০০০০০', '০১৯০০-০০০০০০', 'support@shesherpata.com',
    'কাঁটাবন বইয়ের মার্কেট, নিউ এলিফ্যান্ট রোড, ঢাকা-১২০৫', 'প্রতিদিন সকাল ৯টা হতে রাত ১০টা পর্যন্ত',
    'অফার', 'বইমেলা বিশেষ ছাড় — SHESHER10 কুপনে অতিরিক্ত ১০% ছাড়!',
    '"শেষের পাতা" কেবল একটি অনলাইন বইয়ের দোকান নয়, এটি প্রতিটি বইপ্রেমীর মনের একটি শান্তির আঙিনা। আমরা বিশ্বাস করি একটি ভালো বই একজন মানুষের জীবন বদলে দিতে পারে।',
    'https://facebook.com', 'https://instagram.com', '',
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO NOTHING;

-- Site settings RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to site_settings" ON public.site_settings;
CREATE POLICY "Allow public read access to site_settings"
    ON public.site_settings
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow service_role full access to site_settings" ON public.site_settings;
CREATE POLICY "Allow service_role full access to site_settings"
    ON public.site_settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Automatic updated_at trigger for site_settings
CREATE OR REPLACE FUNCTION public.update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trigger_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_site_settings_updated_at();

-- ------------------------------------------------------------------------------
-- 5.1. STEADFAST COURIER ENCRYPTED CONFIGURATION (steadfast_config)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.steadfast_config (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    api_key_encrypted TEXT NOT NULL DEFAULT '',
    secret_key_encrypted TEXT NOT NULL DEFAULT '',
    is_connected BOOLEAN NOT NULL DEFAULT false,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security: Completely blocked from public clients
ALTER TABLE public.steadfast_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to steadfast_config" ON public.steadfast_config;
CREATE POLICY "Allow service_role full access to steadfast_config"
    ON public.steadfast_config
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Automatic updated_at trigger for steadfast_config
DROP TRIGGER IF EXISTS trigger_steadfast_config_updated_at ON public.steadfast_config;
CREATE TRIGGER trigger_steadfast_config_updated_at
    BEFORE UPDATE ON public.steadfast_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_site_settings_updated_at();

-- ------------------------------------------------------------------------------
-- 6. SUPABASE STORAGE BUCKETS (book-covers, book-banners, book-files)
-- ------------------------------------------------------------------------------

-- Public bucket for book cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public bucket for promotional banner images
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-banners', 'book-banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Private bucket for downloadable book files or preview PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-files', 'book-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Public read access for cover images and banners
DROP POLICY IF EXISTS "Public read access for book-covers" ON storage.objects;
CREATE POLICY "Public read access for book-covers"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'book-covers');

DROP POLICY IF EXISTS "Public read access for book-banners" ON storage.objects;
CREATE POLICY "Public read access for book-banners"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'book-banners');

-- Storage Policies: Service role has full control for uploads and deletions
DROP POLICY IF EXISTS "Service role manage book-covers" ON storage.objects;
CREATE POLICY "Service role manage book-covers"
    ON storage.objects FOR ALL
    TO service_role
    USING (bucket_id = 'book-covers')
    WITH CHECK (bucket_id = 'book-covers');

DROP POLICY IF EXISTS "Service role manage book-banners" ON storage.objects;
CREATE POLICY "Service role manage book-banners"
    ON storage.objects FOR ALL
    TO service_role
    USING (bucket_id = 'book-banners')
    WITH CHECK (bucket_id = 'book-banners');

DROP POLICY IF EXISTS "Service role manage book-files" ON storage.objects;
CREATE POLICY "Service role manage book-files"
    ON storage.objects FOR ALL
    TO service_role
    USING (bucket_id = 'book-files')
    WITH CHECK (bucket_id = 'book-files');

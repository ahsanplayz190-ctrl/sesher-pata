-- ==============================================================================
-- শেষের পাতা (Sesher Pata) — Hardened Supabase Schema & Site Settings Migration
-- ==============================================================================
-- Run this SQL in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- Strictly hardened for production readiness and Row Level Security (RLS).
-- ==============================================================================

-- 1. Create site_settings table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default_settings',
    meta_pixel_id TEXT DEFAULT '',
    meta_pixel_enabled BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert initial default configuration if not present
INSERT INTO public.site_settings (id, meta_pixel_id, meta_pixel_enabled, updated_at)
VALUES ('default_settings', '', false, now())
ON CONFLICT (id) DO NOTHING;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS POLICIES: PRINCIPLE OF LEAST PRIVILEGE
-- ------------------------------------------------------------------------------

-- 4. Policy: Allow READ ONLY access to anyone (anon & authenticated)
-- The frontend visitor needs to read the Pixel ID and enabled status to load the tracker.
DROP POLICY IF EXISTS "Allow public read access to site_settings" ON public.site_settings;
CREATE POLICY "Allow public read access to site_settings"
    ON public.site_settings
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 5. Policy: Strictly DENY anonymous / normal user updates.
-- ONLY the server-side service_role (used by the secure /api/admin/settings route)
-- can update or modify site_settings.
DROP POLICY IF EXISTS "Allow update access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow service_role update access to site_settings" ON public.site_settings;
CREATE POLICY "Allow service_role update access to site_settings"
    ON public.site_settings
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. Policy: Strictly DENY anonymous / normal user inserts.
-- Only service_role can insert configuration rows.
DROP POLICY IF EXISTS "Allow insert access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow service_role insert access to site_settings" ON public.site_settings;
CREATE POLICY "Allow service_role insert access to site_settings"
    ON public.site_settings
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- 7. Policy: Strictly DENY anonymous / normal user deletes.
-- Only service_role can delete.
DROP POLICY IF EXISTS "Allow delete access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow service_role delete access to site_settings" ON public.site_settings;
CREATE POLICY "Allow service_role delete access to site_settings"
    ON public.site_settings
    FOR DELETE
    TO service_role
    USING (true);

-- 8. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
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
    EXECUTE FUNCTION update_site_settings_updated_at();

-- Verification:
-- SELECT * FROM public.site_settings WHERE id = 'default_settings';

import { NextRequest, NextResponse } from 'next/server';
import { isRequestAuthorized } from '../../../../src/lib/serverAuth';
import { getServerSupabaseClient } from '../../../../src/lib/serverSupabase';
import { SiteSettings } from '../../../../src/types';

export async function POST(request: NextRequest) {
  // 1. Authorization check: Only authenticated admins are allowed
  const authorized = isRequestAuthorized(request);
  if (!authorized) {
    return NextResponse.json(
      { error: 'অননুমোদিত: শুধুমাত্র অনুমোদিত অ্যাডমিন সেটিংস পরিবর্তন করতে পারবেন।' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { meta_pixel_id, meta_pixel_enabled } = body || {};

    // 2. Validate and sanitize input
    const sanitizedId = typeof meta_pixel_id === 'string' ? meta_pixel_id.trim().replace(/\s+/g, '') : '';
    const sanitizedEnabled = Boolean(meta_pixel_enabled);
    const updatedAt = new Date().toISOString();

    const updatedSettings: SiteSettings = {
      id: 'default_settings',
      meta_pixel_id: sanitizedId,
      meta_pixel_enabled: sanitizedEnabled,
      updated_at: updatedAt,
    };

    // 3. Persist to Supabase if connected
    const supabase = getServerSupabaseClient();
    if (supabase) {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 'default_settings',
          meta_pixel_id: sanitizedId,
          meta_pixel_enabled: sanitizedEnabled,
          updated_at: updatedAt,
        });

      if (error) {
        console.error('[Admin Settings API] Supabase update failed:', error.message);
        return NextResponse.json(
          { error: `ডেটাবেজে সংরক্ষণ ব্যর্থ হয়েছে: ${error.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে',
    });
  } catch (err: any) {
    console.error('[Admin Settings API Error]:', err);
    return NextResponse.json(
      { error: 'সেটিংস সংরক্ষণে অভ্যন্তরীণ সমস্যা দেখা দিয়েছে' },
      { status: 500 }
    );
  }
}

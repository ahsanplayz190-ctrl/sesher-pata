import { NextRequest, NextResponse } from 'next/server';
import { isRequestAuthorized } from '../../../../src/lib/serverAuth';
import { getServerSupabaseClient } from '../../../../src/lib/serverSupabase';
import { SiteSettings } from '../../../../src/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const {
      meta_pixel_id,
      meta_pixel_enabled,
      phone,
      alt_phone,
      email,
      address,
      support_hours,
      announcement_badge,
      announcement_text,
      about_text,
      facebook_url,
      instagram_url,
      whatsapp_number,
      steadfast_api_key,
      steadfast_secret_key,
      steadfast_enabled,
      delivery_charge_inside,
      delivery_charge_outside,
      free_delivery_threshold,
    } = body || {};

    // 2. Validate and sanitize input
    const sanitizedId = typeof meta_pixel_id === 'string' ? meta_pixel_id.trim().replace(/\s+/g, '') : '';
    const sanitizedEnabled = Boolean(meta_pixel_enabled);
    const updatedAt = new Date().toISOString();

    const updatedSettings: SiteSettings = {
      id: 'default_settings',
      meta_pixel_id: sanitizedId,
      meta_pixel_enabled: sanitizedEnabled,
      phone: typeof phone === 'string' ? phone.trim() : undefined,
      alt_phone: typeof alt_phone === 'string' ? alt_phone.trim() : undefined,
      email: typeof email === 'string' ? email.trim() : undefined,
      address: typeof address === 'string' ? address.trim() : undefined,
      support_hours: typeof support_hours === 'string' ? support_hours.trim() : undefined,
      announcement_badge: typeof announcement_badge === 'string' ? announcement_badge.trim() : undefined,
      announcement_text: typeof announcement_text === 'string' ? announcement_text.trim() : undefined,
      about_text: typeof about_text === 'string' ? about_text.trim() : undefined,
      facebook_url: typeof facebook_url === 'string' ? facebook_url.trim() : undefined,
      instagram_url: typeof instagram_url === 'string' ? instagram_url.trim() : undefined,
      whatsapp_number: typeof whatsapp_number === 'string' ? whatsapp_number.trim() : undefined,
      steadfast_api_key: typeof steadfast_api_key === 'string' ? steadfast_api_key.trim() : undefined,
      steadfast_secret_key: typeof steadfast_secret_key === 'string' ? steadfast_secret_key.trim() : undefined,
      steadfast_enabled: typeof steadfast_enabled === 'boolean' ? steadfast_enabled : undefined,
      delivery_charge_inside: delivery_charge_inside !== undefined ? Number(delivery_charge_inside) : undefined,
      delivery_charge_outside: delivery_charge_outside !== undefined ? Number(delivery_charge_outside) : undefined,
      free_delivery_threshold: free_delivery_threshold !== undefined ? Number(free_delivery_threshold) : undefined,
      updated_at: updatedAt,
    };

    // 3. Persist to Supabase if connected
    const supabase = getServerSupabaseClient();
    if (supabase) {
      const payload: Record<string, any> = {
        id: 'default_settings',
        meta_pixel_id: sanitizedId,
        meta_pixel_enabled: sanitizedEnabled,
        updated_at: updatedAt,
      };

      if (updatedSettings.phone !== undefined) payload.phone = updatedSettings.phone;
      if (updatedSettings.alt_phone !== undefined) payload.alt_phone = updatedSettings.alt_phone;
      if (updatedSettings.email !== undefined) payload.email = updatedSettings.email;
      if (updatedSettings.address !== undefined) payload.address = updatedSettings.address;
      if (updatedSettings.support_hours !== undefined) payload.support_hours = updatedSettings.support_hours;
      if (updatedSettings.announcement_badge !== undefined) payload.announcement_badge = updatedSettings.announcement_badge;
      if (updatedSettings.announcement_text !== undefined) payload.announcement_text = updatedSettings.announcement_text;
      if (updatedSettings.about_text !== undefined) payload.about_text = updatedSettings.about_text;
      if (updatedSettings.facebook_url !== undefined) payload.facebook_url = updatedSettings.facebook_url;
      if (updatedSettings.instagram_url !== undefined) payload.instagram_url = updatedSettings.instagram_url;
      if (updatedSettings.whatsapp_number !== undefined) payload.whatsapp_number = updatedSettings.whatsapp_number;
      if (updatedSettings.steadfast_enabled !== undefined) payload.steadfast_enabled = updatedSettings.steadfast_enabled;
      if (updatedSettings.delivery_charge_inside !== undefined) payload.delivery_charge_inside = updatedSettings.delivery_charge_inside;
      if (updatedSettings.delivery_charge_outside !== undefined) payload.delivery_charge_outside = updatedSettings.delivery_charge_outside;
      if (updatedSettings.free_delivery_threshold !== undefined) payload.free_delivery_threshold = updatedSettings.free_delivery_threshold;

      const { error } = await supabase
        .from('site_settings')
        .upsert(payload);

      if (error) {
        console.warn('[Admin Settings API] Supabase full upsert failed, retrying minimal:', error.message);
        // If some columns do not exist yet in their table schema, retry with basic columns so pixel still saves
        try {
          await supabase
            .from('site_settings')
            .upsert({
              id: 'default_settings',
              meta_pixel_id: sanitizedId,
              meta_pixel_enabled: sanitizedEnabled,
              updated_at: updatedAt,
            });
        } catch (fallbackErr) {
          console.error('Fallback upsert failed:', fallbackErr);
        }
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

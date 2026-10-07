import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isRequestAuthorized } from '../../../../src/lib/serverAuth';
import { getServerSupabaseClient } from '../../../../src/lib/serverSupabase';
import { Author } from '../../../../src/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET: Fetch authors from database.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, authors: [] });
    }

    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      // Table may not exist yet in schema cache (PGRST205)
      if (error.code === 'PGRST205' || error.message?.includes('not find')) {
        return NextResponse.json({ success: true, authors: [], tableMissing: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const normalized = (data || []).map((row: any) => ({
      id: String(row.id),
      name: row.name || '',
      era: row.era || '',
      role: row.role || '',
      bio: row.bio || '',
      image: row.image || row.image_url || '',
      image_url: row.image_url || row.image || '',
      bookCount: Number(row.book_count ?? row.bookCount ?? 0),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return NextResponse.json({ success: true, authors: normalized });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

/**
 * POST / PUT: Update or create an author by exact unique ID.
 * Strictly verified: only authenticated admins can update authors.
 */
export async function POST(request: NextRequest) {
  return handleAuthorSave(request);
}

export async function PUT(request: NextRequest) {
  return handleAuthorSave(request);
}

async function handleAuthorSave(request: NextRequest) {
  const authorized = isRequestAuthorized(request);
  if (!authorized) {
    return NextResponse.json(
      { error: 'অননুমোদিত: লেখক পরিবর্তনের জন্য অ্যাডমিন লগইন প্রয়োজন।' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, name, era, role, bio, image, image_url, bookCount, book_count } = body || {};

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json(
        { error: 'লেখকের ইউনিক আইডি (ID) আবশ্যক।' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'লেখকের নাম প্রদান করা আবশ্যক।' },
        { status: 400 }
      );
    }

    const cleanId = id.trim();
    const cleanName = name.trim();
    const cleanEra = (era || '').trim();
    const cleanRole = (role || 'কথাসাহিত্যিক ও লেখক').trim();
    const cleanBio = (bio || '').trim();
    const cleanImage = (image || image_url || '').trim();
    const cleanBookCount = Number(bookCount ?? book_count ?? 0);
    const now = new Date().toISOString();

    const authorData: Author = {
      id: cleanId,
      name: cleanName,
      era: cleanEra,
      role: cleanRole,
      bio: cleanBio,
      image: cleanImage,
      image_url: cleanImage,
      bookCount: cleanBookCount,
      updated_at: now,
    };

    const supabase = getServerSupabaseClient();
    if (supabase) {
      // 1. Check if author exists
      const { data: existing } = await supabase
        .from('authors')
        .select('id')
        .eq('id', cleanId)
        .maybeSingle();

      const dbPayload = {
        id: cleanId,
        name: cleanName,
        era: cleanEra,
        role: cleanRole,
        bio: cleanBio,
        image: cleanImage,
        image_url: cleanImage,
        book_count: cleanBookCount,
        updated_at: now,
      };

      if (existing) {
        // UPDATE authors SET image = $image, image_url = $image ... WHERE id = cleanId
        const { error: updateError } = await supabase
          .from('authors')
          .update(dbPayload)
          .eq('id', cleanId);

        if (updateError) {
          console.error('[Admin Authors API] Update Error:', updateError);
          return NextResponse.json(
            { error: `লেখক ডাটাবেজ আপডেট ব্যর্থ: ${updateError.message}` },
            { status: 500 }
          );
        }
      } else {
        // INSERT into authors
        const { error: insertError } = await supabase
          .from('authors')
          .insert({
            ...dbPayload,
            created_at: now,
          });

        if (insertError) {
          console.error('[Admin Authors API] Insert Error:', insertError);
          return NextResponse.json(
            { error: `লেখক ডাটাবেজ সেভ ব্যর্থ: ${insertError.message}` },
            { status: 500 }
          );
        }
      }
    }

    try {
      revalidatePath('/');
      revalidatePath('/seshadmin');
      revalidatePath('/api/admin/authors');
    } catch {
      // Ignore revalidation errors
    }

    return NextResponse.json({
      success: true,
      author: authorData,
      message: `লেখক "${cleanName}" সফলভাবে সংরক্ষিত হয়েছে!`,
    });
  } catch (err: any) {
    console.error('[Admin Authors API Error]:', err);
    return NextResponse.json(
      { error: err.message || 'লেখক আপডেটে অভ্যন্তরীণ সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove an author by unique ID.
 */
export async function DELETE(request: NextRequest) {
  const authorized = isRequestAuthorized(request);
  if (!authorized) {
    return NextResponse.json(
      { error: 'অননুমোদিত: লেখক মুছে ফেলার জন্য অ্যাডমিন লগইন প্রয়োজন।' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'আইডি আবশ্যক' }, { status: 400 });
  }

  const supabase = getServerSupabaseClient();
  if (supabase) {
    await supabase.from('authors').delete().eq('id', id);
  }

  try {
    revalidatePath('/');
    revalidatePath('/seshadmin');
  } catch {}

  return NextResponse.json({ success: true });
}

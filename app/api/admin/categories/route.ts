import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isRequestAuthorized } from '../../../../src/lib/serverAuth';
import { getServerSupabaseClient } from '../../../../src/lib/serverSupabase';
import { Category } from '../../../../src/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET: Fetch categories from database.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, categories: [] });
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      // Table may not exist yet in schema cache (PGRST205)
      if (error.code === 'PGRST205' || error.message?.includes('not find')) {
        return NextResponse.json({ success: true, categories: [], tableMissing: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const normalized = (data || []).map((row: any) => ({
      id: String(row.id),
      name: row.name || '',
      englishName: row.english_name || row.englishName || row.name || '',
      iconName: row.icon_name || row.iconName || 'BookOpen',
      imageUrl: row.image_url || row.image || row.imageUrl || '',
      image: row.image || row.image_url || row.imageUrl || '',
      bookCount: Number(row.book_count ?? row.bookCount ?? 0),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return NextResponse.json({ success: true, categories: normalized });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

/**
 * POST / PUT: Update or create a category by exact unique ID.
 * Strictly verified: only authenticated admins can update categories.
 */
export async function POST(request: NextRequest) {
  return handleCategorySave(request);
}

export async function PUT(request: NextRequest) {
  return handleCategorySave(request);
}

async function handleCategorySave(request: NextRequest) {
  const authorized = isRequestAuthorized(request);
  if (!authorized) {
    return NextResponse.json(
      { error: 'অননুমোদিত: ক্যাটাগরি পরিবর্তনের জন্য অ্যাডমিন লগইন প্রয়োজন।' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, name, englishName, english_name, imageUrl, image, iconName, icon_name, bookCount, book_count } = body || {};

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json(
        { error: 'ক্যাটাগরির ইউনিক আইডি (ID) আবশ্যক।' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'ক্যাটাগরির নাম প্রদান করা আবশ্যক।' },
        { status: 400 }
      );
    }

    const cleanId = id.trim();
    const cleanName = name.trim();
    const cleanEnglishName = (englishName || english_name || cleanName).trim();
    const cleanImage = (imageUrl || image || '').trim();
    const cleanIcon = (iconName || icon_name || 'BookOpen').trim();
    const cleanBookCount = Number(bookCount ?? book_count ?? 0);
    const now = new Date().toISOString();

    const categoryData: Category = {
      id: cleanId,
      name: cleanName,
      englishName: cleanEnglishName,
      iconName: cleanIcon,
      imageUrl: cleanImage,
      image: cleanImage,
      bookCount: cleanBookCount,
      updated_at: now,
    };

    const supabase = getServerSupabaseClient();
    if (supabase) {
      // 1. Check if category exists
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('id', cleanId)
        .maybeSingle();

      const dbPayload = {
        id: cleanId,
        name: cleanName,
        english_name: cleanEnglishName,
        icon_name: cleanIcon,
        image: cleanImage,
        image_url: cleanImage,
        book_count: cleanBookCount,
        updated_at: now,
      };

      if (existing) {
        // UPDATE categories SET image = $image, image_url = $image ... WHERE id = cleanId
        const { error: updateError } = await supabase
          .from('categories')
          .update(dbPayload)
          .eq('id', cleanId);

        if (updateError) {
          console.error('[Admin Categories API] Update Error:', updateError);
          return NextResponse.json(
            { error: `ক্যাটাগরি ডাটাবেজ আপডেট ব্যর্থ: ${updateError.message}` },
            { status: 500 }
          );
        }
      } else {
        // INSERT into categories
        const { error: insertError } = await supabase
          .from('categories')
          .insert({
            ...dbPayload,
            created_at: now,
          });

        if (insertError) {
          console.error('[Admin Categories API] Insert Error:', insertError);
          return NextResponse.json(
            { error: `ক্যাটাগরি ডাটাবেজ সেভ ব্যর্থ: ${insertError.message}` },
            { status: 500 }
          );
        }
      }
    }

    try {
      revalidatePath('/');
      revalidatePath('/seshadmin');
      revalidatePath('/api/admin/categories');
    } catch {
      // Ignore revalidation errors
    }

    return NextResponse.json({
      success: true,
      category: categoryData,
      message: `ক্যাটাগরি "${cleanName}" সফলভাবে সংরক্ষিত হয়েছে!`,
    });
  } catch (err: any) {
    console.error('[Admin Categories API Error]:', err);
    return NextResponse.json(
      { error: err.message || 'ক্যাটাগরি আপডেটে অভ্যন্তরীণ সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove a category by unique ID.
 */
export async function DELETE(request: NextRequest) {
  const authorized = isRequestAuthorized(request);
  if (!authorized) {
    return NextResponse.json(
      { error: 'অননুমোদিত: ক্যাটাগরি মুছে ফেলার জন্য অ্যাডমিন লগইন প্রয়োজন।' },
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
    await supabase.from('categories').delete().eq('id', id);
  }

  try {
    revalidatePath('/');
    revalidatePath('/seshadmin');
  } catch {}

  return NextResponse.json({ success: true });
}

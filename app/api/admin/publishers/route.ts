import { NextRequest, NextResponse } from 'next/server';
import { isRequestAuthorized } from '../../../../src/lib/serverAuth';
import { getServerSupabaseClient } from '../../../../src/lib/serverSupabase';
import { Publisher } from '../../../../src/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET: Fetch publishers from database (if table exists).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, publishers: [] });
    }

    const { data, error } = await supabase
      .from('publishers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('not find')) {
        return NextResponse.json({ success: true, publishers: [], tableMissing: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const normalized = (data || []).map((row: any) => ({
      id: String(row.id),
      name: row.name || '',
      description: row.description || '',
      location: row.location || '',
      established: row.established || '',
      logo: row.logo || '',
      bookCount: Number(row.book_count ?? row.bookCount ?? 0),
    }));

    return NextResponse.json({ success: true, publishers: normalized });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

/**
 * POST / PUT: Save or update publisher.
 */
export async function POST(request: NextRequest) {
  return handlePublisherSave(request);
}

export async function PUT(request: NextRequest) {
  return handlePublisherSave(request);
}

async function handlePublisherSave(request: NextRequest) {
  const authorized = isRequestAuthorized(request);
  if (!authorized) {
    return NextResponse.json(
      { error: 'অননুমোদিত: প্রকাশনী পরিবর্তনের জন্য অ্যাডমিন লগইন প্রয়োজন।' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, name, description, location, established, logo, bookCount } = body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'প্রকাশনীর নাম প্রদান করা আবশ্যক।' },
        { status: 400 }
      );
    }

    const cleanId = (id || `pub-${Date.now()}`).trim();
    const cleanName = name.trim();
    const cleanDesc = (description || '').trim();
    const cleanLocation = (location || 'ঢাকা').trim();
    const cleanEstablished = (established || '').trim();
    const cleanLogo = (logo || '').trim();
    const cleanBookCount = Number(bookCount || 0);

    const pubData: Publisher = {
      id: cleanId,
      name: cleanName,
      description: cleanDesc,
      location: cleanLocation,
      established: cleanEstablished,
      logo: cleanLogo,
      bookCount: cleanBookCount,
    };

    const supabase = getServerSupabaseClient();
    if (supabase) {
      try {
        const { error: upsertError } = await supabase.from('publishers').upsert({
          id: cleanId,
          name: cleanName,
          description: cleanDesc,
          location: cleanLocation,
          established: cleanEstablished,
          logo: cleanLogo,
          book_count: cleanBookCount,
        });

        if (upsertError && upsertError.code !== 'PGRST205' && !upsertError.message?.includes('not find')) {
          console.warn('[Admin Publishers API] Supabase upsert error:', upsertError.message);
        }
      } catch (dbErr) {
        console.warn('[Admin Publishers API] DB operation error:', dbErr);
      }
    }

    return NextResponse.json({ success: true, publisher: pubData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

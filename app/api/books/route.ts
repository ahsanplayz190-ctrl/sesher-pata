import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '../../../src/lib/serverSupabase';
import { BOOKS as INITIAL_BOOKS } from '../../../src/data/books';
import { bookToRow, rowToBook } from '../../../src/services/bookService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/books
 * Public endpoint to fetch all books from the central Supabase database.
 * Auto-seeds default books if the table is empty.
 * First-party endpoint ensures no ad-blockers block client-side requests.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();
    if (!supabase) {
      // Supabase credentials not configured, fallback to initial catalog
      return NextResponse.json({
        success: true,
        books: INITIAL_BOOKS,
        count: INITIAL_BOOKS.length,
        fallback: true,
      });
    }

    // 1. Fetch active books ordered by creation date
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[API /api/books] Supabase fetch error:', error.message);
      return NextResponse.json({
        success: true,
        books: INITIAL_BOOKS,
        count: INITIAL_BOOKS.length,
        fallback: true,
        error: error.message,
      });
    }

    // 2. If table is completely empty, auto-seed with INITIAL_BOOKS
    if (!data || data.length === 0) {
      try {
        const rows = INITIAL_BOOKS.map(bookToRow);
        for (let i = 0; i < rows.length; i += 20) {
          const chunk = rows.slice(i, i + 20);
          await supabase.from('books').upsert(chunk, { onConflict: 'id' });
        }
        return NextResponse.json(
          {
            success: true,
            books: INITIAL_BOOKS,
            count: INITIAL_BOOKS.length,
            autoSeeded: true,
          },
          {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          }
        );
      } catch (seedErr) {
        console.warn('[API /api/books] Auto-seed error:', seedErr);
        return NextResponse.json({
          success: true,
          books: INITIAL_BOOKS,
          count: INITIAL_BOOKS.length,
          fallback: true,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        books: data,
        count: data.length,
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/books] Internal error:', err);
    return NextResponse.json({
      success: true,
      books: INITIAL_BOOKS,
      count: INITIAL_BOOKS.length,
      fallback: true,
    });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { isRequestAuthorized } from '../../../../../src/lib/serverAuth';
import { getServerSupabaseClient } from '../../../../../src/lib/serverSupabase';
import { bookToRow } from '../../../../../src/services/bookService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface FailedRecord {
  index: number;
  title: string;
  reason: string;
}

/**
 * POST /api/admin/books/import
 * Bulk JSON book import and restore endpoint.
 * Accepts 1 to 500+ books in a single request.
 * Safely validates, resolves unique IDs, prevents unwanted duplicates,
 * and performs batched UPSERT operations in Supabase.
 */
export async function POST(request: NextRequest) {
  // 1. Authenticate request using server session
  const authorized = isRequestAuthorized(request);
  if (!authorized) {
    return NextResponse.json(
      { error: 'অননুমোদিত অ্যাক্সেস: বই ইমপোর্ট করার জন্য অ্যাডমিন লগইন প্রয়োজন।' },
      { status: 401 }
    );
  }

  // 2. Initialize privileged server Supabase client
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase ডাটাবেজ কানেক্টেড নয় বা সার্ভিস কী কনফিগার করা হয়নি।' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: 'অবৈধ JSON ডেটা: কোনো বিষয়বস্তু পাওয়া যায়নি।' },
        { status: 400 }
      );
    }

    // 3. Extract books list from various JSON structures (array, { books: [] }, { data: [] }, or single object)
    let rawList: any[] = [];
    if (Array.isArray(body)) {
      rawList = body;
    } else if (body.books && Array.isArray(body.books)) {
      rawList = body.books;
    } else if (body.data && Array.isArray(body.data)) {
      rawList = body.data;
    } else if (body.items && Array.isArray(body.items)) {
      rawList = body.items;
    } else if (typeof body === 'object' && (body.title || body.bangla_name || body.english_name)) {
      rawList = [body];
    } else {
      return NextResponse.json(
        { error: 'ফাইলে কোনো বইয়ের তালিকা (array) খুঁজে পাওয়া যায়নি।' },
        { status: 400 }
      );
    }

    if (rawList.length === 0) {
      return NextResponse.json(
        { error: 'বইয়ের তালিকা খালি। অন্তত একটি বই থাকা আবশ্যক।' },
        { status: 400 }
      );
    }

    // 4. Pre-fetch existing book identifiers for duplicate matching
    const { data: existingBooks, error: fetchErr } = await supabase
      .from('books')
      .select('id, isbn, title, author');

    if (fetchErr) {
      console.error('[Bulk Import API] Failed to fetch existing books for duplicate check:', fetchErr);
    }

    const existingIdSet = new Set<string>();
    const existingByIsbn = new Map<string, string>();
    const existingByTitleAuthor = new Map<string, string>();

    (existingBooks || []).forEach((b: any) => {
      const bId = String(b.id || '').trim();
      if (bId) existingIdSet.add(bId);

      const isbnClean = String(b.isbn || '').trim().toLowerCase();
      if (isbnClean) existingByIsbn.set(isbnClean, bId);

      const tClean = String(b.title || '').trim().toLowerCase();
      const aClean = String(b.author || '').trim().toLowerCase();
      if (tClean) {
        existingByTitleAuthor.set(`${tClean}:::${aClean}`, bId);
      }
    });

    // 5. Validate, normalize, and resolve IDs for each book
    const validRows: Record<string, any>[] = [];
    const failedRecords: FailedRecord[] = [];
    let updatedCount = 0;
    let newCount = 0;

    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];
      const recordNumber = i + 1;

      if (!item || typeof item !== 'object') {
        failedRecords.push({
          index: recordNumber,
          title: `রেকর্ড #${recordNumber}`,
          reason: 'অবৈধ অবজেক্ট ডেটা',
        });
        continue;
      }

      // Validate title existence
      const rawTitle = (item.title || item.bangla_name || item.title_bn || item.english_name || '').toString().trim();
      if (!rawTitle) {
        failedRecords.push({
          index: recordNumber,
          title: `রেকর্ড #${recordNumber}`,
          reason: 'বইয়ের শিরোনাম (title) অনুপস্থিত',
        });
        continue;
      }

      // Resolve Stable Identifier
      let resolvedId = item.id ? String(item.id).trim() : '';
      let isExisting = false;

      if (resolvedId && existingIdSet.has(resolvedId)) {
        isExisting = true;
      } else if (!resolvedId) {
        const itemIsbn = (item.isbn || '').toString().trim().toLowerCase();
        const itemAuthor = (item.author || '').toString().trim().toLowerCase();
        const titleKey = `${rawTitle.toLowerCase()}:::${itemAuthor}`;

        if (itemIsbn && existingByIsbn.has(itemIsbn)) {
          resolvedId = existingByIsbn.get(itemIsbn)!;
          isExisting = true;
        } else if (existingByTitleAuthor.has(titleKey)) {
          resolvedId = existingByTitleAuthor.get(titleKey)!;
          isExisting = true;
        } else if (itemIsbn) {
          // Stable ID from ISBN so re-importing identical files maintains identity
          const cleanIsbnStr = itemIsbn.replace(/[^a-z0-9]/gi, '');
          resolvedId = `book-isbn-${cleanIsbnStr}`;
          if (existingIdSet.has(resolvedId)) {
            isExisting = true;
          }
        } else {
          // Stable deterministic hash from title + author
          const hash = crypto
            .createHash('sha256')
            .update(`${rawTitle}:::${itemAuthor}`)
            .digest('hex')
            .slice(0, 16);
          resolvedId = `book-sp-${hash}`;
          if (existingIdSet.has(resolvedId)) {
            isExisting = true;
          }
        }
      } else {
        // resolvedId was explicitly provided in JSON but does not yet exist in DB
        isExisting = false;
      }

      // Track into lookups so subsequent books within the same JSON payload resolve consistently
      existingIdSet.add(resolvedId);
      if (item.isbn) {
        existingByIsbn.set(String(item.isbn).trim().toLowerCase(), resolvedId);
      }

      if (isExisting) {
        updatedCount++;
      } else {
        newCount++;
      }

      // Transform into a completely independent database row
      const row = bookToRow({
        ...item,
        id: resolvedId,
      });

      validRows.push(row);
    }

    if (validRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          total: rawList.length,
          imported: 0,
          updated: 0,
          failed: failedRecords.length,
          failedRecords,
          error: 'কোনো বৈধ বই পাওয়া যায়নি। অনুগ্রহ করে ত্রুটিযুক্ত রেকর্ডগুলো পরীক্ষা করুন।',
        },
        { status: 400 }
      );
    }

    // 6. Bulk UPSERT in batches of 50 to guarantee performance and avoid payload/timeout limits
    const BATCH_SIZE = 50;
    const errors: string[] = [];

    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE);
      const { error: upsertErr } = await supabase
        .from('books')
        .upsert(batch, { onConflict: 'id' });

      if (upsertErr) {
        console.error(`[Bulk Import API] Error upserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, upsertErr);
        errors.push(`ব্যাচ ${Math.floor(i / BATCH_SIZE) + 1} আপলোড ব্যর্থ: ${upsertErr.message}`);
      }
    }

    if (errors.length > 0 && validRows.length === errors.length * BATCH_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `ডাটাবেজ সংরক্ষণ ব্যর্থ হয়েছে: ${errors.join(', ')}`,
        },
        { status: 500 }
      );
    }

    // 7. Invalidate Next.js cache so the public site and admin immediately reflect the changes
    try {
      revalidatePath('/');
      revalidatePath('/api/books');
      revalidatePath('/seshadmin');
    } catch (e) {
      // Ignore cache revalidation errors
    }

    const message = `${validRows.length}টি বই সফলভাবে প্রসেস হয়েছে (${newCount}টি নতুন, ${updatedCount}টি আপডেট)${
      failedRecords.length > 0 ? `, ${failedRecords.length}টি ব্যর্থ` : ''
    }।`;

    return NextResponse.json({
      success: true,
      total: rawList.length,
      imported: newCount,
      updated: updatedCount,
      failed: failedRecords.length,
      failedRecords,
      message,
    });
  } catch (err: any) {
    console.error('[Bulk Import API Exception]:', err);
    return NextResponse.json(
      { error: err.message || 'সার্ভারে অভ্যন্তরীণ ত্রুটি হয়েছে' },
      { status: 500 }
    );
  }
}

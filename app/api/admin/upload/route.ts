import { NextRequest, NextResponse } from 'next/server';
import { isRequestAuthorized } from '../../../../src/lib/serverAuth';
import { getServerSupabaseClient } from '../../../../src/lib/serverSupabase';

/**
 * POST: Upload image/file to Supabase Storage.
 * Strictly verified: only authenticated admins can upload files.
 */
export async function POST(request: NextRequest) {
  const authorized = isRequestAuthorized(request);
  if (!authorized) {
    return NextResponse.json(
      { error: 'অননুমোদিত: ছবি আপলোডের জন্য অ্যাডমিন লগইন প্রয়োজন।' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'book-covers';

    if (!file) {
      return NextResponse.json(
        { error: 'কোনো ফাইল পাওয়া যায়নি।' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase কানেকশন পাওয়া যায়নি। দয়া করে কনফিগারেশন চেক করুন।' },
        { status: 503 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize filename and create unique storage path
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedImageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
    const allowedDocExts = ['pdf', 'epub', 'txt'];

    if (bucket === 'book-covers' || bucket === 'book-banners') {
      if (!allowedImageExts.includes(extension)) {
        return NextResponse.json(
          { error: `অননুমোদিত ইমেজ ফরম্যাট। অনুমোদিত ফরম্যাট: ${allowedImageExts.join(', ')}` },
          { status: 400 }
        );
      }
    } else if (bucket === 'book-files') {
      if (!allowedDocExts.includes(extension)) {
        return NextResponse.json(
          { error: `অননুমোদিত ফাইল ফরম্যাট। অনুমোদিত ফরম্যাট: ${allowedDocExts.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const cleanBaseName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);
    const fileName = `${Date.now()}-${cleanBaseName || 'upload'}.${extension || 'jpg'}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('[Admin Upload API] Storage upload error:', uploadError);
      return NextResponse.json(
        { error: `স্টোরেজ আপলোড ব্যর্থ: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName,
      bucket,
    });
  } catch (err: any) {
    console.error('[Admin Upload API Error]:', err);
    return NextResponse.json(
      { error: err.message || 'ফাইল আপলোডে অভ্যন্তরীণ ত্রুটি হয়েছে' },
      { status: 500 }
    );
  }
}
